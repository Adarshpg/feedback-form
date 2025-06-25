const express = require('express');
const router = express.Router();
const { 
  submitFeedback, 
  getStudentFeedbacks,
  getFeedbackByCompletion 
} = require('../controllers/feedbackController');

// Submit feedback
router.post('/', submitFeedback);

// Get all feedbacks for a student
router.get('/student/:studentId', getStudentFeedbacks);

// Get feedback by completion percentage
router.get('/:studentId/:completionPercentage', getFeedbackByCompletion);

module.exports = router;
