const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/tracky';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB para la prueba');

    const users = await User.find({}).select('+password');
    console.log(`Encontrados ${users.length} usuarios:`);

    for (const user of users) {
      console.log(`- Nombre: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Rol: ${user.role}`);
      console.log(`  Activo: ${user.active}`);
      console.log(`  Password Hash: ${user.password}`);
      
      // Probar contraseñas
      const testPasswords = ['admin123', 'admin1234', 'demo123', 'driver123', 'driver1234'];
      for (const pwd of testPasswords) {
        const isMatch = await user.matchPassword(pwd);
        if (isMatch) {
          console.log(`  👉 Contraseña coincidente encontrada: "${pwd}"`);
        }
      }
      console.log('------------------------------------');
    }
  } catch (err) {
    console.error('❌ Error de prueba:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

test();
