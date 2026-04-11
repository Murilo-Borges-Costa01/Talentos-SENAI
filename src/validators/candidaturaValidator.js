const { body, query } = require('express-validator');

const candidaturaCreateValidator = [
  body('id_aluno').isInt({ min: 1 }).withMessage('id_aluno inválido.'),
  body('id_vaga').isInt({ min: 1 }).withMessage('id_vaga inválido.'),
];

const listCandidatosValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  candidaturaCreateValidator,
  listCandidatosValidator,
};
