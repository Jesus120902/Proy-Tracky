const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./firebase-credentials.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function checkData() {
  try {
    console.log('🔍 Leyendo usuarios de Firestore...');
    const usersSnap = await db.collection('users').get();
    console.log(`Encontrados ${usersSnap.size} usuarios:`);
    usersSnap.forEach(d => {
      console.log(`- ID: ${d.id} | Email: ${d.data().email} | CompanyId: ${d.data().companyId} | Role: ${d.data().role}`);
    });

    console.log('\n🔍 Leyendo empresas de Firestore...');
    const compSnap = await db.collection('companies').get();
    console.log(`Encontradas ${compSnap.size} empresas:`);
    compSnap.forEach(d => {
      console.log(`- ID: ${d.id} | Name: ${d.data().name} | Slug: ${d.data().slug}`);
    });

    console.log('\n🔍 Leyendo órdenes de Firestore...');
    const ordersSnap = await db.collection('orders').get();
    console.log(`Encontradas ${ordersSnap.size} órdenes:`);
    if (ordersSnap.size > 0) {
      const first = ordersSnap.docs[0];
      console.log(`Ejemplo de orden - ID: ${first.id} | Number: ${first.data().orderNumber} | CompanyId: ${first.data().companyId}`);
    }

    console.log('\n🔍 Leyendo conductores de Firestore...');
    const driversSnap = await db.collection('drivers').get();
    console.log(`Encontrados ${driversSnap.size} conductores:`);
    if (driversSnap.size > 0) {
      const first = driversSnap.docs[0];
      console.log(`Ejemplo de conductor - ID: ${first.id} | Name: ${first.data().name} | CompanyId: ${first.data().companyId}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkData();
