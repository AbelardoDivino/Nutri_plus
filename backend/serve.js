require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/pagamento', require('./routes/pagamento'));
app.use('/api/clientes', require('./routes/cliente'));
app.use('/api/avaliacao', require('./routes/avaliacao'));
app.use('/api/dieta', require('./routes/dieta'));
app.use('/api/treino', require('./routes/treino'));

const PORT = process.env.PORT || 3000;

// Validação de .env obrigatório (não vaza segredos)
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length) {
  console.error('ERRO: Variáveis obrigatórias ausentes no backend/.env:', missing.join(', '));
  console.error('Copie backend/.env.example para backend/.env e preencha');
  process.exit(1);
}
if (!process.env.GOOGLE_CLIENT_ID) console.warn('AVISO: GOOGLE_CLIENT_ID não configurado - login Google desabilitado');
if (!process.env.MERCADOPAGO_ACCESS_TOKEN) console.warn('AVISO: MERCADOPAGO_ACCESS_TOKEN não configurado - pagamentos desabilitados');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Mongo conectado');
  // Garante índices e cria admin inicial se não existir (tabela users)
  try {
    const User = require('./models/User');
    await User.init();
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@nutriplus.com';
    const exists = await User.findOne({ email: adminEmail });
    if (!exists && process.env.SEED_ADMIN_SENHA) {
      await User.create({ nome: process.env.SEED_ADMIN_NOME || 'Admin', email: adminEmail, senha: process.env.SEED_ADMIN_SENHA, role: 'admin' });
      console.log('Admin seed criado:', adminEmail);
    } else if (!exists) {
      console.log('Nenhum admin encontrado. Rode npm run seed ou defina SEED_ADMIN_SENHA no .env');
    }
  } catch (e) { console.warn('Seed check falhou:', e.message); }
  app.listen(PORT, () => console.log('API rodando na porta ' + PORT));
}).catch(e => {
  console.error('Erro Mongo', e.message);
  process.exit(1);
});
