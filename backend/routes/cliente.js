const express = require('express');
const Cliente = require('../models/Cliente');
const User = require('../models/User');
const { verifyToken, isProfissional } = require('../middlewares/authJWT');
const router = express.Router();

// Profissional lista seus clientes (coleção Cliente)
router.get('/', verifyToken, isProfissional, async (req, res) => {
  const clientes = await Cliente.find({ profissional: req.user.id, ativo: true }).sort({ createdAt: -1 });
  res.json(clientes);
});

// Profissional lista usuarios (User role=usuario) que o escolheram via adminRef
router.get('/usuarios', verifyToken, isProfissional, async (req, res) => {
  const usuarios = await User.find({ adminRef: req.user.id, role: 'usuario', ativo: true }).select('nome email foto role createdAt');
  res.json(usuarios);
});

// Usuario ve seu profissional
router.get('/meu-profissional', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).populate('adminRef', 'nome email role foto');
  res.json({ profissional: user.adminRef });
});

// Criar cliente (profissional)
router.post('/', verifyToken, isProfissional, async (req, res) => {
  try {
    const { nome, email, telefone, dataNascimento, sexo, objetivo, observacoes, user } = req.body;
    if (!nome) return res.status(400).json({ msg: 'Nome obrigatório' });
    const cliente = await Cliente.create({ nome, email, telefone, dataNascimento, sexo, objetivo, observacoes, profissional: req.user.id, user: user || null });
    res.status(201).json(cliente);
  } catch (e) { res.status(500).json({ msg: e.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  const c = await Cliente.findById(req.params.id);
  if (!c) return res.status(404).json({ msg: 'Não encontrado' });
  if (String(c.profissional) !== req.user.id && String(c.user) !== req.user.id) return res.status(403).json({ msg: 'Sem acesso' });
  res.json(c);
});

router.put('/:id', verifyToken, isProfissional, async (req, res) => {
  const c = await Cliente.findOneAndUpdate({ _id: req.params.id, profissional: req.user.id }, req.body, { new: true });
  if (!c) return res.status(404).json({ msg: 'Não encontrado' });
  res.json(c);
});

router.delete('/:id', verifyToken, isProfissional, async (req, res) => {
  const c = await Cliente.findOneAndUpdate({ _id: req.params.id, profissional: req.user.id }, { ativo: false }, { new: true });
  if (!c) return res.status(404).json({ msg: 'Não encontrado' });
  res.json({ msg: 'Desativado' });
});

module.exports = router;
