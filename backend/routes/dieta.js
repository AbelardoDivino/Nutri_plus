const express = require('express');
const Dieta = require('../models/Dieta');
const Avaliacao = require('../models/Avaliacao');
const { verifyToken, isProfissional } = require('../middlewares/authJWT');
const { calcularAvaliacaoCompleta } = require('../services/caloriaAPI');
const { gerarDietaOpenAI } = require('../api_alimentos/api_alimentos');
const router = express.Router();

// Profissional gera dieta (nutricionista)
router.post('/gerar', verifyToken, isProfissional, async (req, res) => {
  try {
    const { cliente, user, avaliacaoId, caloriasAlvo: calManual, objetivo, restricoes } = req.body;
    let caloriasAlvo = calManual;
    let macros = null;
    let avaliacao = null;
    if (avaliacaoId) {
      avaliacao = await Avaliacao.findById(avaliacaoId);
      if (!avaliacao) return res.status(404).json({ msg: 'Avaliacao não encontrada' });
      caloriasAlvo = avaliacao.caloriasAlvo;
      const calc = calcularAvaliacaoCompleta({ peso: avaliacao.peso, altura: avaliacao.altura, idade: avaliacao.idade, sexo: avaliacao.sexo, nivelAtividade: avaliacao.nivelAtividade, objetivo: avaliacao.objetivo });
      macros = calc.macros;
    } else {
      if (!caloriasAlvo) return res.status(400).json({ msg: 'caloriasAlvo ou avaliacaoId obrigatório' });
      macros = { proteinas: 120, carboidratos: 250, gorduras: 70 };
    }
    const dietaIA = await gerarDietaOpenAI({ caloriasAlvo, macros, restricoes, objetivo: objetivo || avaliacao?.objetivo || 'manutencao' });
    const dieta = await Dieta.create({
      cliente: cliente || null,
      user: user || null,
      profissional: req.user.id,
      avaliacao: avaliacao?._id || null,
      caloriasAlvo,
      macros,
      refeicoes: dietaIA.refeicoes || dietaIA,
      fonte: 'openai'
    });
    res.status(201).json(dieta);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

// Usuario vê sua dieta
router.get('/minha', verifyToken, async (req, res) => {
  const dietas = await Dieta.find({ user: req.user.id, ativa: true }).sort({ createdAt: -1 }).populate('profissional', 'nome email');
  res.json(dietas);
});

// Profissional lista dietas dos seus clientes
router.get('/profissional', verifyToken, isProfissional, async (req, res) => {
  const dietas = await Dieta.find({ profissional: req.user.id }).sort({ createdAt: -1 }).populate('user cliente');
  res.json(dietas);
});

router.get('/:id', verifyToken, async (req, res) => {
  const d = await Dieta.findById(req.params.id).populate('profissional', 'nome email');
  if (!d) return res.status(404).json({ msg: 'Não encontrada' });
  if (String(d.profissional._id || d.profissional) !== req.user.id && String(d.user) !== req.user.id) return res.status(403).json({ msg: 'Sem acesso' });
  res.json(d);
});

module.exports = router;
