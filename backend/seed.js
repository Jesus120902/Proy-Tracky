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
      { name: 'Marcus Johnson', email: 'marcus@tracky.com' },
      { name: 'Sofia Martinez', email: 'sofia@tracky.com' },
      { name: 'Liam Chen', email: 'liam@tracky.com' },
      { name: 'Aisha Patel', email: 'aisha@tracky.com' },
      { name: 'Derek Williams', email: 'derek@tracky.com' },
    ];

    const createdUsers = [];
    for (const d of driversData) {
      const user = await User.create({
        name: d.name,
        email: d.email,
        password: 'driver1234',
        role: 'driver',
        company: company._id,
        active: true,
      });
      createdUsers.push(user);
    }

    const createdDrivers = await Driver.insertMany([
      { name: 'Marcus Johnson', email: 'marcus@tracky.com', user: createdUsers[0]._id, company: company._id, status: 'available', vehicle: { plate: 'ABC-123', type: 'Van', capacity: '1000kg' }, location: { lat: -12.0464, lng: -77.0428 } },
      { name: 'Sofia Martinez', email: 'sofia@tracky.com', user: createdUsers[1]._id, company: company._id, status: 'available', vehicle: { plate: 'XYZ-987', type: 'Truck', capacity: '5000kg' }, location: { lat: -12.0550, lng: -77.0350 } },
      { name: 'Liam Chen', email: 'liam@tracky.com', user: createdUsers[2]._id, company: company._id, status: 'available', vehicle: { plate: 'LMN-456', type: 'Motorcycle', capacity: '50kg' }, location: { lat: -12.0931, lng: -77.0229 } },
      { name: 'Aisha Patel', email: 'aisha@tracky.com', user: createdUsers[3]._id, company: company._id, status: 'available', vehicle: { plate: 'LMN-777', type: 'Motorcycle', capacity: '50kg' }, location: { lat: -12.1192, lng: -77.0328 } },
      { name: 'Derek Williams', email: 'derek@tracky.com', user: createdUsers[4]._id, company: company._id, status: 'available', vehicle: { plate: 'LMN-888', type: 'Van', capacity: '1000kg' }, location: { lat: -12.0734, lng: -77.0827 } },
    ]);

    console.log(`🚚 ${createdDrivers.length} conductores creados (contraseña: driver1234)`);

    // ── Órdenes demo (> 50 para testear paginación y últimos 7 días para analítica) ──
    const statuses   = ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'];
    const priorities = ['low', 'medium', 'high'];
    const baseCustomers  = [
      { name: 'Acme Corp',       address: 'Av. Javier Prado Este 123, San Isidro, Lima' },
      { name: 'TechStart Inc',   address: 'Av. Pardo y Aliaga 456, San Isidro, Lima' },
      { name: 'Green Supplies',  address: 'Calle Las Begonias 789, San Isidro, Lima' },
      { name: 'Blue Ocean LLC',  address: 'Av. Larco 321, Miraflores, Lima' },
      { name: 'Nova Retail',     address: 'Av. Benavides 654, Surco, Lima' },
      { name: 'Summit Foods',    address: 'Av. Encalada 987, Surco, Lima' },
      { name: 'Orbit Solutions', address: 'Jirón de la Unión 147, Cercado de Lima' },
      { name: 'Pioneer Goods',   address: 'Av. Brasil 258, Jesús María, Lima' },
    ];

    const orders = Array.from({ length: 55 }).map((_, i) => {
      // Distribución aleatoria real en los últimos 7 días
      const daysAgo = Math.floor(Math.random() * 7);
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - daysAgo);

      // Usualmente lo cancelado es poco, pending o entregado es más
      let statusIndex = Math.floor(Math.random() * statuses.length);
      if (i % 3 === 0) statusIndex = 3; // Forzar más entregados para la analítica (success rate real)

      const status = statuses[statusIndex];
      const needsDriver = ['assigned', 'in-transit', 'delivered'].includes(status);
      const customer = baseCustomers[i % baseCustomers.length];

      return {
        orderNumber: `ORD-${100000 + i * 7}`,
        customer: { ...customer, name: `${customer.name} #${i}` }, // Diferenciar
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        company: company._id,
        driver: needsDriver ? createdDrivers[i % createdDrivers.length]._id : null,
        items: `Carga corporativa tipo ${i % 3 === 0 ? 'A' : 'B'} con ${Math.floor(Math.random() * 50) + 10} unidades`,
        createdAt: randomDate,
        updatedAt: randomDate,
        estimatedDelivery: new Date(randomDate.getTime() + 86400000), // 1 día después de crearse
      };
    });

    await Order.insertMany(orders);
    console.log(`📦 ${orders.length} órdenes creadas y esparcidas en los últimos 7 días`);

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
