const Student = require('../models/Student');

// @desc    Login student
// @route   POST /api/students/login
// @access  Public
exports.loginStudent = async (req, res) => {
  try {
    const { email, rollNumber } = req.body;
    
    // Find student by email and roll number
    const student = await Student.findOne({ email, rollNumber });
    
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Return student data (excluding sensitive information)
    const { _id, name, completionPercentage, feedbackGiven } = student;
    
    res.status(200).json({
      success: true,
      data: {
        _id,
        name,
        email,
        rollNumber,
        completionPercentage,
        feedbackGiven
      }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Register a new student
// @route   POST /api/students
// @access  Public
exports.registerStudent = async (req, res) => {
  try {
    console.log('Received registration request with data:', req.body);
    
    const { name, email, rollNumber, collegeName, contactNo, course, semester } = req.body;
    
    console.log('Extracted data:', { name, email, rollNumber, collegeName, contactNo, course, semester });

    // Check if student already exists
    let student = await Student.findOne({ email });
    if (student) {
      console.log('Registration failed: Student with this email already exists');
      return res.status(400).json({ message: 'Student already exists' });
    }

    const newStudent = new Student({
      name,
      email,
      rollNumber,
      collegeName,
      contactNo,
      course,
      semester,
      completionPercentage: 0,
      feedbackGiven: false
    });

    console.log('New student object to be saved:', newStudent);

    const savedStudent = await newStudent.save();
    console.log('Student saved successfully:', savedStudent);
    
    res.status(201).json(savedStudent);
  } catch (err) {
    console.error('❌ Error in registerStudent:', {
      message: err.message,
      name: err.name,
      code: err.code,
      keyPattern: err.keyPattern,
      keyValue: err.keyValue,
      stack: err.stack,
      ...(err.errors && { errors: err.errors })
    });
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = err.keyValue[field];
      console.error(`Duplicate key error: ${field} '${value}' already exists`);
      return res.status(400).json({ 
        success: false, 
        error: `${field} '${value}' is already registered` 
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    // For all other errors
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
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

// @desc    Update student's course progress
// @route   PUT /api/students/:id/progress
// @access  Public
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
