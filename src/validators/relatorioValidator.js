const { query } = require('express-validator');

const relatorioAlunosValidator = [
  query('vaga').optional().isInt({ min: 1 }),
  query('turma').optional().isString(),
  query('apenas_candidatos').optional().isBoolean(),
  query('apenas_compativeis').optional().isBoolean(),
  query('ano_conclusao').optional().isInt({ min: 1900, max: 3000 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  relatorioAlunosValidator,
};
