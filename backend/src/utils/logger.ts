import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'body.password',
      '*.password',
      'password',
      'passwordHash',
      'token',
      'jwt',
      'apiKey',
      'secret',
      'JWT_SECRET',
      'MONGO_URI',
    ],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
