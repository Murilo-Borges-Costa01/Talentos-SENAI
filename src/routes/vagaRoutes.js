const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middlewares/validateRequest');
const vagaController = require('../controllers/vagaController');
const {
  vagaCreateValidator,
  vagaUpdateValidator,
  vagaListValidator,
} = require('../validators/vagaValidator');
const { listCandidatosValidator } = require('../validators/candidaturaValidator');

const router = express.Router();

router.post('/', vagaCreateValidator, validateRequest, asyncHandler(vagaController.create));
router.get('/', vagaListValidator, validateRequest, asyncHandler(vagaController.list));
router.get('/:id', asyncHandler(vagaController.getById));
router.put('/:id', vagaUpdateValidator, validateRequest, asyncHandler(vagaController.update));
router.delete('/:id', asyncHandler(vagaController.remove));
router.patch('/:id/encerrar', asyncHandler(vagaController.close));

router.get(
  '/:id/candidatos',
  listCandidatosValidator,
  validateRequest,
  asyncHandler(vagaController.listCandidatos)
);
router.get('/:id/quantidade-candidatos', asyncHandler(vagaController.countCandidatos));
router.get('/:id/compatibilidade', asyncHandler(vagaController.getCompatibilidade));

module.exports = router;
