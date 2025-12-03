import express from 'express';
import { body } from 'express-validator';
import {
  getSettings,
  updateSettings
} from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authenticate);

const updateSettingsValidation = [
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('Currency must be exactly 3 characters'),
  body('language').optional().trim().isLength({ min: 2, max: 5 }).withMessage('Language must be 2-5 characters'),
  body('approvalLimit').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  }).withMessage('Approval limit must be a positive number'),
  body('theme').optional().isIn(['light', 'dark']).withMessage('Theme must be light or dark')
];

router.get('/', getSettings);
router.put('/', updateSettingsValidation, validate, updateSettings);

export default router;



