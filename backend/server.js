import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './src/routes/authRoutes.js';
import urlRoutes from './src/routes/urlRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import { redirectUrl } from './src/controllers/urlController.js';

dotenv.config();

const app = express();

// Allow both production (Vercel) and local dev origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://url-shortener-gi759esmc-redhudarsini3-9642s-projects.vercel.app',
  'http://localhost:5173', // kept for local development only
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Redirect route — must be LAST
app.get('/:shortCode', redirectUrl);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('MongoDB error:', err));