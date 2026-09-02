const express = require('express');
const { body, validationResult } = require('express-validator');

const {
    register,
    login,
    refresh,
    me,
    createAdmin,
    googleLogin,
    listAdmins,
    escolherProfissional,
    completarPerfil
} = require('../controllers/authController');

const {
    verifyToken,
    isAdmin
} = require('../middlewares/authJWT');
const { limiter } = require('../middlewares/rateLimiter');

const router = express.Router();
// Limite: 10 logins/min por IP, teste de limites
const loginLimiter = limiter({ windowMs: 60000, max: 10 });
const googleLimiter = limiter({ windowMs: 60000, max: 20 });

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ msg: 'Validação falhou', errors: errors.array() });
  next();
};

// Rotas públicas
router.post('/register', [body('nome').notEmpty().trim(), body('email').isEmail().normalizeEmail(), body('senha').isLength({ min: 6 })], validate, register);
router.post('/login', loginLimiter, [body('email').isEmail(), body('senha').notEmpty()], validate, login);
router.post('/google', googleLimiter, [body('idToken').notEmpty()], validate, googleLogin);
router.post('/refresh', [body('refresh').notEmpty()], validate, refresh);

// Rotas autenticadas
router.get('/me', verifyToken, me);
router.get('/profissionais', verifyToken, listAdmins);
router.post('/escolher-profissional', verifyToken, escolherProfissional);
router.put('/completar-perfil', verifyToken, completarPerfil);

// Rotas de administrador
router.get('/admins', verifyToken, isAdmin, listAdmins);
router.post('/admin', verifyToken, isAdmin, createAdmin);

module.exports = router;