const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`.red);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
