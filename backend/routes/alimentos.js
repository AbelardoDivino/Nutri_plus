const express = require('express');
const { verifyToken } = require('../middlewares/authJWT');
const { limiter } = require('../middlewares/rateLimiter');
const { buscarAlimentosParaConsulta, buscarAlimento } = require('../api_alimentos/api_alimentos');
const router = express.Router();
const alimentosLimiter = limiter({ windowMs: 60000, max: 60 });

// GET /api/alimentos/buscar?q=arroz - consulta calorias (auxilia profissional a montar manual)
router.get('/buscar', verifyToken, alimentosLimiter, async (req, res) => {
  try {
    const q = (req.query.q || req.query.termo || '').trim();
    if (!q) return res.status(400).json({ msg: 'Parâmetro q obrigatório ex: ?q=arroz' });
    const lista = await buscarAlimentosParaConsulta(q);
    res.json(lista);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

// GET /api/alimentos/:termo - detalhe único
router.get('/:termo', verifyToken, async (req, res) => {
  try {
    const item = await buscarAlimento(req.params.termo);
    if (!item) return res.status(404).json({ msg: 'Alimento não encontrado' });
    res.json(item);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

module.exports = router;
