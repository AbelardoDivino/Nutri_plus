const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, isProfissional } = require('../middlewares/authJWT');
const { calcular, listar, obter } = require('../controllers/caloriaController');
const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ msg: 'Validação falhou', errors: errors.array() });
  next();
};

router.post('/calcular', verifyToken, isProfissional, [body('peso').isFloat({ min: 20, max: 300 }), body('altura').isFloat({ min: 100, max: 250 }), body('idade').isInt({ min: 10, max: 100 }), body('sexo').isIn(['masculino', 'feminino'])], validate, calcular);
router.get('/', verifyToken, listar);
router.get('/:id', verifyToken, obter);

module.exports = router;
