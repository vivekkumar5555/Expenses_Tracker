import express from 'express';
import { body } from 'express-validator';
import {
  createSavingsGoal,
  getSavingsGoals,
  getSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal
} from '../controllers/savingsGoal.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authenticate);

const createSavingsGoalValidation = [
  body('name').trim().notEmpty(),
  body('targetAmount').isFloat({ min: 0 }),
  body('targetDate').isISO8601(),
  body('currentAmount').optional().isFloat({ min: 0 })
];

const updateSavingsGoalValidation = [
  body('name').optional().trim().notEmpty(),
  body('targetAmount').optional().isFloat({ min: 0 }),
  body('targetDate').optional().isISO8601(),
  body('currentAmount').optional().isFloat({ min: 0 })
];

router.post('/', createSavingsGoalValidation, validate, createSavingsGoal);
router.get('/', getSavingsGoals);
router.get('/:id', getSavingsGoal);
router.put('/:id', updateSavingsGoalValidation, validate, updateSavingsGoal);
router.delete('/:id', deleteSavingsGoal);

export default router;



