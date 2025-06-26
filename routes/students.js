const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStudents,
  getStudent,
  updateStudentProgress,
  getStudentFeedbacks,
  getFeedbackByCompletion
} = require('../controllers/studentController');

// Protected routes (require authentication)
router.use(protect);

// Student routes
router.get('/', getStudents);
router.get('/:id', getStudent);
router.patch('/:id/progress', updateStudentProgress);
router.get('/:studentId/feedbacks', getStudentFeedbacks);
router.get('/:studentId/feedback/:completionPercentage', getFeedbackByCompletion);

module.exports = router;
