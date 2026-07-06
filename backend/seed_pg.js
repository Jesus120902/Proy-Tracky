require('dotenv').config();
const sequelize = require('./db');
require('./models/associations'); // Cargar todos los modelos y relaciones
const { Company, User, Driver, Order } = require('./models/associations');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado');

    // Sincronizar tablas (force: true las recrea desde cero)
    await sequelize.sync({ force: true });
    console.log('🗑  Tablas recreadas');

    // ── Empresa demo ─────────────────────────────────────────────────
    const company = await Company.create({
      name: 'Tracky Demo Corp',
      slug: 'tracky-demo',
      logoUrl: '',
      brandingPrimaryColor: '#3b82f6',
      brandingSecondaryColor: '#0f172a',
      maxDrivers: 50,
      subscriptionPlan: 'business',
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
    console.log(`🏢 Empresa creada: ${company.name}`);

    // ── Usuarios ─────────────────────────────────────────────────────
    // NOTA: El hook beforeCreate del modelo hashea automáticamente el password
    const adminUser = await User.create({
      name: 'Admin Tracky',
      email: 'admin@tracky.com',
      password: 'admin1234',
      role: 'admin',
      companyId: company.id,
      active: true,
    });

    await User.create({
      name: 'Operador Demo',
      email: 'operador@tracky.com',
      password: 'oper1234',
      role: 'operator',
      companyId: company.id,
      active: true,
    });

    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'super@tracky.com',
      password: 'super1234',
      role: 'superadmin',
      companyId: null,
      active: true,
    });

    console.log('👤 Usuarios creados:');
    console.log('   admin@tracky.com       → admin1234   (Admin)');
    console.log('   operador@tracky.com    → oper1234    (Operador)');
    console.log('   super@tracky.com       → super1234   (Superadmin)');

    // ── Conductores + sus usuarios ─────────────────────────────────────
    const driversData = [
      { name: 'Marcus Johnson', email: 'marcus@tracky.com', plate: 'ABC-123', type: 'Van', lat: -12.0464, lng: -77.0428 },
      { name: 'Sofia Martinez', email: 'sofia@tracky.com', plate: 'XYZ-987', type: 'Truck', lat: -12.0550, lng: -77.0350 },
      { name: 'Liam Chen', email: 'liam@tracky.com', plate: 'LMN-456', type: 'Motorcycle', lat: -12.0931, lng: -77.0229 },
      { name: 'Aisha Patel', email: 'aisha@tracky.com', plate: 'LMN-777', type: 'Motorcycle', lat: -12.1192, lng: -77.0328 },
      { name: 'Derek Williams', email: 'derek@tracky.com', plate: 'LMN-888', type: 'Van', lat: -12.0734, lng: -77.0827 },
    ];

    const createdDrivers = [];
    for (const d of driversData) {
      const driverUser = await User.create({
        name: d.name,
        email: d.email,
        password: 'driver1234',
        role: 'driver',
        companyId: company.id,
        active: true,
      });

      const driver = await Driver.create({
        name: d.name,
        email: d.email,
        userId: driverUser.id,
        companyId: company.id,
        vehicleType: d.type,
        vehiclePlate: d.plate,
        status: 'available',
        locationLat: d.lat,
        locationLng: d.lng,
        rating: 4.5,
      });

      createdDrivers.push(driver);
    }

    console.log(`🚚 ${createdDrivers.length} conductores creados (contraseña: driver1234)`);

    // ── Órdenes demo (55 registros en los últimos 7 días) ──────────────
    const statuses = ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'];
    const priorities = ['low', 'medium', 'high'];
    const baseCustomers = [
      { name: 'Acme Corp', address: 'Av. Javier Prado Este 123, San Isidro, Lima', lat: -12.0897, lng: -77.0302 },
      { name: 'TechStart Inc', address: 'Av. Pardo y Aliaga 456, San Isidro, Lima', lat: -12.0961, lng: -77.0345 },
      { name: 'Green Supplies', address: 'Calle Las Begonias 789, San Isidro, Lima', lat: -12.0912, lng: -77.0284 },
      { name: 'Blue Ocean LLC', address: 'Av. Larco 321, Miraflores, Lima', lat: -12.1224, lng: -77.0298 },
      { name: 'Nova Retail', address: 'Av. Benavides 654, Surco, Lima', lat: -12.1284, lng: -76.9984 },
      { name: 'Summit Foods', address: 'Av. Encalada 987, Surco, Lima', lat: -12.1147, lng: -76.9792 },
      { name: 'Orbit Solutions', address: 'Jirón de la Unión 147, Cercado de Lima', lat: -12.0464, lng: -77.0428 },
      { name: 'Pioneer Goods', address: 'Av. Brasil 258, Jesús María, Lima', lat: -12.0734, lng: -77.0487 },
    ];

    const ordersToInsert = [];
    for (let i = 0; i < 55; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - daysAgo);

      let statusIndex = Math.floor(Math.random() * statuses.length);
      if (i % 3 === 0) statusIndex = 3; // Más entregas para mejor analítica

      const status = statuses[statusIndex];
      const needsDriver = ['assigned', 'in-transit', 'delivered'].includes(status);
      const customer = baseCustomers[i % baseCustomers.length];

      ordersToInsert.push({
        orderNumber: `ORD-${100000 + i * 7}`,
        companyId: company.id,
        driverId: needsDriver ? createdDrivers[i % createdDrivers.length].id : null,
        customerName: `${customer.name} #${i}`,
        customerAddress: customer.address,
        customerPhone: `+51 9${Math.floor(10000000 + Math.random() * 89999999)}`,
        customerLat: customer.lat,
        customerLng: customer.lng,
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        items: `Carga corporativa tipo ${i % 3 === 0 ? 'A' : 'B'} con ${Math.floor(Math.random() * 50) + 10} unidades`,
        estimatedDelivery: new Date(randomDate.getTime() + 86400000),
        createdAt: randomDate,
        updatedAt: randomDate,
      });
    }

    await Order.bulkCreate(ordersToInsert);
    console.log(`📦 ${ordersToInsert.length} órdenes creadas`);

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
    console.error(err);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

seed();
