const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  senha: { type: String, required: false, select: false },
  googleId: { type: String, sparse: true },
  foto: { type: String },
  role: { type: String, enum: ['admin', 'usuario', 'nutricionista', 'personal'], default: 'usuario' },
  adminRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ativo: { type: Boolean, default: true },
  // Dados iniciais do usuário (para já cair no painel do profissional)
  altura: { type: Number },
  peso: { type: Number },
  idade: { type: Number },
  sexo: { type: String, enum: ['masculino', 'feminino', 'outro'] },
  nivelAtividade: { type: String, enum: ['sedentario', 'leve', 'moderado', 'ativo', 'muito_ativo'] },
  objetivo: { type: String, enum: ['emagrecimento', 'hipertrofia', 'manutencao', 'condicionamento', 'saude'] }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  this.senha = await bcrypt.hash(this.senha, 10);
});

userSchema.methods.compareSenha = function (senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', userSchema);
