const Student = require('../models/Student');
const Feedback = require('../models/Feedback');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, rollNumber, collegeName, contactNo, course, semester } = req.body;

    // Check if student already exists with email or roll number
    const existingStudent = await Student.findOne({ 
      $or: [
        { email },
        { rollNumber }
      ]
    });

    if (existingStudent) {
      return next(
        new ErrorResponse('Student with this email or roll number already exists', 400)
      );
    }

    // Create student
    const student = await Student.create({
      name,
      email,
      rollNumber,
      collegeName,
      contactNo,
      course,
      semester
    });

    // Generate login token (roll number based)
    const loginToken = student.generateLoginToken();
    
    res.status(201).json({
      success: true,
      token: loginToken,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        collegeName: student.collegeName,
        contactNo: student.contactNo,
        course: student.course,
        semester: student.semester,
        completionPercentage: student.completionPercentage,
        feedbackGiven: student.feedbackGiven
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login student using email and roll number
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, rollNumber } = req.body;

    // Validate email and roll number
    if (!email || !rollNumber) {
      return next(new ErrorResponse('Please provide both email and roll number', 400));
    }

    // Check for student
    const student = await Student.findOne({ email, rollNumber });

    if (!student) {
      return next(new ErrorResponse('Invalid email or roll number', 401));
    }

    // Generate login token (roll number based)
    const loginToken = student.generateLoginToken();
    
    res.status(200).json({
      success: true,
      token: loginToken,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        collegeName: student.collegeName,
        contactNo: student.contactNo,
        course: student.course,
        semester: student.semester,
        completionPercentage: student.completionPercentage,
        feedbackGiven: student.feedbackGiven
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in student
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const student = await Student.findById(req.student.id);
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout student / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Get roll number from request body or query
    const { rollNumber } = req.body.rollNumber ? req.body : req.query;
    
    if (!rollNumber) {
      return next(new ErrorResponse('Roll number is required for authentication', 400));
    }

    // Verify token with roll number
    const student = await Student.verifyLoginToken(rollNumber, token);
    
    if (!student) {
      return next(new ErrorResponse('Invalid token', 401));
    }

    req.student = student;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// @desc    Register a new student (deprecated, use /api/auth/register instead)
// @route   POST /api/students
// @access  Public
exports.registerStudent = async (req, res, next) => {
  // Just call the main register function for backward compatibility
  return exports.register(req, res, next);
};

// @desc    Get all students
// @route   GET /api/students
// @access  Public
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Public
exports.getStudent = async (req, res) => {
  try {
    console.log('Fetching student with ID:', req.params.id);
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      console.log('Student not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Found student:', JSON.stringify(student, null, 2));
    res.json(student);
  } catch (err) {
    console.error('Error in getStudent:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      kind: err.kind,
      value: err.value
    });
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Get all feedbacks for a student
// @route   GET /api/students/:studentId/feedbacks
// @access  Private
exports.getStudentFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ student: req.params.studentId });
    
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get feedback by completion percentage
// @route   GET /api/students/:studentId/feedback/:completionPercentage
// @access  Private
exports.getFeedbackByCompletion = async (req, res, next) => {
  try {
    const { studentId, completionPercentage } = req.params;
    
    const feedback = await Feedback.findOne({
      student: studentId,
      completionPercentage: parseInt(completionPercentage)
    });
    
    if (!feedback) {
      return next(
        new ErrorResponse('Feedback not found for this completion percentage', 404)
      );
    }
    
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update student's course progress
// @route   PUT /api/students/:id/progress
// @access  Private
exports.updateStudentProgress = async (req, res) => {
  try {
    const { completionPercentage } = req.body;
    
    // Validate completion percentage
    if (![0, 20, 50, 100].includes(completionPercentage)) {
      return res.status(400).json({ message: 'Invalid completion percentage' });
    }

    let student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Only update if the new percentage is higher than current
    if (completionPercentage > student.completionPercentage) {
      student.completionPercentage = completionPercentage;
      student.feedbackGiven = false; // Reset feedback flag when progress updates
      await student.save();
    }

    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
