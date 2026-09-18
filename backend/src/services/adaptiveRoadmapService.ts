import { Types } from 'mongoose';
import { StudentProfile } from '../models/StudentProfile.js';
import { AssessmentAttemptModel } from '../models/AssessmentAttempt.js';
import { RoadmapModel, IRoadmapDocument } from '../models/Roadmap.js';
import {
  generateRoadmapForStudent,
  RoadmapGenerationError,
} from './roadmapGenerationService.js';

/**
 * PURE ENGINE FUNCTION: Determines if an adaptive roadmap generation is required based on
 * latest assessment evidence and existing roadmap state.
 */
export const shouldGenerateAdaptiveRoadmap = (
  latestAttemptId: string | null | undefined,
  currentRoadmap: { generatedFromAssessmentAttemptId?: Types.ObjectId | null } | null | undefined,
  force: boolean = false
): boolean => {
  if (!currentRoadmap) {
    return true;
  }
  if (force) {
    return true;
  }
  if (!latestAttemptId) {
    return false;
  }
  if (
    currentRoadmap.generatedFromAssessmentAttemptId &&
    currentRoadmap.generatedFromAssessmentAttemptId.toString() === latestAttemptId.toString()
  ) {
    return false; // Idempotent: Current roadmap was already generated from this exact evidence
  }
  return true;
};

/**
 * APPLICATION SERVICE: Generates an adaptive roadmap version (V2, V3...) derived from the student's
 * latest reassessment evidence. Enforces historical roadmap preservation and version isolation.
 */
export const generateAdaptiveRoadmapForStudent = async (
  userIdOrProfileId: string,
  targetCareerId?: string,
  options: { force?: boolean } = {}
): Promise<IRoadmapDocument> => {
  if (!Types.ObjectId.isValid(userIdOrProfileId)) {
    throw new RoadmapGenerationError('Invalid student identity format.', 400);
  }

  const idObj = new Types.ObjectId(userIdOrProfileId);

  // 1. Resolve StudentProfile
  const studentProfile = await StudentProfile.findOne({
    $or: [{ userId: idObj }, { _id: idObj }],
  });

  if (!studentProfile) {
    throw new RoadmapGenerationError('Student profile not found.', 404);
  }

  // 2. Fetch Latest Completed Assessment Attempt
  const latestCompletedAttempt = await AssessmentAttemptModel.findOne({
    $or: [{ userId: studentProfile.userId }, { studentProfileId: studentProfile._id }],
    status: 'COMPLETED',
  }).sort({ completedAt: -1, createdAt: -1 });

  // 3. Fetch Current Active Roadmap
  const currentRoadmap = await RoadmapModel.findOne({
    studentProfileId: studentProfile._id,
    isCurrent: true,
  });

  const latestAttemptId = latestCompletedAttempt ? latestCompletedAttempt._id.toString() : null;

  // 4. Check Duplicate Generation / Idempotency Rule
  const needsAdaptation = shouldGenerateAdaptiveRoadmap(latestAttemptId, currentRoadmap, options.force);
  if (!needsAdaptation && currentRoadmap) {
    return currentRoadmap;
  }

  // 5. Delegate to generateRoadmapForStudent for deterministic topological ordering & versioning
  const newRoadmap = await generateRoadmapForStudent(userIdOrProfileId, targetCareerId);

  // 6. Ensure generation metadata is saved
  if (latestCompletedAttempt) {
    newRoadmap.generatedFromAssessmentAttemptId = latestCompletedAttempt._id;
  }
  newRoadmap.generationReason = currentRoadmap ? 'ADAPTIVE' : 'INITIAL';
  await newRoadmap.save();

  return newRoadmap;
};
