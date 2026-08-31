const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  const token = auth && auth.startsWith('Bearer ') ? auth.split(' ')[1] : null;
  if (!token) return res.status(401).json({ msg: 'Token não fornecido' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ msg: 'Token inválido ou expirado' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Acesso apenas admin' });
  next();
};

exports.isProfissional = (req, res, next) => {
  if (!['admin', 'nutricionista', 'personal'].includes(req.user.role)) {
    return res.status(403).json({ msg: 'Acesso apenas profissionais' });
  }
  next();
};
