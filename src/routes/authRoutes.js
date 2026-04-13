const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../middlewares/validateRequest');
const {
	loginValidator,
	registerValidator,
	forgotPasswordValidator,
} = require('../validators/authValidator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', loginValidator, validateRequest, asyncHandler(authController.login));
router.post('/register', registerValidator, validateRequest, asyncHandler(authController.register));
router.post(
	'/forgot-password',
	forgotPasswordValidator,
	validateRequest,
	asyncHandler(authController.forgotPassword)
);

module.exports = router;
