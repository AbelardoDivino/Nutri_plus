const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  profissional: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nome: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  telefone: { type: String, trim: true },
  dataNascimento: { type: Date },
  sexo: { type: String, enum: ['masculino', 'feminino', 'outro'], default: 'masculino' },
  objetivo: { type: String, enum: ['emagrecimento', 'hipertrofia', 'manutencao', 'condicionamento', 'saude'], default: 'saude' },
  observacoes: { type: String },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

clienteSchema.index({ profissional: 1, email: 1 }, { sparse: true });

module.exports = mongoose.model('Cliente', clienteSchema);
