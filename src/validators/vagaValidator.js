const { body, query } = require('express-validator');

const vagaCreateValidator = [
  body('titulo').notEmpty().withMessage('Título é obrigatório.'),
  body('descricao').notEmpty().withMessage('Descrição é obrigatória.'),
  body('empresa').notEmpty().withMessage('Empresa é obrigatória.'),
  body('data_expiracao').isISO8601().withMessage('Data de expiração inválida.'),
  body('requisitos').optional(),
  body('status').optional().isIn(['ativa', 'expirada', 'encerrada']),
];

const vagaUpdateValidator = [...vagaCreateValidator];

const vagaListValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['ativa', 'expirada', 'encerrada']),
];

module.exports = {
  vagaCreateValidator,
  vagaUpdateValidator,
  vagaListValidator,
};
