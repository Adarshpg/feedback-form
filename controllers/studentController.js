const Student = require('../models/Student');

// @desc    Register a new student
// @route   POST /api/students
// @access  Public
exports.registerStudent = async (req, res) => {
  try {
    console.log('Received registration request with data:', req.body);
    
    const { name, email, rollNumber, collegeName, course, semester } = req.body;
    
    console.log('Extracted data:', { name, email, rollNumber, collegeName, course, semester });

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
    console.error('Error in registerStudent:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      ...(err.errors && { errors: err.errors })
    });
    res.status(500).send('Server error');
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
