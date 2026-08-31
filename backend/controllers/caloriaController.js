const Avaliacao = require('../models/Avaliacao');
const { calcularAvaliacaoCompleta } = require('../services/caloriaAPI');

exports.calcular = async (req, res) => {
  try {
    const { peso, altura, idade, sexo, nivelAtividade, objetivo, percentualGordura, observacoes, cliente, user } = req.body;
    if (!peso || !altura || !idade || !sexo) return res.status(400).json({ msg: 'peso, altura, idade e sexo obrigatórios' });
    const calc = calcularAvaliacaoCompleta({ peso, altura, idade, sexo, nivelAtividade, objetivo });
    const avaliacao = await Avaliacao.create({
      cliente: cliente || null,
      user: user || null,
      profissional: req.user.id,
      peso, altura, idade, sexo, nivelAtividade, objetivo, percentualGordura, observacoes,
      imc: calc.imc, tmb: calc.tmb, tdee: calc.tdee, caloriasAlvo: calc.caloriasAlvo
    });
    res.status(201).json({ avaliacao, calculo: calc });
  } catch (e) { res.status(500).json({ msg: e.message }); }
};

exports.listar = async (req, res) => {
  const filtro = req.user.role === 'usuario' ? { user: req.user.id } : { profissional: req.user.id };
  if (req.query.cliente) filtro.cliente = req.query.cliente;
  if (req.query.user) filtro.user = req.query.user;
  const lista = await Avaliacao.find(filtro).sort({ createdAt: -1 });
  res.json(lista);
};

exports.obter = async (req, res) => {
  const av = await Avaliacao.findById(req.params.id);
  if (!av) return res.status(404).json({ msg: 'Não encontrada' });
  if (String(av.profissional) !== req.user.id && String(av.user) !== req.user.id) return res.status(403).json({ msg: 'Sem acesso' });
  res.json(av);
};
