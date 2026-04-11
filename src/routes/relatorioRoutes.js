const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middlewares/validateRequest');
const relatorioController = require('../controllers/relatorioController');
const { relatorioAlunosValidator } = require('../validators/relatorioValidator');

const router = express.Router();

router.get(
  '/alunos',
  relatorioAlunosValidator,
  validateRequest,
  asyncHandler(relatorioController.alunosReport)
);

module.exports = router;
