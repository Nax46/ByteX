import express, { Application } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './utils/logger';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import assessmentRoutes from './routes/assessment.routes';
import dashboardRoutes from './routes/dashboard.routes';
import intelligenceRoutes from './routes/intelligence.routes';
import resourceRoutes from './routes/resource.routes';
import projectRoutes from './routes/project.routes';
import { notFoundHandler } from './middleware/notFound.middleware';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// Middleware: CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// Middleware: Structured request logging
app.use(
  pinoHttp({
    logger,
  })
);

// Middleware: Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/v1/intelligence', intelligenceRoutes);

// Middleware: Undefined route 404 handler
app.use(notFoundHandler);

// Middleware: Centralized error handler
app.use(errorHandler);

export default app;
