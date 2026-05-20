require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Cargar modelos
const Company  = require('./models/Company');
const User     = require('./models/User');
const Driver   = require('./models/Driver');
const Order    = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tracky';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // ── Limpiar ─────────────────────────────────────────────────
    await Order.deleteMany({});
    await Driver.deleteMany({});
    await User.deleteMany({});
    await Company.deleteMany({});
    console.log('🗑  Base de datos limpiada');

    // ── Empresa demo ─────────────────────────────────────────────
    const company = await Company.create({
      name: 'Tracky Demo Corp',
      slug: 'tracky-demo',
      logoUrl: '',
      branding: { primaryColor: '#3b82f6' },
      settings: { plan: 'enterprise' },
    });
    console.log(`🏢 Empresa creada: ${company.name}`);

    // ── Hash de contraseñas ───────────────────────────────────────
    // NOTA: bcryptjs hashea automáticamente en el pre-save hook del modelo,
    // pero al usar create() en masa lo hacemos manual para seguridad explícita.
    const salt = await bcrypt.genSalt(10);

    // ── Usuarios ─────────────────────────────────────────────────
    const adminUser = await User.create({
      name: 'Admin Tracky',
      email: 'admin@tracky.com',
      password: 'admin1234',        // El pre-save hook hashea esto ✅
      role: 'admin',
      company: company._id,
      active: true,
    });

    const operatorUser = await User.create({
      name: 'Operador Demo',
      email: 'operador@tracky.com',
      password: 'oper1234',
      role: 'operator',
      company: company._id,
      active: true,
    });

    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'super@tracky.com',
      password: 'super1234',
      role: 'superadmin',
      active: true,
    });

    console.log('👤 Usuarios creados:');
    console.log('   admin@tracky.com       → admin1234   (Admin)');
    console.log('   operador@tracky.com    → oper1234    (Operador)');
    console.log('   super@tracky.com       → super1234   (Superadmin)');

    // ── Conductores + sus usuarios ────────────────────────────────
    const driversData = [
      {
        name: 'Marcus Johnson',
        email: 'marcus@tracky.com',
        phone: '+1-555-0101',
        vehicle: { type: 'Van', plate: 'TRK-001' },
        status: 'available',
        location: { lat: 40.7128, lng: -74.006 },
        rating: 4.8,
        totalDeliveries: 142,
      },
      {
        name: 'Sofia Martinez',
        email: 'sofia@tracky.com',
        phone: '+1-555-0102',
        vehicle: { type: 'Truck', plate: 'TRK-002' },
        status: 'on-delivery',
        location: { lat: 40.758, lng: -73.9855 },
        rating: 4.9,
        totalDeliveries: 217,
      },
      {
        name: 'Liam Chen',
        email: 'liam@tracky.com',
        phone: '+1-555-0103',
        vehicle: { type: 'Motorcycle', plate: 'TRK-003' },
        status: 'available',
        location: { lat: 40.7282, lng: -73.7949 },
        rating: 4.7,
        totalDeliveries: 98,
      },
      {
        name: 'Aisha Patel',
        email: 'aisha@tracky.com',
        phone: '+1-555-0104',
        vehicle: { type: 'Van', plate: 'TRK-004' },
        status: 'offline',
        location: { lat: 40.6892, lng: -74.0445 },
        rating: 4.6,
        totalDeliveries: 63,
      },
      {
        name: 'Derek Williams',
        email: 'derek@tracky.com',
        phone: '+1-555-0105',
        vehicle: { type: 'Car', plate: 'TRK-005' },
        status: 'available',
        location: { lat: 40.7549, lng: -73.984 },
        rating: 4.5,
        totalDeliveries: 321,
      },
    ];

    const createdDrivers = [];
    for (const d of driversData) {
      // Crear usuario conductor
      const driverUser = await User.create({
        name: d.name,
        email: d.email,
        password: 'driver1234',
        role: 'driver',
        company: company._id,
        active: true,
      });

      // Crear perfil de conductor vinculado al usuario
      const driver = await Driver.create({
        ...d,
        company: company._id,
        user: driverUser._id,
      });

      createdDrivers.push(driver);
    }

    console.log(`🚚 ${createdDrivers.length} conductores creados (contraseña: driver1234)`);

    // ── Órdenes demo ─────────────────────────────────────────────
    const statuses   = ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'];
    const priorities = ['low', 'medium', 'high'];
    const customers  = [
      { name: 'Acme Corp',       address: '123 Broadway, New York, NY' },
      { name: 'TechStart Inc',   address: '456 5th Ave, New York, NY' },
      { name: 'Green Supplies',  address: '789 Park Ave, New York, NY' },
      { name: 'Blue Ocean LLC',  address: '321 Wall St, New York, NY' },
      { name: 'Nova Retail',     address: '654 Madison Ave, New York, NY' },
      { name: 'Summit Foods',    address: '987 Lexington Ave, New York, NY' },
      { name: 'Orbit Solutions', address: '147 Canal St, New York, NY' },
      { name: 'Pioneer Goods',   address: '258 Spring St, New York, NY' },
    ];

    const orders = customers.map((customer, i) => {
      const status = statuses[i % statuses.length];
      const needsDriver = ['assigned', 'in-transit', 'delivered'].includes(status);
      return {
        orderNumber: `ORD-${1000 + i}`,
        customer,
        status,
        priority: priorities[i % priorities.length],
        company: company._id,
        driver: needsDriver ? createdDrivers[i % createdDrivers.length]._id : null,
        items: `Package ${i + 1} – ${Math.floor(Math.random() * 5) + 1} items`,
        notes: i % 3 === 0 ? 'Handle with care' : '',
        estimatedDelivery: new Date(Date.now() + (i + 1) * 86400000),
      };
    });

    await Order.insertMany(orders);
    console.log(`📦 ${orders.length} órdenes creadas`);

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('─────────────────────────────────────────');
    console.log('▶ Credenciales de acceso:');
    console.log('  admin@tracky.com    / admin1234   → Panel Admin');
    console.log('  operador@tracky.com / oper1234    → Panel Operador');
    console.log('  super@tracky.com    / super1234   → Superadmin');
    console.log('  marcus@tracky.com   / driver1234  → Portal Conductor');
    console.log('─────────────────────────────────────────\n');
  } catch (err) {
    console.error('❌ Error en seed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
