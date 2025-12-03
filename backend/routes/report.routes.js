import express from 'express';
import {
  getSummary,
  getCategoryBreakdown,
  getVendorBreakdown,
  exportCSV
} from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/category-breakdown', getCategoryBreakdown);
router.get('/vendor-breakdown', getVendorBreakdown);
router.get('/export-csv', exportCSV);

export default router;



