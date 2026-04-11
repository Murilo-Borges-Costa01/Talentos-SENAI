const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middlewares/validateRequest');
const candidaturaController = require('../controllers/candidaturaController');
const { candidaturaCreateValidator } = require('../validators/candidaturaValidator');

const router = express.Router();

router.post(
  '/',
  candidaturaCreateValidator,
  validateRequest,
  asyncHandler(candidaturaController.create)
);
router.delete('/:id', asyncHandler(candidaturaController.remove));

module.exports = router;
