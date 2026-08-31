const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Pagamento = require('../models/Pagamento');
const { verifyToken } = require('../middlewares/authJWT');
const router = express.Router();
function getClient() { return new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN }); }
const PLANOS = { mensal: 49.90, trimestral: 129.90, anual: 399.90 };
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:80';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const { plano = 'mensal' } = req.body;
    const valor = PLANOS[plano] || 49.90;
    const client = getClient();
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{ title: `NutriPlus - Plano ${plano}`, quantity: 1, unit_price: valor, currency_id: 'BRL' }],
        payer: { email: req.user.email },
        back_urls: { success: `${FRONTEND_URL}/sucesso`, failure: `${FRONTEND_URL}/erro`, pending: `${FRONTEND_URL}/pendente` },
        notification_url: `${BACKEND_URL}/api/pagamento/webhook`,
        external_reference: String(req.user.id)
      }
    });
    const pagamento = await Pagamento.create({ user: req.user.id, plano, valor, metodo: 'checkout', mercadoPagoId: result.id, initPoint: result.init_point, status: 'pending' });
    res.json({ id: result.id, init_point: result.init_point, sandbox_init_point: result.sandbox_init_point, pagamentoId: pagamento._id });
  } catch (e) { console.error(e); res.status(500).json({ msg: e.message }); }
});

// PIX direto via Payment API
router.post('/pix', verifyToken, async (req, res) => {
  try {
    const { plano = 'mensal' } = req.body;
    const valor = PLANOS[plano] || 49.90;
    const client = getClient();
    const payment = new Payment(client);
    const result = await payment.create({
      body: {
        transaction_amount: valor,
        description: `NutriPlus - Plano ${plano}`,
        payment_method_id: 'pix',
        payer: { email: req.user.email },
        external_reference: String(req.user.id),
        notification_url: `${BACKEND_URL}/api/pagamento/webhook`
      }
    });
    const pagamento = await Pagamento.create({ user: req.user.id, plano, valor, metodo: 'pix', mercadoPagoId: String(result.id), initPoint: result.point_of_interaction?.transaction_data?.qr_code_base64 || '', status: result.status || 'pending' });
    res.json({ id: result.id, status: result.status, qr_code: result.point_of_interaction?.transaction_data?.qr_code, qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64, pagamentoId: pagamento._id });
  } catch (e) { console.error(e); res.status(500).json({ msg: e.message }); }
});

router.post('/boleto', verifyToken, async (req, res) => {
  try {
    const { plano = 'mensal' } = req.body;
    const valor = PLANOS[plano] || 49.90;
    const client = getClient();
    const payment = new Payment(client);
    const result = await payment.create({
      body: {
        transaction_amount: valor,
        description: `NutriPlus - Plano ${plano}`,
        payment_method_id: 'bolbradesco',
        payer: { email: req.user.email, first_name: req.user.nome || 'Cliente', last_name: 'NutriPlus' },
        external_reference: String(req.user.id),
        notification_url: `${BACKEND_URL}/api/pagamento/webhook`
      }
    });
    const pagamento = await Pagamento.create({ user: req.user.id, plano, valor, metodo: 'boleto', mercadoPagoId: String(result.id), initPoint: result.transaction_details?.external_resource_url || '', status: result.status || 'pending' });
    res.json({ id: result.id, status: result.status, boleto_url: result.transaction_details?.external_resource_url, pagamentoId: pagamento._id });
  } catch (e) { console.error(e); res.status(500).json({ msg: e.message }); }
});

router.post('/cartao', verifyToken, async (req, res) => {
  try {
    const { plano = 'mensal', token, installments = 1, payment_method_id = 'master', issuer_id } = req.body;
    if (!token) return res.status(400).json({ msg: 'token do cartão obrigatório (gerado no frontend via MP SDK)' });
    const valor = PLANOS[plano] || 49.90;
    const client = getClient();
    const payment = new Payment(client);
    const result = await payment.create({
      body: {
        transaction_amount: valor,
        token,
        description: `NutriPlus - Plano ${plano}`,
        installments: Number(installments),
        payment_method_id,
        issuer_id: issuer_id ? Number(issuer_id) : undefined,
        payer: { email: req.user.email },
        external_reference: String(req.user.id),
        notification_url: `${BACKEND_URL}/api/pagamento/webhook`
      }
    });
    const pagamento = await Pagamento.create({ user: req.user.id, plano, valor, metodo: 'cartao', mercadoPagoId: String(result.id), status: result.status || 'pending' });
    res.json({ id: result.id, status: result.status, status_detail: result.status_detail, pagamentoId: pagamento._id });
  } catch (e) { console.error(e); res.status(500).json({ msg: e.message }); }
});

router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type === 'payment' && data?.id) {
      const client = getClient();
      const payment = new Payment(client);
      const mpPayment = await payment.get({ id: data.id });
      const statusMap = { approved: 'approved', pending: 'pending', rejected: 'rejected', cancelled: 'cancelled', in_process: 'pending' };
      await Pagamento.findOneAndUpdate({ mercadoPagoId: String(data.id) }, { status: statusMap[mpPayment.status] || mpPayment.status });
    }
    res.sendStatus(200);
  } catch (e) { console.error('webhook erro', e.message); res.sendStatus(200); }
});

router.get('/meus', verifyToken, async (req, res) => {
  const pagos = await Pagamento.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(pagos);
});
module.exports = router;
