const express = require('express');
const { verifyToken, isProfissional } = require('../middlewares/authJWT');
const { calcular, listar, obter } = require('../controllers/caloriaController');
const router = express.Router();

router.post('/calcular', verifyToken, isProfissional, calcular);
router.get('/', verifyToken, listar);
router.get('/:id', verifyToken, obter);

module.exports = router;
