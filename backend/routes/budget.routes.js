import express from 'express';
import { body } from 'express-validator';
import {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budget.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authenticate);

const createBudgetValidation = [
  body('name').trim().notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('period').isIn(['weekly', 'monthly', 'custom']),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601(),
  body('alertThreshold').optional().isFloat({ min: 0, max: 100 })
];

const updateBudgetValidation = [
  body('name').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('period').optional().isIn(['weekly', 'monthly', 'custom']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('alertThreshold').optional().isFloat({ min: 0, max: 100 })
];

router.post('/', createBudgetValidation, validate, createBudget);
router.get('/', getBudgets);
router.get('/:id', getBudget);
router.put('/:id', updateBudgetValidation, validate, updateBudget);
router.delete('/:id', deleteBudget);

export default router;



