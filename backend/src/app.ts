import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-authority-key']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local static assets if any
app.use('/assets', express.static(path.resolve(process.cwd(), 'public/assets')));

// Mount API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
