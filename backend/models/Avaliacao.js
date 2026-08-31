const mongoose = require('mongoose');

const avaliacaoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  profissional: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  peso: { type: Number, required: true },
  altura: { type: Number, required: true },
  idade: { type: Number, required: true },
  sexo: { type: String, enum: ['masculino', 'feminino'], required: true },
  nivelAtividade: { type: String, enum: ['sedentario', 'leve', 'moderado', 'ativo', 'muito_ativo'], default: 'moderado' },
  percentualGordura: { type: Number },
  objetivo: { type: String, enum: ['emagrecimento', 'hipertrofia', 'manutencao'], default: 'manutencao' },
  imc: { type: Number },
  tmb: { type: Number },
  tdee: { type: Number },
  caloriasAlvo: { type: Number },
  observacoes: { type: String }
}, { timestamps: true });

avaliacaoSchema.pre('save', function (next) {
  if (this.peso && this.altura) {
    const alturaM = this.altura > 3 ? this.altura / 100 : this.altura;
    this.imc = Number((this.peso / (alturaM * alturaM)).toFixed(2));
  }
  if (this.peso && this.altura && this.idade && this.sexo) {
    const alturaCm = this.altura > 3 ? this.altura : this.altura * 100;
    const base = 10 * this.peso + 6.25 * alturaCm - 5 * this.idade;
    this.tmb = this.sexo === 'masculino' ? Math.round(base + 5) : Math.round(base - 161);
    const fatores = { sedentario: 1.2, leve: 1.375, moderado: 1.55, ativo: 1.725, muito_ativo: 1.9 };
    this.tdee = Math.round(this.tmb * (fatores[this.nivelAtividade] || 1.55));
    if (this.objetivo === 'emagrecimento') this.caloriasAlvo = this.tdee - 500;
    else if (this.objetivo === 'hipertrofia') this.caloriasAlvo = this.tdee + 300;
    else this.caloriasAlvo = this.tdee;
  }
  next();
});

module.exports = mongoose.model('Avaliacao', avaliacaoSchema);
