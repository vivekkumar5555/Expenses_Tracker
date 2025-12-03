import express from 'express';
import { body } from 'express-validator';
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expense.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createExpenseValidation = [
  body('amount').isFloat({ min: 0 }),
  body('date').isISO8601(),
  body('categoryId').notEmpty(),
  body('paymentMode').optional().isIn(['cash', 'card', 'bank_transfer', 'digital_wallet', 'other'])
];

const updateExpenseValidation = [
  body('amount').optional().isFloat({ min: 0 }),
  body('date').optional().isISO8601(),
  body('paymentMode').optional().isIn(['cash', 'card', 'bank_transfer', 'digital_wallet', 'other'])
];

// Routes
router.post('/', createExpenseValidation, validate, createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpense);
router.put('/:id', updateExpenseValidation, validate, updateExpense);
router.delete('/:id', deleteExpense);

export default router;



