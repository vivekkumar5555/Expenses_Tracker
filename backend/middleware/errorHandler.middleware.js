export const errorHandler = (err, req, res, next) => {
  // Don't handle errors if response was already sent
  if (res.headersSent) {
    return next(err);
  }

  console.error('Error Handler:', err.message);
  console.error('   Code:', err.code);
  console.error('   Path:', req.path);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      message: 'Duplicate entry. This record already exists.',
      field: err.meta?.target?.[0]
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      message: 'Record not found'
    });
  }

  // Database connection errors
  if (err.code === 'P1001' || err.message?.includes('Can\'t reach database')) {
    return res.status(503).json({
      message: 'Database connection failed. Please try again later.'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.type === 'validation') {
    return res.status(400).json({
      message: err.message || 'Validation error',
      errors: err.errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  // Default error - ensure response is sent
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      code: err.code 
    })
  });
};



