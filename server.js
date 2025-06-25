const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - temporarily allowing all origins for debugging
app.use(cors({
  origin: '*',  // Allow all origins - in production, replace with specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  next();
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://gayadolliadarsh:NfPJCdgebXMfMKGp@cluster0.tnzuyo6.mongodb.net/registration_db?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Use routes
app.use('/api/students', studentRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
