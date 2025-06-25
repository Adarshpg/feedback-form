const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Get allowed origins from environment variable
const whitelist = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : [];

console.log('Allowed origins:', whitelist);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    console.log('Incoming origin:', origin);
    if (!origin || whitelist.some(allowed => origin.startsWith(allowed))) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.error(`Origin not allowed: ${origin}`);
      console.error('Allowed origins:', whitelist);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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

// MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://gayadolliadarsh:NfPJCdgebXMfMKGp@cluster0.tnzuyo6.mongodb.net/registration_db?retryWrites=true&w=majority';

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to the database
connectDB();

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Log route registration
console.log('Registering routes...');

// Use routes with error handling
app.use('/api/students', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming request to /api/students${req.url}`);
  next();
}, studentRoutes);

app.use('/api/feedback', feedbackRoutes);

// Log all registered routes
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`Registered route: ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  }
});

// 404 handler
app.use((req, res) => {
  console.error(`404: Route not found - ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error in request:', {
    method: req.method,
    url: req.originalUrl,
    error: {
      message: err.message,
      name: err.name,
      stack: err.stack,
      ...(err.errors && { errors: err.errors })
    }
  });
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // You might want to exit the process in production
  // process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // You might want to exit the process in production
  // process.exit(1);
});

function printRoutes(layer, path = '') {
  if (layer.route) {
    console.log(`  ${Object.keys(layer.route.methods).join(',').toUpperCase()} ${path + layer.route.path}`);
  } else if (layer.name === 'router') {
    layer.handle.stack.forEach((sublayer) => {
      printRoutes(sublayer, path + (layer.regexp.toString().includes('^/?\\/?(?=\\/|$)') ? '' : layer.regexp.source));
    });
  }
}

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  console.log('Available routes:');
  app._router.stack.forEach(printRoutes);
  console.log('Press CTRL+C to stop the server');
});
