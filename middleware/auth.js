const ErrorResponse = require('../utils/errorResponse');
const Student = require('../models/Student');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from query params
  else if (req.query.token) {
    token = req.query.token;
  }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Get roll number from header, body, or query params
    const rollNumber = req.headers['x-roll-number'] || req.body.rollNumber || req.query.rollNumber;
    
    if (!rollNumber) {
      return next(new ErrorResponse('Roll number is required for authentication', 400));
    }

    // Verify token with roll number
    const student = await Student.verifyLoginToken(rollNumber, token);
    
    if (!student) {
      return next(new ErrorResponse('Invalid token or roll number', 401));
    }

    // Add student to request object
    req.student = student;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Middleware to check if user is admin
exports.admin = (req, res, next) => {
  // Add admin check logic here if needed
  // For now, we'll just pass through
  next();
};
