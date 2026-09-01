const express = require('express');
const Treino = require('../models/Treino');
const { verifyToken, isProfissional, isPersonal } = require('../middlewares/authJWT');
const { gerarTreinoOpenAI } = require('../api_alimentos/api_alimentos');
const router = express.Router();

// Profissional gera treino (personal)
router.post('/gerar', verifyToken, isPersonal, async (req, res) => {
  try {
    const { cliente, user, objetivo = 'hipertrofia', nivel = 'iniciante', frequencia = 3, avaliacao } = req.body;
    const dias = await gerarTreinoOpenAI({ objetivo, nivel, frequencia });
    const treino = await Treino.create({
      cliente: cliente || null,
      user: user || null,
      profissional: req.user.id,
      avaliacao: avaliacao || null,
      objetivo, nivel, frequencia,
      dias: Array.isArray(dias) ? dias : dias.dias || []
    });
    res.status(201).json(treino);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

router.get('/meu', verifyToken, async (req, res) => {
  const treinos = await Treino.find({ user: req.user.id, ativo: true }).sort({ createdAt: -1 }).populate('profissional', 'nome email');
  res.json(treinos);
});

router.get('/profissional', verifyToken, isProfissional, async (req, res) => {
  const treinos = await Treino.find({ profissional: req.user.id }).sort({ createdAt: -1 }).populate('user cliente');
  res.json(treinos);
});

router.get('/:id', verifyToken, async (req, res) => {
  const t = await Treino.findById(req.params.id).populate('profissional', 'nome email');
  if (!t) return res.status(404).json({ msg: 'Não encontrado' });
  if (String(t.profissional._id || t.profissional) !== req.user.id && String(t.user) !== req.user.id) return res.status(403).json({ msg: 'Sem acesso' });
  res.json(t);
});

router.put('/:id', verifyToken, isPersonal, async (req, res) => {
  const t = await Treino.findOneAndUpdate({ _id: req.params.id, profissional: req.user.id }, req.body, { new: true });
  if (!t) return res.status(404).json({ msg: 'Não encontrado' });
  res.json(t);
});

module.exports = router;
