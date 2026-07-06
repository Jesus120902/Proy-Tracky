const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./firebase-credentials.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

async function cleanAll() {
  try {
    console.log('🗑  Eliminando documentos de Firestore...');
    const collections = ['users', 'companies', 'orders', 'drivers', 'location_histories'];
    for (const c of collections) {
      const snap = await db.collection(c).get();
      const batch = db.batch();
      snap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      console.log(`- Colección "${c}" limpiada (${snap.size} docs)`);
    }

    console.log('\n🗑  Eliminando usuarios de Firebase Authentication...');
    let listUsersResult = await auth.listUsers();
    let count = 0;
    while (listUsersResult.users.length > 0) {
      const uids = listUsersResult.users.map(u => u.uid);
      await auth.deleteUsers(uids);
      count += uids.length;
      listUsersResult = await auth.listUsers();
    }
    console.log(`- ${count} usuarios eliminados de Auth`);

    console.log('\n✅ Limpieza completa.');
    process.exit(0);
  } catch (err) {
    console.error('Error durante la limpieza:', err);
    process.exit(1);
  }
}

cleanAll();
