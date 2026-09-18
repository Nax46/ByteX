import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Attempt to load pino logger and env helper safely if present
let envMongoUri: string | undefined;
try {
  const { env } = require('./env');
  envMongoUri = env?.MONGO_URI;
} catch (_e) {
  // env module fallback
}

let logger: any;
try {
  const loggerModule = require('../utils/logger');
  logger = loggerModule?.logger;
} catch (_e) {
  // logger module fallback
}

const getMongoUri = (customUri?: string): string => {
  return customUri || process.env.MONGODB_URI || envMongoUri || 'mongodb://127.0.0.1:27017/ai-skillpath-dev';
};

const setupDns = (uri: string) => {
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (_e) {
      // Fallback to system default DNS
    }
  }
};

export const connectDatabase = async (customUri?: string): Promise<typeof mongoose> => {
  const mongoUri = getMongoUri(customUri);
  setupDns(mongoUri);

  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  try {
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    if (logger && typeof logger.info === 'function') {
      logger.info({
        msg: 'MongoDB connected successfully',
        database: connection.connection.name,
        host: connection.connection.host,
      });
    }

    return connection;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    if (logger && typeof logger.error === 'function') {
      logger.error({
        msg: 'MongoDB connection failed',
        error: message,
      });
    } else {
      console.error('MongoDB connection error:', error);
    }
    throw error;
  }
};

export const connectDB = connectDatabase;

export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (logger && typeof logger.info === 'function') {
      logger.info({ msg: 'MongoDB disconnected successfully' });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (logger && typeof logger.error === 'function') {
      logger.error({ msg: 'MongoDB disconnect error', error: message });
    } else {
      console.error('MongoDB disconnect error:', error);
    }
    throw error;
  }
};

export const disconnectDB = disconnectDatabase;
