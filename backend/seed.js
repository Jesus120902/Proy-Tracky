require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./models/Driver');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tracky';

const drivers = [
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

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Driver.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    const createdDrivers = await Driver.insertMany(drivers);
    console.log(`Inserted ${createdDrivers.length} drivers`);

    const statuses = ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'];
    const priorities = ['low', 'medium', 'high'];
    const customers = [
      { name: 'Acme Corp', address: '123 Broadway, New York, NY' },
      { name: 'TechStart Inc', address: '456 5th Ave, New York, NY' },
      { name: 'Green Supplies', address: '789 Park Ave, New York, NY' },
      { name: 'Blue Ocean LLC', address: '321 Wall St, New York, NY' },
      { name: 'Nova Retail', address: '654 Madison Ave, New York, NY' },
      { name: 'Summit Foods', address: '987 Lexington Ave, New York, NY' },
      { name: 'Orbit Solutions', address: '147 Canal St, New York, NY' },
      { name: 'Pioneer Goods', address: '258 Spring St, New York, NY' },
    ];

    const orders = customers.map((customer, i) => ({
      orderNumber: `ORD-${1000 + i}`,
      customer,
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      driver:
        statuses[i % statuses.length] === 'assigned' ||
        statuses[i % statuses.length] === 'in-transit' ||
        statuses[i % statuses.length] === 'delivered'
          ? createdDrivers[i % createdDrivers.length]._id
          : null,
      items: `Package ${i + 1} – ${Math.floor(Math.random() * 5) + 1} items`,
      notes: i % 3 === 0 ? 'Handle with care' : '',
      estimatedDelivery: new Date(Date.now() + (i + 1) * 86400000),
    }));

    await Order.insertMany(orders);
    console.log(`Inserted ${orders.length} orders`);
    console.log('✅ Seed complete!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
