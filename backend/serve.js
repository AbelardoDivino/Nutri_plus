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
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Mongo conectado');
  app.listen(PORT, () => console.log('API rodando na porta ' + PORT));
}).catch(e => {
  console.error('Erro Mongo', e.message);
  process.exit(1);
});
