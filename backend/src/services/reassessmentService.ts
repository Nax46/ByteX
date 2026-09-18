import { Types } from 'mongoose';
import { StudentProfile } from '../models/StudentProfile.js';
import { AssessmentModel } from '../models/Assessment.js';
import { AssessmentAttemptModel, IAssessmentAttemptDocument } from '../models/AssessmentAttempt.js';
import { SkillModel } from '../models/Skill.js';
import { AssessmentScoringService } from './assessmentScoringService.js';
import {
  IAssessmentAttemptSkillScore,
  StudentAnswerSubmissionDTO,
} from '../types/assessment.js';
import { ISkill } from '../types/intelligence.js';
import {
  ReassessmentError,
  ISkillScoreComparison,
  IReassessmentSummary,
  ScoreTrend,
} from '../types/reassessment.js';

/**
 * PURE ENGINE FUNCTIONS: Deterministic score comparison logic.
 */

export const calculateScoreComparison = (
  latestScores: IAssessmentAttemptSkillScore[] = [],
  previousScores: IAssessmentAttemptSkillScore[] | null = null,
  skillsMap: Map<string, ISkill> = new Map()
): {
  skillComparisons: ISkillScoreComparison[];
  overallPreviousScore: number | null;
  overallCurrentScore: number;
  overallChange: number | null;
} => {
  const previousMap = new Map<string, number>();
  if (previousScores && Array.isArray(previousScores)) {
    previousScores.forEach((ss) => {
      if (ss.skillId) {
        previousMap.set(ss.skillId.toString(), ss.score);
      }
    });
  }

  const skillComparisons: ISkillScoreComparison[] = latestScores.map((sScore) => {
    const sIdStr = sScore.skillId.toString();
    const currScore = sScore.score;
    const prevScore = previousMap.get(sIdStr);
    const skillMeta = skillsMap.get(sIdStr);

    let change: number | null = null;
    let trend: ScoreTrend = 'NEW_EVIDENCE';

    if (prevScore !== undefined && prevScore !== null) {
      change = currScore - prevScore;
      if (currScore > prevScore) {
        trend = 'IMPROVED';
      } else if (currScore < prevScore) {
        trend = 'DECLINED';
      } else {
        trend = 'UNCHANGED';
      }
    }

    return {
      skillId: sScore.skillId,
      skillName: skillMeta?.name || undefined,
      skillSlug: skillMeta?.slug || undefined,
      previousScore: prevScore !== undefined ? prevScore : null,
      currentScore: currScore,
      change,
      trend,
    };
  });

  // Calculate overall average scores
  const overallCurrentScore =
    latestScores.length > 0
      ? Math.round(latestScores.reduce((sum, s) => sum + s.score, 0) / latestScores.length)
      : 0;

  let overallPreviousScore: number | null = null;
  if (previousScores && previousScores.length > 0) {
    overallPreviousScore = Math.round(
      previousScores.reduce((sum, s) => sum + s.score, 0) / previousScores.length
    );
  }

  const overallChange =
    overallPreviousScore !== null ? overallCurrentScore - overallPreviousScore : null;

  return {
    skillComparisons,
    overallPreviousScore,
    overallCurrentScore,
    overallChange,
  };
};

/**
 * APPLICATION SERVICE: Reassessment management and comparative analysis.
 */

/**
 * Creates and evaluates a NEW reassessment attempt document without modifying previous attempts.
 */
export const createReassessmentAttempt = async (
  userIdOrProfileId: string,
  assessmentIdStr: string,
  answers: StudentAnswerSubmissionDTO[]
): Promise<IAssessmentAttemptDocument> => {
  if (!Types.ObjectId.isValid(userIdOrProfileId)) {
    throw new ReassessmentError('Invalid student identity format.', 400);
  }

  if (!Types.ObjectId.isValid(assessmentIdStr)) {
    throw new ReassessmentError('Invalid assessment ID format.', 400);
  }

  const idObj = new Types.ObjectId(userIdOrProfileId);

  // 1. Resolve StudentProfile
  const studentProfile = await StudentProfile.findOne({
    $or: [{ userId: idObj }, { _id: idObj }],
  });

  if (!studentProfile) {
    throw new ReassessmentError('Student profile not found.', 404);
  }

  // 2. Validate Target Assessment
  const assessment = await AssessmentModel.findById(assessmentIdStr);
  if (!assessment) {
    throw new ReassessmentError('Target assessment not found.', 404);
  }

  if (!assessment.isActive) {
    throw new ReassessmentError('Target assessment is inactive.', 400);
  }

  // 3. Delegate to AssessmentScoringService to evaluate answers & save NEW AssessmentAttempt
  const attempt = await AssessmentScoringService.evaluateAndSaveAttempt({
    studentProfileId: studentProfile._id.toString(),
    assessmentId: assessment._id.toString(),
    answers,
  });

  return attempt;
};

/**
 * Retrieves comparative reassessment summary comparing the latest completed attempt against the previous attempt.
 */
export const getReassessmentSummary = async (
  userIdOrProfileId: string,
  assessmentIdStr?: string
): Promise<IReassessmentSummary> => {
  if (!Types.ObjectId.isValid(userIdOrProfileId)) {
    throw new ReassessmentError('Invalid student identity format.', 400);
  }

  const idObj = new Types.ObjectId(userIdOrProfileId);

  const studentProfile = await StudentProfile.findOne({
    $or: [{ userId: idObj }, { _id: idObj }],
  });

  if (!studentProfile) {
    throw new ReassessmentError('Student profile not found.', 404);
  }

  const query: Record<string, any> = {
    $or: [{ userId: studentProfile.userId }, { studentProfileId: studentProfile._id }],
    status: 'COMPLETED',
  };

  if (assessmentIdStr && Types.ObjectId.isValid(assessmentIdStr)) {
    query.assessmentId = new Types.ObjectId(assessmentIdStr);
  }

  // Retrieve 2 latest completed attempts sorted by completion time descending
  const attempts = await AssessmentAttemptModel.find(query)
    .sort({ completedAt: -1, createdAt: -1 })
    .limit(2);

  if (!attempts || attempts.length === 0) {
    throw new ReassessmentError('No completed assessment attempts found for student.', 404);
  }

  const latestAttempt = attempts[0];
  const previousAttempt = attempts.length > 1 ? attempts[1] : null;

  // Collect all skill IDs to pre-fetch metadata
  const skillIdSet = new Set<string>();
  if (latestAttempt.skillScores) {
    latestAttempt.skillScores.forEach((s) => skillIdSet.add(s.skillId.toString()));
  }
  if (previousAttempt && previousAttempt.skillScores) {
    previousAttempt.skillScores.forEach((s) => skillIdSet.add(s.skillId.toString()));
  }

  const skillDocs = await SkillModel.find({
    _id: { $in: Array.from(skillIdSet).map((id) => new Types.ObjectId(id)) },
  });

  const skillsMap = new Map<string, ISkill>();
  skillDocs.forEach((doc) => {
    const plainObj = doc.toObject ? (doc.toObject() as ISkill) : (doc as ISkill);
    skillsMap.set(doc._id.toString(), plainObj);
  });

  const comparison = calculateScoreComparison(
    latestAttempt.skillScores || [],
    previousAttempt ? previousAttempt.skillScores || [] : null,
    skillsMap
  );

  const totalCount = await AssessmentAttemptModel.countDocuments(query);

  return {
    studentProfileId: studentProfile._id,
    latestAttemptId: latestAttempt._id,
    previousAttemptId: previousAttempt ? previousAttempt._id : null,
    latestCompletedAt: latestAttempt.completedAt || latestAttempt.createdAt || new Date(),
    previousCompletedAt: previousAttempt ? previousAttempt.completedAt || previousAttempt.createdAt || null : null,
    skillComparisons: comparison.skillComparisons,
    overallPreviousScore: comparison.overallPreviousScore,
    overallCurrentScore: comparison.overallCurrentScore,
    overallChange: comparison.overallChange,
    attemptCount: totalCount,
  };
};
