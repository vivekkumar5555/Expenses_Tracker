import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  getMe
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const passwordResetValidation = [
  body('email').isEmail().normalizeEmail()
];

const verifyOTPValidation = [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric()
];

const resetPasswordValidation = [
  body('resetToken').notEmpty(),
  body('newPassword').isLength({ min: 6 })
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', passwordResetValidation, validate, requestPasswordReset);
router.post('/verify-otp', verifyOTPValidation, validate, verifyOTP);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);
router.get('/me', authenticate, getMe);

export default router;



