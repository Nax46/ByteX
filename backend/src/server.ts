import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    // Attempt database connection
    await connectDatabase();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.warn({
      msg: 'Continuing server startup without database connection; health API remains operational',
      error: message,
    });
  }

  // Start HTTP server
  const server = app.listen(env.PORT, () => {
    logger.info({
      msg: 'AI SkillPath backend server running',
      port: env.PORT,
      environment: env.NODE_ENV,
      healthCheckUrl: `http://localhost:${env.PORT}/api/health`,
    });
  });

  // Graceful shutdown handling
  const shutdown = (signal: string): void => {
    logger.info({ msg: `Received ${signal}, shutting down gracefully...` });
    server.close(() => {
      logger.info({ msg: 'HTTP server closed' });
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.fatal({
    msg: 'Fatal error during server startup',
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
