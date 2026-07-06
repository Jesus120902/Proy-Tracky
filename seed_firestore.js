const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./firebase-credentials.json');

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://tracky-3b102-default-rtdb.firebaseio.com',
});

const db = getFirestore();
const auth = getAuth();

async function runSeed() {
  try {
    console.log('🚀 Iniciando siembra de datos en Firestore...');

    // 1. Crear Empresa Demo
    const companyRef = db.collection('companies').doc();
    const companyId = companyRef.id;
    await companyRef.set({
      name: 'Tracky Demo Corp',
      slug: 'tracky-demo',
      logoUrl: '',
      brandingPrimaryColor: '#3b82f6',
      brandingSecondaryColor: '#0f172a',
      maxDrivers: 50,
      subscriptionPlan: 'business',
      subscriptionStatus: 'active',
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`🏢 Empresa Demo creada: ${companyId}`);

    // 2. Crear Usuarios (Auth + Firestore)
    const usersToCreate = [
      { name: 'Admin Tracky', email: 'admin@tracky.com', password: 'admin1234', role: 'admin' },
      { name: 'Operador Demo', email: 'operador@tracky.com', password: 'oper1234', role: 'operator' },
    ];

    const usersMap = {};
    for (const u of usersToCreate) {
      // Registrar en Firebase Auth
      let authUser;
      try {
        authUser = await auth.createUser({
          email: u.email,
          password: u.password,
          displayName: u.name,
        });
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use' || authErr.code === 'auth/email-already-exists') {
          authUser = await auth.getUserByEmail(u.email);
        } else {
          throw authErr;
        }
      }

      // Guardar perfil en Firestore
      const userRef = db.collection('users').doc();
      await userRef.set({
        uid: authUser.uid,
        name: u.name,
        email: u.email,
        role: u.role,
        companyId: companyId,
        active: true,
        createdAt: FieldValue.serverTimestamp(),
      });
      usersMap[u.role] = { id: userRef.id, uid: authUser.uid, name: u.name, email: u.email };
      console.log(`👤 Usuario creado: ${u.email} (${u.role})`);
    }

    // 3. Crear Conductores (Marcus, Sofía, etc.)
    const driversData = [
      { name: 'Marcus Johnson', email: 'marcus@tracky.com', plate: 'ABC-123', type: 'Van', lat: -12.0464, lng: -77.0428 },
      { name: 'Sofia Martinez', email: 'sofia@tracky.com', plate: 'XYZ-987', type: 'Truck', lat: -12.0550, lng: -77.0350 },
    ];

    const createdDrivers = [];
    for (const d of driversData) {
      // Crear en Firebase Auth
      let authUser;
      try {
        authUser = await auth.createUser({
          email: d.email,
          password: 'driver1234',
          displayName: d.name,
        });
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use' || authErr.code === 'auth/email-already-exists') {
          authUser = await auth.getUserByEmail(d.email);
        } else {
          throw authErr;
        }
      }

      // Perfil de Usuario en Firestore
      const userRef = db.collection('users').doc();
      await userRef.set({
        uid: authUser.uid,
        name: d.name,
        email: d.email,
        role: 'driver',
        companyId: companyId,
        active: true,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Perfil de Conductor en Firestore
      const driverRef = db.collection('drivers').doc();
      await driverRef.set({
        name: d.name,
        email: d.email,
        userId: userRef.id,
        companyId: companyId,
        vehicleType: d.type,
        vehiclePlate: d.plate,
        status: 'available',
        locationLat: d.lat,
        locationLng: d.lng,
        rating: 4.5,
        totalDeliveries: 0,
        avatar: '',
        createdAt: FieldValue.serverTimestamp(),
      });

      createdDrivers.push({ id: driverRef.id, name: d.name });
      console.log(`🚚 Conductor creado: ${d.email}`);
    }

    // 4. Crear Órdenes demo
    const baseCustomers = [
      { name: 'Acme Corp', address: 'Av. Javier Prado Este 123, San Isidro, Lima', lat: -12.0897, lng: -77.0302 },
      { name: 'TechStart Inc', address: 'Av. Pardo y Aliaga 456, San Isidro, Lima', lat: -12.0961, lng: -77.0345 },
      { name: 'Blue Ocean LLC', address: 'Av. Larco 321, Miraflores, Lima', lat: -12.1224, lng: -77.0298 },
    ];

    for (let i = 0; i < 6; i++) {
      const customer = baseCustomers[i % baseCustomers.length];
      const status = i % 2 === 0 ? 'delivered' : 'assigned';
      const orderRef = db.collection('orders').doc();

      await orderRef.set({
        orderNumber: `ORD-${100000 + i * 9}`,
        companyId: companyId,
        driverId: status === 'assigned' ? createdDrivers[0].id : null,
        customerName: `${customer.name} #${i}`,
        customerAddress: customer.address,
        customerPhone: '+51 987654321',
        customerLat: customer.lat,
        customerLng: customer.lng,
        status,
        priority: i % 2 === 0 ? 'medium' : 'high',
        items: `Carga corporativa de prueba tipo ${i}`,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log(`📦 Orden creada: ORD-${100000 + i * 9}`);
    }

    console.log('\n🎉 Siembra completada con éxito!');
    console.log('-------------------------------------------');
    console.log('🔐 Credenciales de acceso:');
    console.log('   Admin:    admin@tracky.com    / admin1234');
    console.log('   Operador: operador@tracky.com / oper1234');
    console.log('   Driver:   marcus@tracky.com   / driver1234');
    console.log('-------------------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error en el seed:', err);
    process.exit(1);
  }
}

runSeed();
