const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add a roll number'],
    unique: true
  },
  collegeName: {
    type: String,
    required: [true, 'Please add a college name']
  },
  contactNo: {
    type: String,
    required: [true, 'Please add a contact number']
  },
  course: {
    type: String,
    required: [true, 'Please add a course']
  },
  semester: {
    type: Number,
    required: [true, 'Please add a semester']
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  feedbackGiven: {
    type: Boolean,
    default: false
  },
  feedbacks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Sign JWT and return
studentSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Generate login token (roll number)
studentSchema.methods.generateLoginToken = function() {
  // Simple token generation using roll number and current timestamp
  return Buffer.from(`${this.rollNumber}:${Date.now()}`).toString('base64');
};

// Verify login token
studentSchema.statics.verifyLoginToken = async function(rollNumber, token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const [storedRollNumber] = decoded.split(':');
    
    if (storedRollNumber === rollNumber) {
      const student = await this.findOne({ rollNumber });
      return student;
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = mongoose.model('Student', studentSchema);
