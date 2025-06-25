const Feedback = require('../models/Feedback');
const Student = require('../models/Student');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public
exports.submitFeedback = async (req, res) => {
  try {
    const { studentId, completionPercentage, answers, additionalComments } = req.body;

    // Validate completion percentage
    if (![20, 50, 100].includes(completionPercentage)) {
      return res.status(400).json({ message: 'Invalid completion percentage' });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if feedback already submitted for this completion percentage
    const existingFeedback = await Feedback.findOne({
      student: studentId,
      completionPercentage
    });

    if (existingFeedback) {
      return res.status(400).json({ 
        message: `Feedback already submitted for ${completionPercentage}% completion` 
      });
    }

    // Create new feedback
    const feedback = new Feedback({
      student: studentId,
      completionPercentage,
      answers,
      additionalComments
    });

    await feedback.save();

    // Add feedback to student's feedbacks array
    student.feedbacks.push(feedback._id);
    
    // If this is the 100% completion feedback, mark feedback as given
    if (completionPercentage === 100) {
      student.feedbackGiven = true;
    }
    
    await student.save();

    res.status(201).json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all feedbacks for a student
// @route   GET /api/feedback/student/:studentId
// @access  Public
exports.getStudentFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ student: req.params.studentId })
      .sort({ completionPercentage: 1 });
    
    res.json(feedbacks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get feedback by completion percentage
// @route   GET /api/feedback/:studentId/:completionPercentage
// @access  Public
exports.getFeedbackByCompletion = async (req, res) => {
  try {
    const { studentId, completionPercentage } = req.params;
    
    // Validate completion percentage
    if (![20, 50, 100].includes(Number(completionPercentage))) {
      return res.status(400).json({ message: 'Invalid completion percentage' });
    }

    const feedback = await Feedback.findOne({
      student: studentId,
      completionPercentage: Number(completionPercentage)
    });

    if (!feedback) {
      return res.status(404).json({ 
        message: `No feedback found for ${completionPercentage}% completion` 
      });
    }

    res.json(feedback);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
