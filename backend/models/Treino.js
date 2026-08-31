const mongoose = require('mongoose');

const exercicioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  series: { type: Number, default: 3 },
  repeticoes: { type: String, default: '8-12' },
  carga: { type: String },
  descanso: { type: String, default: '60s' },
  observacao: { type: String }
}, { _id: false });

const diaTreinoSchema = new mongoose.Schema({
  dia: { type: String, required: true },
  grupoMuscular: { type: String },
  exercicios: [exercicioSchema]
}, { _id: false });

const treinoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  profissional: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  avaliacao: { type: mongoose.Schema.Types.ObjectId, ref: 'Avaliacao' },
  objetivo: { type: String, enum: ['emagrecimento', 'hipertrofia', 'condicionamento', 'forca', 'resistencia'], default: 'hipertrofia' },
  nivel: { type: String, enum: ['iniciante', 'intermediario', 'avancado'], default: 'iniciante' },
  frequencia: { type: Number, min: 1, max: 7, default: 3 },
  dias: [diaTreinoSchema],
  observacoes: { type: String },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Treino', treinoSchema);
