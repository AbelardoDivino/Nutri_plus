const express = require('express');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const Pagamento = require('../models/Pagamento');
const { verifyToken } = require('../middlewares/authJWT');
const router = express.Router();
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
const PLANOS = { mensal: 49.90, trimestral: 129.90, anual: 399.90 };
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const { plano = 'mensal' } = req.body;
    const valor = PLANOS[plano] || 49.90;
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{ title: `NutriPlus - Plano ${plano}`, quantity: 1, unit_price: valor, currency_id: 'BRL' }],
        payer: { email: req.user.email },
        back_urls: { success: 'https://example.com/sucesso', failure: 'https://example.com/erro', pending: 'https://example.com/pendente' },
        notification_url: 'https://example.com/api/pagamento/webhook',
        external_reference: String(req.user.id)
      }
    });
    const pagamento = await Pagamento.create({ user: req.user.id, plano, valor, mercadoPagoId: result.id, initPoint: result.init_point, status: 'pending' });
    res.json({ id: result.id, init_point: result.init_point, sandbox_init_point: result.sandbox_init_point, pagamentoId: pagamento._id });
  } catch (e) { console.error(e); res.status(500).json({ msg: e.message }); }
});
router.post('/webhook', async (req, res) => { res.sendStatus(200); });
router.get('/meus', verifyToken, async (req, res) => {
  const pagos = await Pagamento.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(pagos);
});
module.exports = router;
