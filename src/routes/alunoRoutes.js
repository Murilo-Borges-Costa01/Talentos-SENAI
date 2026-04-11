const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middlewares/validateRequest');
const alunoController = require('../controllers/alunoController');
const {
  alunoCreateValidator,
  alunoUpdateValidator,
  alunoListValidator,
} = require('../validators/alunoValidator');

const router = express.Router();

router.post('/', alunoCreateValidator, validateRequest, asyncHandler(alunoController.create));
router.get('/', alunoListValidator, validateRequest, asyncHandler(alunoController.list));
router.get('/:id', asyncHandler(alunoController.getById));
router.put('/:id', alunoUpdateValidator, validateRequest, asyncHandler(alunoController.update));
router.delete('/:id', asyncHandler(alunoController.remove));

module.exports = router;
