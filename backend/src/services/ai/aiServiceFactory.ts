import { IAIService } from '../../types/ai.js';
import { GeminiAdapter } from './geminiAdapter.js';

let instance: IAIService | null = null;

/**
 * Returns the singleton instance of the AI Service abstraction.
 * Decouples controllers and intelligence services from direct Gemini SDK calls.
 */
export const getAIService = (): IAIService => {
  if (!instance) {
    instance = new GeminiAdapter();
  }
  return instance;
};

/**
 * Helper to override AI service instance for unit tests.
 */
export const setAIServiceInstance = (testInstance: IAIService | null): void => {
  instance = testInstance;
};
