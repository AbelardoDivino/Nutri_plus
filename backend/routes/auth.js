const express = require('express');

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

const router = express.Router();

// Rotas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/refresh', refresh);

// Rotas autenticadas
router.get('/me', verifyToken, me);
router.get('/profissionais', verifyToken, listAdmins);
router.post('/escolher-profissional', verifyToken, escolherProfissional);
router.put('/completar-perfil', verifyToken, completarPerfil);

// Rotas de administrador
router.get('/admins', verifyToken, isAdmin, listAdmins);
router.post('/admin', verifyToken, isAdmin, createAdmin);

module.exports = router;