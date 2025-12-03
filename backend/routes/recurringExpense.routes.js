import express from 'express';
import { body } from 'express-validator';
import {
  createRecurringExpense,
  getRecurringExpenses,
  getRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense
} from '../controllers/recurringExpense.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authenticate);

const createRecurringExpenseValidation = [
  body('name').trim().notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('frequency').isIn(['daily', 'weekly', 'monthly']),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601(),
  body('categoryId').notEmpty()
];

const updateRecurringExpenseValidation = [
  body('name').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('categoryId').optional().notEmpty(),
  body('isActive').optional().isBoolean()
];

router.post('/', createRecurringExpenseValidation, validate, createRecurringExpense);
router.get('/', getRecurringExpenses);
router.get('/:id', getRecurringExpense);
router.put('/:id', updateRecurringExpenseValidation, validate, updateRecurringExpense);
router.delete('/:id', deleteRecurringExpense);

export default router;



