import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import chatRoutes from './routes/chatRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    jwtSecretExists: !!process.env.JWT_SECRET,
    jwtSecretValue: process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    mongodbUriExists: !!process.env.MONGODB_URI
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/chat', chatRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

export default app; 