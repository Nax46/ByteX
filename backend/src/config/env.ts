import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from working directory or relative backend root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 65535, {
      message: 'PORT must be a valid port number between 1 and 65535',
    }),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  MONGO_URI: z
    .string()
    .min(1, 'MONGO_URI is required in environment configuration'),
  CORS_ORIGIN: z.string().default('*'),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET is required and must be at least 16 characters for security'),
  JWT_EXPIRES_IN: z
    .string()
    .default('7d'),
  GEMINI_API_KEY: z
    .string()
    .optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

const parseEnv = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`
    );
    console.error('[Configuration Error] Invalid environment configuration:');
    formattedErrors.forEach((msg: string) => console.error(`  - ${msg}`));
    throw new Error(`Environment validation failed: ${formattedErrors.join('; ')}`);
  }

  return result.data;
};

export const env: EnvConfig = parseEnv();
