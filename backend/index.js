require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

// Modelos (Cargar antes que las rutas)
require('./models/Company');
require('./models/User');
require('./models/Order');
require('./models/Driver');

const ordersRouter = require('./routes/orders');
const driversRouter = require('./routes/drivers');
const authRouter = require('./routes/auth');
const companiesRouter = require('./routes/companies');
const statsRouter = require('./routes/stats');
const publicAuthRouter = require('./routes/publicAuth');
const billingRouter = require('./routes/billing');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Configuración de Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Adjuntar io a la petición para usarlo en las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(helmet());

const allowedOrigin = process.env.NODE_ENV === 'production' 
  ? (process.env.FRONTEND_URL || 'http://localhost') 
  : '*';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos subidos (firmas y fotos)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar Rate Limiters
const { createRateLimiter } = require('./middleware/rateLimiter');
const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300
});
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Demasiados intentos de acceso desde esta IP. Por favor intenta nuevamente en 15 minutos.'
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/driver', require('./routes/driverPortal'));
app.use('/api/users', require('./routes/users')); // Nueva ruta para gestión de cuentas
app.use('/api/publicAuth', publicAuthRouter);
app.use('/api/billing', billingRouter);

// Error Handling
app.use(errorHandler);

// Socket.io Logic
const LocationHistory = require('./models/LocationHistory');

// Fórmula Haversine para calcular distancia en metros entre dos puntos GPS
const haversineDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Radio de la Tierra en metros
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

// Registro de alertas geocercadas enviadas para evitar SPAM
const geofenceAlertsCache = {};

io.on('connection', (socket) => {
  console.log(`🔌 Usuario conectado: ${socket.id}`);

  socket.on('join_company', (companyId) => {
    socket.join(companyId);
    socket.companyId = companyId;
    console.log(`🏢 Socket ${socket.id} unido a empresa: ${companyId}`);
  });

  socket.on('driver_location_update', async (data) => {
    // console.log(`📍 Ubicación recibida de Driver ${data.driverId}:`, data.location);
    if (socket.companyId) {
      io.to(socket.companyId).emit('driver_location_update', data);
      
      // Actualizar la ubicación actual del conductor en el modelo Driver
      try {
        const Driver = require('./models/Driver');
        await Driver.findByIdAndUpdate(data.driverId, {
          location: { lat: data.location.lat, lng: data.location.lng }
        });
      } catch (err) {
        console.error('Error actualizando ubicación de conductor en DB:', err);
      }
      
      // Lógica de Geocercas (Geofencing) reactiva
      try {
        const Order = require('./models/Order');
        const activeOrders = await Order.find({
          driver: data.driverId,
          status: 'in-transit'
        });

        for (const order of activeOrders) {
          if (
            order.customer &&
            order.customer.coordinates &&
            order.customer.coordinates.lat &&
            order.customer.coordinates.lng
          ) {
            const distance = haversineDistanceMeters(
              data.location.lat,
              data.location.lng,
              order.customer.coordinates.lat,
              order.customer.coordinates.lng
            );

            // Si entra en rango de 50 metros y no se le alertó en los últimos 5 minutos
            if (distance < 50) {
              const cacheKey = `${order._id}`;
              const now = Date.now();
              
              if (!geofenceAlertsCache[cacheKey] || (now - geofenceAlertsCache[cacheKey]) > 5 * 60 * 1000) {
                geofenceAlertsCache[cacheKey] = now;
                
                io.to(socket.companyId).emit('driver_arrived', {
                  orderId: order._id,
                  orderNumber: order.orderNumber,
                  driverId: data.driverId,
                  distance: Math.round(distance)
                });
                
                const logger = require('./utils/logger');
                logger.info(`🚨 Geocerca: Driver ${data.driverId} ha llegado a destino de orden ${order.orderNumber} (distancia: ${Math.round(distance)}m)`);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error calculando geocerca:', err);
      }

      // Guardar en historial de forma "limpia"
      try {
        const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
        const point = { lat: data.location.lat, lng: data.location.lng, timestamp: new Date() };
        
        // Buscamos si ya existe el documento de hoy para este conductor
        let history = await LocationHistory.findOne({ driver: data.driverId, date: today });
        
        if (!history) {
          await LocationHistory.create({
            driver: data.driverId,
            company: socket.companyId,
            date: today,
            path: [point]
          });
        } else {
          // Lógica "limpia": Solo añadir si el último punto está a más de ~20 metros 
          // o si han pasado más de 30 segundos (simplificado)
          const lastPoint = history.path[history.path.length - 1];
          const distance = Math.sqrt(
            Math.pow(point.lat - lastPoint.lat, 2) + 
            Math.pow(point.lng - lastPoint.lng, 2)
          );
          
          // 0.0002 en lat/lng es aprox 20-25 metros
          if (distance > 0.0002) {
            history.path.push(point);
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

// Database Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tracky')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Tracky API & Real-time running on http://localhost:${PORT}`));
