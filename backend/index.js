require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// ── Base de datos (PostgreSQL / Sequelize) ──────────────────────────
const sequelize = require('./db');
// Cargar asociaciones (debe ser ANTES de sync y de las rutas)
const { Driver, Order, LocationHistory } = require('./models/associations');

// ── Rutas ────────────────────────────────────────────────────────────
const ordersRouter = require('./routes/orders');
const driversRouter = require('./routes/drivers');
const authRouter = require('./routes/auth');
const companiesRouter = require('./routes/companies');
const statsRouter = require('./routes/stats');
const publicAuthRouter = require('./routes/publicAuth');
const billingRouter = require('./routes/billing');
const usersRouter = require('./routes/users');
const driverPortalRouter = require('./routes/driverPortal');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// ── Middlewares ────────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigin =
  process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'http://localhost'
    : '*';

app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos subidos (firmas y fotos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rate Limiting ──────────────────────────────────────────────────────
const { createRateLimiter } = require('./middleware/rateLimiter');
const globalLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 300 });
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Demasiados intentos de acceso desde esta IP. Por favor intenta nuevamente en 15 minutos.',
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);

// ── Rutas API ─────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/driver', driverPortalRouter);
app.use('/api/users', usersRouter);
app.use('/api/publicAuth', publicAuthRouter);
app.use('/api/billing', billingRouter);

// ── Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Socket.io: Lógica en tiempo real ──────────────────────────────────
// Fórmula Haversine para calcular distancia en metros
const haversineDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const geofenceAlertsCache = {};

io.on('connection', (socket) => {
  console.log(`🔌 Usuario conectado: ${socket.id}`);

  socket.on('join_company', (companyId) => {
    socket.join(companyId);
    socket.companyId = companyId;
    console.log(`🏢 Socket ${socket.id} unido a empresa: ${companyId}`);
  });

  socket.on('driver_location_update', async (data) => {
    if (socket.companyId) {
      io.to(socket.companyId).emit('driver_location_update', data);

      // Actualizar ubicación actual del conductor en PostgreSQL
      try {
        await Driver.update(
          { locationLat: data.location.lat, locationLng: data.location.lng },
          { where: { id: data.driverId } }
        );
      } catch (err) {
        console.error('Error actualizando ubicación de conductor en DB:', err);
      }

      // Lógica de Geocercas
      try {
        const activeOrders = await Order.findAll({
          where: { driverId: data.driverId, status: 'in-transit' },
        });

        for (const order of activeOrders) {
          if (order.customerLat && order.customerLng) {
            const distance = haversineDistanceMeters(
              data.location.lat,
              data.location.lng,
              order.customerLat,
              order.customerLng
            );

            if (distance < 50) {
              const cacheKey = `${order.id}`;
              const now = Date.now();
              if (!geofenceAlertsCache[cacheKey] || now - geofenceAlertsCache[cacheKey] > 5 * 60 * 1000) {
                geofenceAlertsCache[cacheKey] = now;
                io.to(socket.companyId).emit('driver_arrived', {
                  orderId: order.id,
                  orderNumber: order.orderNumber,
                  driverId: data.driverId,
                  distance: Math.round(distance),
                });
                const logger = require('./utils/logger');
                logger.info(`🚨 Geocerca: Driver ${data.driverId} llegó a destino de orden ${order.orderNumber} (${Math.round(distance)}m)`);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error calculando geocerca:', err);
      }

      // Guardar en historial de ubicación
      try {
        const today = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Lima',
          year: 'numeric', month: '2-digit', day: '2-digit',
        }).format(new Date());

        const point = { lat: data.location.lat, lng: data.location.lng, timestamp: new Date() };

        const [history, created] = await LocationHistory.findOrCreate({
          where: { driverId: data.driverId, date: today },
          defaults: {
            driverId: data.driverId,
            companyId: socket.companyId,
            date: today,
            path: [point],
          },
        });

        if (!created) {
          const currentPath = history.path || [];
          const lastPoint = currentPath[currentPath.length - 1];
          const dist = lastPoint
            ? Math.sqrt(Math.pow(point.lat - lastPoint.lat, 2) + Math.pow(point.lng - lastPoint.lng, 2))
            : 1;

          if (dist > 0.0002) {
            history.path = [...currentPath, point];
            await history.save();
          }
        }
      } catch (err) {
        console.error('Error guardando historial:', err);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Usuario desconectado: ${socket.id}`);
  });
});

// ── Conectar a PostgreSQL y sincronizar tablas ────────────────────────
const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ PostgreSQL conectado');
    // alter: true actualiza columnas sin borrar datos (usar migrate en producción real)
    return sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
  })
  .then(() => {
    console.log('✅ Tablas sincronizadas');
    server.listen(PORT, () =>
      console.log(`🚀 Tracky API & Real-time corriendo en http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ Error al conectar a PostgreSQL:', err);
    process.exit(1);
  });
