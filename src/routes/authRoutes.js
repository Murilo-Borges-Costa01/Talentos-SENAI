const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middlewares/validateRequest');
const { loginValidator } = require('../validators/authValidator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', loginValidator, validateRequest, asyncHandler(authController.login));

module.exports = router;
