const { body, query } = require('express-validator');

function validateSenaiFields(req) {
  return (req.body.tipo_aluno || 'senai') === 'senai';
}

const alunoCreateValidator = [
  body('nome').notEmpty().withMessage('Nome é obrigatório.'),
  body('email').isEmail().withMessage('Email inválido.'),
  body('contato').notEmpty().withMessage('Contato é obrigatório.'),
  body('tipo_aluno')
    .optional()
    .isIn(['senai', 'externo'])
    .withMessage('tipo_aluno deve ser senai ou externo.'),
  body('curso').custom((value, { req }) => {
    if (validateSenaiFields(req) && (!value || !String(value).trim())) {
      throw new Error('Curso é obrigatório para aluno do SENAI.');
    }
    return true;
  }),
  body('ano_conclusao').custom((value, { req }) => {
    if (validateSenaiFields(req) && (value === undefined || value === null || value === '')) {
      throw new Error('Ano de conclusão é obrigatório para aluno do SENAI.');
    }

    if (value !== undefined && value !== null && value !== '') {
      const num = Number(value);
      if (!Number.isInteger(num) || num < 1900 || num > 3000) {
        throw new Error('Ano de conclusão inválido.');
      }
    }

    return true;
  }),
  body('turma').custom((value, { req }) => {
    if (validateSenaiFields(req) && (!value || !String(value).trim())) {
      throw new Error('Turma é obrigatória para aluno do SENAI.');
    }
    return true;
  }),
  body('descricao').optional().isString(),
];

const alunoUpdateValidator = [
  body('nome').notEmpty().withMessage('Nome é obrigatório.'),
  body('email').isEmail().withMessage('Email inválido.'),
  body('contato').notEmpty().withMessage('Contato é obrigatório.'),
  body('tipo_aluno')
    .optional()
    .isIn(['senai', 'externo'])
    .withMessage('tipo_aluno deve ser senai ou externo.'),
  body('curso').custom((value, { req }) => {
    if (validateSenaiFields(req) && (!value || !String(value).trim())) {
      throw new Error('Curso é obrigatório para aluno do SENAI.');
    }
    return true;
  }),
  body('ano_conclusao').custom((value, { req }) => {
    if (validateSenaiFields(req) && (value === undefined || value === null || value === '')) {
      throw new Error('Ano de conclusão é obrigatório para aluno do SENAI.');
    }

    if (value !== undefined && value !== null && value !== '') {
      const num = Number(value);
      if (!Number.isInteger(num) || num < 1900 || num > 3000) {
        throw new Error('Ano de conclusão inválido.');
      }
    }

    return true;
  }),
  body('turma').custom((value, { req }) => {
    if (validateSenaiFields(req) && (!value || !String(value).trim())) {
      throw new Error('Turma é obrigatória para aluno do SENAI.');
    }
    return true;
  }),
  body('descricao').optional().isString(),
];

const alunoListValidator = [
  query('ano_conclusao').optional().isInt().withMessage('Ano inválido.'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  alunoCreateValidator,
  alunoUpdateValidator,
  alunoListValidator,
};
