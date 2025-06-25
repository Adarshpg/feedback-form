const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Note: batchId has been replaced with contactNo
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  collegeName: {
    type: String,
    required: true
  },
  contactNo: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  feedbacks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  }],
  completionPercentage: {
    type: Number,
    default: 0
  },
  feedbackGiven: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
