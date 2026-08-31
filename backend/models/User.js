const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  senha: { type: String, required: false, select: false },
  googleId: { type: String, sparse: true },
  foto: { type: String },
  role: { type: String, enum: ['admin', 'usuario', 'nutricionista', 'personal'], default: 'usuario' },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('senha')) return;
  this.senha = await bcrypt.hash(this.senha, 10);
});

userSchema.methods.compareSenha = function (senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', userSchema);
