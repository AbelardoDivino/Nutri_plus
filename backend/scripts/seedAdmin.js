require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) { console.error('MONGO_URI ausente'); process.exit(1); }
  await mongoose.connect(MONGO_URI);
  console.log('Mongo conectado');

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@nutriplus.com';
  const senha = process.env.SEED_ADMIN_SENHA || 'admin123';
  const nome = process.env.SEED_ADMIN_NOME || 'Admin Nutri+';

  let admin = await User.findOne({ email });
  if (admin) {
    console.log('Admin já existe:', admin.email, admin.role);
  } else {
    admin = await User.create({ nome, email, senha, role: 'admin' });
    console.log('Admin criado:', admin.email, 'senha:', senha);
  }
  await mongoose.disconnect();
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
