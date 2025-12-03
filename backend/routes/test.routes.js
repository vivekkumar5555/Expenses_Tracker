import express from 'express';
import { testEmailConnection } from '../services/email.service.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Test email configuration
router.get('/email-config', async (req, res) => {
  const config = {
    EMAIL_HOST: process.env.EMAIL_HOST ? 'SET' : 'NOT SET',
    EMAIL_PORT: process.env.EMAIL_PORT || 'NOT SET',
    EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'SET (hidden)' : 'NOT SET',
    EMAIL_FROM: process.env.EMAIL_FROM || 'NOT SET',
  };
  
  res.json({
    message: 'Email configuration status',
    config,
    note: 'Check if all values are SET (not NOT SET)',
  });
});

// Test email connection
router.get('/email-test', async (req, res) => {
  const result = await testEmailConnection();
  res.json(result);
});

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'Database connection successful',
    });
  } catch (error) {
    res.json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

export default router;

