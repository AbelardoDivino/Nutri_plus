const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const genTokens = (user) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  const access = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '15m' });
  const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
  return { access, refresh };
};

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ msg: 'Campos obrigatórios' });
    if (await User.findOne({ email })) return res.status(409).json({ msg: 'Email já cadastrado' });
    const allowed = ['usuario', 'nutricionista', 'personal'];
    const finalRole = role === 'admin' ? 'usuario' : (allowed.includes(role) ? role : 'usuario');
    const user = await User.create({ nome, email, senha, role: finalRole });
    const { access, refresh } = genTokens(user);
    res.status(201).json({ msg: 'Criado', user: { id: user._id, nome: user.nome, email: user.email, role: user.role }, access, refresh });
  } catch (e) { res.status(500).json({ msg: e.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email }).select('+senha');
    if (!user || !(await user.compareSenha(senha))) return res.status(401).json({ msg: 'Credenciais inválidas' });
    if (!user.ativo) return res.status(403).json({ msg: 'Usuário desativado' });
    const { access, refresh } = genTokens(user);
    res.json({ user: { id: user._id, nome: user.nome, email: user.email, role: user.role }, access, refresh });
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
  const user = await User.findById(req.user.id);
  res.json({ user });
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
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ msg: 'idToken obrigatório' });
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const { sub, email, name, picture } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ nome: name, email, googleId: sub, foto: picture, senha: Math.random().toString(36) });
    } else if (!user.googleId) {
      user.googleId = sub;
      if (picture) user.foto = picture;
      await user.save();
    }
    if (!user.ativo) return res.status(403).json({ msg: 'Usuário desativado' });
    const { access, refresh } = genTokens(user);
    res.json({ user: { id: user._id, nome: user.nome, email: user.email, role: user.role, foto: user.foto }, access, refresh });
  } catch (e) { res.status(401).json({ msg: 'Google token inválido', error: e.message }); }
};
