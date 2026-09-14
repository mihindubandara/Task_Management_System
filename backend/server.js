const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serverless DB Connection Handler
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Timeout වෙන එක නවත්වයි
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB Connected Successfully! 🚀');
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
};

// Request එකක් එන සෑම අවස්ථාවකම DB Connection එක Check කරන Middleware එක
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ message: 'Database connection error', error: error.message });
  }
});

// Test route
app.get('/', (req, res) => {
    res.status(200).send('API is running successfully... 🚀');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Vercel Serverless Export
module.exports = app;

// For Local Development only
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
    });
}