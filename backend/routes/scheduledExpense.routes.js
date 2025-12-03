import express from 'express';
import { body } from 'express-validator';
import {
  createScheduledExpense,
  getScheduledExpenses,
  getScheduledExpense,
  updateScheduledExpense,
  deleteScheduledExpense
} from '../controllers/scheduledExpense.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authenticate);

const createScheduledExpenseValidation = [
  body('name').trim().notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('categoryId').notEmpty()
];

const updateScheduledExpenseValidation = [
  body('name').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('dueDate').optional().isISO8601(),
  body('categoryId').optional().notEmpty(),
  body('status').optional().isIn(['pending', 'paid', 'overdue'])
];

router.post('/', createScheduledExpenseValidation, validate, createScheduledExpense);
router.get('/', getScheduledExpenses);
router.get('/:id', getScheduledExpense);
router.put('/:id', updateScheduledExpenseValidation, validate, updateScheduledExpense);
router.delete('/:id', deleteScheduledExpense);

export default router;



