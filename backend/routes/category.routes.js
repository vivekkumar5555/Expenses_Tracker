import express from 'express';
import { body } from 'express-validator';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(authenticate);

const createCategoryValidation = [
  body('name').trim().notEmpty(),
  body('icon').optional(),
  body('color').optional()
];

const updateCategoryValidation = [
  body('name').optional().trim().notEmpty(),
  body('icon').optional(),
  body('color').optional()
];

router.get('/', getCategories);
router.post('/', createCategoryValidation, validate, createCategory);
router.put('/:id', updateCategoryValidation, validate, updateCategory);
router.delete('/:id', deleteCategory);

export default router;



