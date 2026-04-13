const { body } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('Email inválido.'),
  body('senha').notEmpty().withMessage('Senha é obrigatória.'),
];

const registerValidator = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório.'),
  body('email').isEmail().withMessage('Email inválido.'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve conter pelo menos 6 caracteres.'),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Email inválido.'),
  body('nova_senha')
    .isLength({ min: 6 })
    .withMessage('A nova senha deve conter pelo menos 6 caracteres.'),
];

module.exports = {
  loginValidator,
  registerValidator,
  forgotPasswordValidator,
};
