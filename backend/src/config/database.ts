import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

// Configure DNS servers for reliable SRV resolution on Windows environments
if (env.MONGO_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (_e) {
    // Fallback to system default DNS if setServers fails
  }
}

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    const connection = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    // Never log MONGO_URI or credentials
    logger.info({
      msg: 'MongoDB connected successfully',
      database: connection.connection.name,
      host: connection.connection.host,
    });

    return connection;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    // Log failure message safely without exposing URI or credentials
    logger.error({
      msg: 'MongoDB connection failed',
      error: message,
    });
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info({ msg: 'MongoDB disconnected successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ msg: 'MongoDB disconnect error', error: message });
  }
};
