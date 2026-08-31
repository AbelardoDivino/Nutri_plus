const mongoose = require('mongoose');

const refeicaoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  horario: { type: String },
  alimentos: [{
    nome: { type: String, required: true },
    quantidade: { type: String },
    calorias: { type: Number },
    proteinas: { type: Number },
    carboidratos: { type: Number },
    gorduras: { type: Number }
  }],
  calorias: { type: Number },
  observacao: { type: String }
}, { _id: false });

const dietaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  profissional: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  avaliacao: { type: mongoose.Schema.Types.ObjectId, ref: 'Avaliacao' },
  caloriasAlvo: { type: Number, required: true },
  macros: {
    proteinas: { type: Number },
    carboidratos: { type: Number },
    gorduras: { type: Number }
  },
  refeicoes: [refeicaoSchema],
  observacoes: { type: String },
  fonte: { type: String, enum: ['openai', 'edamam', 'manual'], default: 'openai' },
  ativa: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Dieta', dietaSchema);
