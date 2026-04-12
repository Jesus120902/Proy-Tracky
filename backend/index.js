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

// Error Handling
app.use(errorHandler);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log(`🔌 Usuario conectado: ${socket.id}`);

  socket.on('join_company', (companyId) => {
    socket.join(companyId);
    console.log(`🏢 Socket ${socket.id} unido a empresa: ${companyId}`);
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
