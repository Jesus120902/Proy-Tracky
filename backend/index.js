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
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/driver', require('./routes/driverPortal'));
app.use('/api/users', require('./routes/users')); // Nueva ruta para gestión de cuentas

// Error Handling
app.use(errorHandler);

// Socket.io Logic
const LocationHistory = require('./models/LocationHistory');

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
      
      // Guardar en historial de forma "limpia"
      try {
        const today = new Date().toISOString().split('T')[0];
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
