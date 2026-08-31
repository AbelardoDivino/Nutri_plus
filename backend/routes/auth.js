const express = require('express');
const { register, login, refresh, me, createAdmin, googleLogin } = require('../controllers/authController');
const { verifyToken, isAdmin } = require('./middlewares/authJWT');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/refresh', refresh);
router.get('/me', verifyToken, me);
router.post('/admin', verifyToken, isAdmin, createAdmin);

module.exports = router;
