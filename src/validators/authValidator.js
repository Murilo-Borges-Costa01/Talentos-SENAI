const { body } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('Email inválido.'),
  body('senha').notEmpty().withMessage('Senha é obrigatória.'),
];

module.exports = {
  loginValidator,
};
