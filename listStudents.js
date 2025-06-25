const mongoose = require('mongoose');
const Student = require('./models/Student');
require('dotenv').config();

async function listStudents() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-feedback', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    const students = await Student.find({});
    console.log('Students in database:');
    console.log(JSON.stringify(students, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listStudents();
