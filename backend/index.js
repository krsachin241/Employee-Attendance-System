

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import { MONGO_URI } from './config.js';
import authRoutes from './routes/auth.js';
import attendanceRoutes from './routes/attendance.js';
import { authMiddleware, roleMiddleware } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Attendance Tracking System API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
