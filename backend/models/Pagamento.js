const mongoose = require('mongoose');
const pagamentoSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plano: { type: String, enum: ['mensal', 'trimestral', 'anual'], default: 'mensal' },
  valor: { type: Number, required: true },
  metodo: { type: String, enum: ['pix', 'cartao', 'boleto', 'checkout'], default: 'checkout' },
  mercadoPagoId: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  initPoint: { type: String },
}, { timestamps: true });
module.exports = mongoose.model('Pagamento', pagamentoSchema);
