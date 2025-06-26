const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { studentId, answers, completionPercentage } = req.body;

    // Create new feedback
    const feedback = new Feedback({
      student: studentId,
      answers,
      completionPercentage
    });

    await feedback.save();

    // Update student's feedback given array
    const student = await Student.findByIdAndUpdate(
      studentId,
      { $addToSet: { feedbackGiven: completionPercentage } },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @desc    Get all feedbacks for a student
// @route   GET /api/feedback/student/:studentId
// @access  Public
router.get('/student/:studentId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ student: req.params.studentId });
    res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (err) {
    console.error('Get feedbacks error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @desc    Get feedback by completion percentage
// @route   GET /api/feedback/student/:studentId/completion/:percentage
// @access  Public
router.get('/student/:studentId/completion/:percentage', async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      student: req.params.studentId,
      completionPercentage: req.params.percentage
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json({ success: true, data: feedback });
  } catch (err) {
    console.error('Get feedback by completion error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
