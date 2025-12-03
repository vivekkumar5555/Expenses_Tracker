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

// Test sending actual email (for debugging)
router.post('/send-test-email', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email address required' 
    });
  }

  try {
    const { sendOTPEmail } = await import('../services/email.service.js');
    const testCode = '123456';
    
    console.log('🧪 Test email requested for:', email);
    const result = await sendOTPEmail(email, testCode, 'password_reset');
    
    res.json({
      success: true,
      message: 'Test email sent (check logs for details)',
      code: testCode,
      email: email
    });
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
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

