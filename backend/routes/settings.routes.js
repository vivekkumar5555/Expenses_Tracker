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
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('language').optional().isLength({ min: 2, max: 5 }),
  body('approvalLimit').optional().isFloat({ min: 0 }),
  body('theme').optional().isIn(['light', 'dark'])
];

router.get('/', getSettings);
router.put('/', updateSettingsValidation, validate, updateSettings);

export default router;



