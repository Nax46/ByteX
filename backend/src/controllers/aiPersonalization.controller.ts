import { Request, Response, NextFunction } from 'express';
import { getAIService } from '../services/ai/aiServiceFactory.js';
import { buildStudentAIContext } from '../services/ai/personalizationContextBuilder.js';
import { AIMentorQueryInputSchema } from '../schemas/aiValidation.js';
import { ReadoutError } from '../services/skillGapPriorityReadoutService.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

/**
 * Controller: GET /api/intelligence/ai/personalized-summary
 * Generates AI personalized learning summary based on student's live MongoDB intelligence data.
 */
export const getPersonalizedSummaryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const context = await buildStudentAIContext(req.user.userId);
    const aiService = getAIService();

    const personalizedSummary = await aiService.generatePersonalizedSummary(context);

    sendSuccess(
      res,
      { personalizedSummary, context },
      'Personalized AI summary generated successfully',
      200
    );
  } catch (error) {
    if (error instanceof ReadoutError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Controller: GET /api/intelligence/ai/explain-skill/:skillSlug
 * Generates AI personalized skill gap explanation for a specific skill.
 */
export const getSkillExplanationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const rawSlug = req.params.skillSlug;
    const skillSlug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

    if (!skillSlug || skillSlug.trim() === '') {
      sendError(res, 'Skill slug parameter is required', [], 400);
      return;
    }

    const context = await buildStudentAIContext(req.user.userId);
    const aiService = getAIService();

    const explanation = await aiService.generateSkillExplanation(context, skillSlug.trim());

    sendSuccess(
      res,
      { explanation },
      `Skill explanation for '${skillSlug}' generated successfully`,
      200
    );
  } catch (error) {
    if (error instanceof ReadoutError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Controller: POST /api/intelligence/ai/mentor-ask
 * Answers student questions in real-time as an AI Career Mentor using student intelligence context.
 */
export const askAIMentorHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const parseResult = AIMentorQueryInputSchema.safeParse(req.body);
    if (!parseResult.success) {
      sendError(
        res,
        'Invalid mentor query input',
        parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        400
      );
      return;
    }

    const context = await buildStudentAIContext(req.user.userId);
    const aiService = getAIService();

    const mentorResponse = await aiService.askAIMentor(context, parseResult.data.query);

    sendSuccess(
      res,
      { mentorResponse },
      'AI Mentor response generated successfully',
      200
    );
  } catch (error) {
    if (error instanceof ReadoutError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
