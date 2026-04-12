const mongoose = require('mongoose');
require('dotenv').config();
const Company = require('./models/Company');
const User = require('./models/User');
const Order = require('./models/Order');
const Driver = require('./models/Driver');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tracky';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding v2...');

    // Limpiar base de datos
    await Promise.all([
      Company.deleteMany(),
      User.deleteMany(),
      Order.deleteMany(),
      Driver.deleteMany()
    ]);

    // 1. Crear Empresa Maestra
    const trackyCorp = await Company.create({
      name: 'Tracky Logistics Corp',
      slug: 'tracky-main',
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#0f172a'
      },
      settings: { plan: 'enterprise' }
    });

    // 2. Crear Superadmin
    await User.create({
      name: 'Super Admin',
      email: 'admin@tracky.com',
      password: 'admin123',
      role: 'superadmin',
      company: trackyCorp._id
    });

    // 3. Crear Admin para la empresa
    const companyAdmin = await User.create({
      name: 'Empresa Demo Admin',
      email: 'demo@empresa.com',
      password: 'demo123',
      role: 'admin',
      company: trackyCorp._id
    });

    // 4. Crear Usuario para el Conductor (Para que pueda loguearse)
    const carlosUser = await User.create({
      name: 'Carlos Rodríguez',
      email: 'carlos@empresa.com',
      password: 'driver123',
      role: 'driver',
      company: trackyCorp._id
    });

    // 5. Crear Perfiles de Flota para esa empresa
    const drivers = await Driver.insertMany([
      {
        name: 'Carlos Rodríguez',
        email: 'carlos@empresa.com',
        user: carlosUser._id, // Link al login
        company: trackyCorp._id,
        vehicle: { type: 'Van', plate: 'ABC-123' },
        status: 'available',
        location: { lat: 40.7128, lng: -74.006 }
      },
      {
        name: 'Ana García',
        email: 'ana@empresa.com',
        company: trackyCorp._id,
        vehicle: { type: 'Truck', plate: 'XYZ-789' },
        status: 'on-delivery',
        location: { lat: 40.7306, lng: -73.9352 }
      }
    ]);

    // 5. Crear Órdenes
    await Order.insertMany([
      {
        orderNumber: 'ORD-PRO-001',
        company: trackyCorp._id,
        customer: { name: 'Restaurante Central', address: 'Av. Malecón 123' },
        status: 'pending',
        priority: 'high',
        items: '20kg Carnes Premium'
      },
      {
        orderNumber: 'ORD-PRO-002',
        company: trackyCorp._id,
        customer: { name: 'Hotel Marriott', address: 'Larcomar 550' },
        driver: drivers[1]._id,
        status: 'in-transit',
        priority: 'medium',
        items: 'Sábanas y Mantelería'
      }
    ]);

    console.log('✨ Base de datos poblada con éxito (Modo SaaS)');
    process.exit();
  } catch (err) {
    console.error('❌ Error en seed:', err.message);
    process.exit(1);
  }
};

seedData();
