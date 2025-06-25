const express = require('express');
const router = express.Router();
const { 
  registerStudent, 
  getStudents, 
  getStudent, 
  updateStudentProgress 
} = require('../controllers/studentController');

// Register a new student
router.post('/', registerStudent);

// Get all students
router.get('/', getStudents);

// Get a single student
router.get('/:id', getStudent);

// Update student's course progress
router.put('/:id/progress', updateStudentProgress);

module.exports = router;
