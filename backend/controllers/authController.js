const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Avaliacao = require('../models/Avaliacao');
const { calcularAvaliacaoCompleta } = require('../services/caloriaAPI');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const genTokens = (user) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  const access = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '15m' });
  const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
  return { access, refresh };
};

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, role, adminRef, altura, peso, idade, sexo, nivelAtividade, objetivo } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ msg: 'Campos obrigatórios' });
    if (await User.findOne({ email })) return res.status(409).json({ msg: 'Email já cadastrado' });
    const allowedProfissional = ['nutricionista', 'personal'];
    const isProfissionalRole = allowedProfissional.includes(role) || role === 'admin';
    const isUsuarioComDados = role === 'usuario' && peso && altura && idade && sexo;
    if (!isProfissionalRole && !isUsuarioComDados) {
      if (role === 'usuario') return res.status(400).json({ msg: 'Usuário precisa informar altura, peso, idade, sexo e escolher profissional' });
      return res.status(403).json({ msg: 'Cadastro local apenas para profissionais. Usuários devem entrar com Google ou enviar dados completos.' });
    }
    if (role === 'admin') return res.status(403).json({ msg: 'Use /api/auth/admin para criar admin' });
    const finalRole = isUsuarioComDados ? 'usuario' : role;
    let ref = null;
    if (adminRef) {
      const admin = await User.findById(adminRef);
      if (!admin || !['admin', 'nutricionista', 'personal'].includes(admin.role)) return res.status(400).json({ msg: 'Admin/profissional inválido' });
      ref = admin._id;
    }
    // Se for usuario, adminRef é obrigatório para cair no painel do profissional
    if (finalRole === 'usuario' && !ref) return res.status(400).json({ msg: 'Escolha um profissional (adminRef)' });
    const user = await User.create({ nome, email, senha, role: finalRole, adminRef: ref, altura, peso, idade, sexo, nivelAtividade, objetivo });
    // Cria avaliação inicial para o profissional já calcular dieta/treino
    if (finalRole === 'usuario' && peso && altura && idade && sexo) {
      const calc = calcularAvaliacaoCompleta({ peso, altura, idade, sexo, nivelAtividade: nivelAtividade || 'moderado', objetivo: objetivo || 'manutencao' });
      await Avaliacao.create({ user: user._id, profissional: ref, peso, altura, idade, sexo, nivelAtividade: nivelAtividade || 'moderado', objetivo: objetivo || 'manutencao', imc: calc.imc, tmb: calc.tmb, tdee: calc.tdee, caloriasAlvo: calc.caloriasAlvo });
    }
    const { access, refresh } = genTokens(user);
    res.status(201).json({ msg: 'Criado', user: { id: user._id, nome: user.nome, email: user.email, role: user.role, adminRef: ref, altura, peso, idade, sexo, nivelAtividade }, access, refresh });
  } catch (e) { res.status(500).json({ msg: e.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email }).select('+senha');
    if (!user || !(await user.compareSenha(senha))) return res.status(401).json({ msg: 'Credenciais inválidas' });
    if (!user.ativo) return res.status(403).json({ msg: 'Usuário desativado' });
    const { access, refresh } = genTokens(user);
    const precisaCompletarDados = user.role === 'usuario' && (!user.peso || !user.altura || !user.idade || !user.sexo || !user.adminRef);
    res.json({ user: { id: user._id, nome: user.nome, email: user.email, role: user.role, adminRef: user.adminRef, altura: user.altura, peso: user.peso, idade: user.idade, sexo: user.sexo, nivelAtividade: user.nivelAtividade }, access, refresh, precisaCompletarDados });
  } catch (e) { res.status(500).json({ msg: e.message }); }
};

exports.refresh = async (req, res) => {
  const { refresh } = req.body;
  if (!refresh) return res.status(401).json({ msg: 'Refresh não enviado' });
  try {
    const payload = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ msg: 'Usuário não existe' });
    const { access, refresh: newRefresh } = genTokens(user);
    res.json({ access, refresh: newRefresh });
  } catch (e) { res.status(401).json({ msg: 'Refresh inválido' }); }
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id).populate('adminRef', 'nome email role');
  res.json({ user });
};
exports.listAdmins = async (req, res) => {
  const admins = await User.find({ role: { $in: ['admin', 'nutricionista', 'personal'] }, ativo: true }).select('nome email role');
  res.json(admins);
};

exports.createAdmin = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const user = await User.create({ nome, email, senha, role: 'admin' });
    res.status(201).json({ msg: 'Admin criado', id: user._id });
  } catch (e) { res.status(500).json({ msg: e.message }); }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken, adminRef, altura, peso, idade, sexo, nivelAtividade, objetivo } = req.body;
    if (!idToken) return res.status(400).json({ msg: 'idToken obrigatório' });
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const { sub, email, name, picture } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) {
      let ref = null;
      if (adminRef) {
        const admin = await User.findById(adminRef);
        if (admin && ['admin', 'nutricionista', 'personal'].includes(admin.role)) ref = admin._id;
      }
      user = await User.create({ nome: name, email, googleId: sub, foto: picture, senha: Math.random().toString(36), role: 'usuario', adminRef: ref, altura, peso, idade, sexo, nivelAtividade, objetivo });
      if (peso && altura && idade && sexo && ref) {
        const calc = calcularAvaliacaoCompleta({ peso, altura, idade, sexo, nivelAtividade: nivelAtividade || 'moderado', objetivo: objetivo || 'manutencao' });
        await Avaliacao.create({ user: user._id, profissional: ref, peso, altura, idade, sexo, nivelAtividade: nivelAtividade || 'moderado', objetivo: objetivo || 'manutencao', imc: calc.imc, tmb: calc.tmb, tdee: calc.tdee, caloriasAlvo: calc.caloriasAlvo });
      }
    } else {
      if (['admin', 'nutricionista', 'personal'].includes(user.role)) return res.status(403).json({ msg: 'Profissionais devem logar com email/senha' });
      if (!user.googleId) { user.googleId = sub; if (picture) user.foto = picture; await user.save(); }
      if (!user.adminRef && adminRef) {
        const admin = await User.findById(adminRef);
        if (admin && ['admin', 'nutricionista', 'personal'].includes(admin.role)) {
          user.adminRef = admin._id;
          await user.save();
        }
      }
      // Atualiza dados físicos se enviados e cria avaliação se ainda não tem
      if (altura || peso || idade || sexo || nivelAtividade) {
        if (altura) user.altura = altura;
        if (peso) user.peso = peso;
        if (idade) user.idade = idade;
        if (sexo) user.sexo = sexo;
        if (nivelAtividade) user.nivelAtividade = nivelAtividade;
        if (objetivo) user.objetivo = objetivo;
        await user.save();
        if (peso && altura && idade && sexo && user.adminRef) {
          const exists = await Avaliacao.findOne({ user: user._id });
          if (!exists) {
            const calc = calcularAvaliacaoCompleta({ peso: user.peso, altura: user.altura, idade: user.idade, sexo: user.sexo, nivelAtividade: user.nivelAtividade || 'moderado', objetivo: user.objetivo || 'manutencao' });
            await Avaliacao.create({ user: user._id, profissional: user.adminRef, peso: user.peso, altura: user.altura, idade: user.idade, sexo: user.sexo, nivelAtividade: user.nivelAtividade || 'moderado', objetivo: user.objetivo || 'manutencao', imc: calc.imc, tmb: calc.tmb, tdee: calc.tdee, caloriasAlvo: calc.caloriasAlvo });
          }
        }
      }
    }
    if (!user.ativo) return res.status(403).json({ msg: 'Usuário desativado' });
    const { access, refresh } = genTokens(user);
    res.json({ user: { id: user._id, nome: user.nome, email: user.email, role: user.role, foto: user.foto, adminRef: user.adminRef, altura: user.altura, peso: user.peso, idade: user.idade, sexo: user.sexo, nivelAtividade: user.nivelAtividade }, access, refresh });
  } catch (e) { res.status(401).json({ msg: 'Google token inválido', error: e.message }); }
};

// Escolher/trocar profissional após login Google (usuario escolhe na primeira vez)
exports.escolherProfissional = async (req, res) => {
  try {
    const { adminRef } = req.body;
    if (!adminRef) return res.status(400).json({ msg: 'adminRef obrigatório' });
    const prof = await User.findById(adminRef);
    if (!prof || !['admin', 'nutricionista', 'personal'].includes(prof.role)) return res.status(400).json({ msg: 'Profissional inválido' });
    const user = await User.findById(req.user.id);
    if (user.role !== 'usuario') return res.status(403).json({ msg: 'Apenas usuários escolhem profissional' });
    user.adminRef = prof._id;
    await user.save();
    res.json({ msg: 'Profissional vinculado', adminRef: prof._id });
  } catch (e) { res.status(500).json({ msg: e.message }); }
};

exports.completarPerfil = async (req, res) => {
  try {
    const { altura, peso, idade, sexo, nivelAtividade, objetivo, adminRef } = req.body;
    const user = await User.findById(req.user.id);
    if (user.role !== 'usuario') return res.status(403).json({ msg: 'Apenas usuários' });
    if (altura) user.altura = altura;
    if (peso) user.peso = peso;
    if (idade) user.idade = idade;
    if (sexo) user.sexo = sexo;
    if (nivelAtividade) user.nivelAtividade = nivelAtividade;
    if (objetivo) user.objetivo = objetivo;
    if (adminRef) {
      const prof = await User.findById(adminRef);
      if (!prof || !['admin', 'nutricionista', 'personal'].includes(prof.role)) return res.status(400).json({ msg: 'Profissional inválido' });
      user.adminRef = prof._id;
    }
    await user.save();
    if (user.peso && user.altura && user.idade && user.sexo && user.adminRef) {
      const exists = await Avaliacao.findOne({ user: user._id });
      if (!exists) {
        const calc = calcularAvaliacaoCompleta({ peso: user.peso, altura: user.altura, idade: user.idade, sexo: user.sexo, nivelAtividade: user.nivelAtividade || 'moderado', objetivo: user.objetivo || 'manutencao' });
        await Avaliacao.create({ user: user._id, profissional: user.adminRef, peso: user.peso, altura: user.altura, idade: user.idade, sexo: user.sexo, nivelAtividade: user.nivelAtividade || 'moderado', objetivo: user.objetivo || 'manutencao', imc: calc.imc, tmb: calc.tmb, tdee: calc.tdee, caloriasAlvo: calc.caloriasAlvo });
      }
    }
    res.json({ msg: 'Perfil atualizado', user });
  } catch (e) { res.status(500).json({ msg: e.message }); }
};
