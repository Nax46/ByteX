import { Types } from 'mongoose';
import { StudentProfile } from '../models/StudentProfile.js';
import { CareerModel } from '../models/Career.js';
import { CareerSkillModel } from '../models/CareerSkill.js';
import { SkillModel } from '../models/Skill.js';
import { AssessmentAttemptModel } from '../models/AssessmentAttempt.js';
import {
  buildSkillGapPrioritySnapshot,
  defaultPriorityStrategy,
} from './skillGapPriorityEngine.js';
import { ICareerSkill, ISkill, ISkillGapPrioritySnapshot } from '../types/intelligence.js';

export class ReadoutError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'ReadoutError';
    this.statusCode = statusCode;
  }
}

/**
 * Application Readout Service: Retrieves student target career requirements and latest
 * completed assessment attempt scores, then delegates to the pure deterministic engine.
 * Guaranteed 0 N+1 queries using batched database lookups.
 */
export const getStudentSkillGapPriority = async (
  userIdOrProfileId: string
): Promise<ISkillGapPrioritySnapshot[]> => {
  if (!Types.ObjectId.isValid(userIdOrProfileId)) {
    throw new ReadoutError('Invalid student ID format.', 400);
  }

  const idObject = new Types.ObjectId(userIdOrProfileId);

  // 1. Fetch Student Profile
  const studentProfile = await StudentProfile.findOne({
    $or: [{ userId: idObject }, { _id: idObject }],
  });

  if (!studentProfile) {
    throw new ReadoutError('Student profile not found.', 404);
  }

  if (!studentProfile.targetCareer || studentProfile.targetCareer.trim() === '') {
    throw new ReadoutError('Student target career is not configured. Please complete profile setup.', 400);
  }

  // 2. Fetch Career Document
  const targetCareerSlugOrTitle = studentProfile.targetCareer.trim();
  const career = await CareerModel.findOne({
    $or: [
      { slug: targetCareerSlugOrTitle.toLowerCase() },
      { title: new RegExp(`^${targetCareerSlugOrTitle}$`, 'i') },
    ],
  });

  if (!career) {
    throw new ReadoutError(`Target career "${targetCareerSlugOrTitle}" is not found in the career catalog.`, 404);
  }

  // 3. Batched Query: Fetch all CareerSkill requirement mappings for this career
  const careerSkills = await CareerSkillModel.find({ careerId: career._id });
  if (careerSkills.length === 0) {
    return [];
  }

  // 4. Batched Query: Fetch metadata for referenced skills
  const skillIds = careerSkills.map((cs) => cs.skillId);
  const skillDocs = await SkillModel.find({ _id: { $in: skillIds } });

  const skillsMap = new Map<string, ISkill>();
  skillDocs.forEach((doc) => {
    const plainObj = doc.toObject ? (doc.toObject() as ISkill) : (doc as ISkill);
    skillsMap.set(doc._id.toString(), plainObj);
  });

  // 5. Query Latest Completed Assessment Attempt (Ignore IN_PROGRESS and ABANDONED attempts)
  const latestCompletedAttempt = await AssessmentAttemptModel.findOne({
    $or: [{ userId: studentProfile.userId }, { studentProfileId: studentProfile._id }],
    status: 'COMPLETED',
  }).sort({ completedAt: -1, createdAt: -1 });

  // 6. Build Current Scores Map (skillId.toString() -> score)
  const currentScoresMap = new Map<string, number>();
  if (latestCompletedAttempt && latestCompletedAttempt.skillScores) {
    latestCompletedAttempt.skillScores.forEach((ss) => {
      if (ss.skillId && typeof ss.score === 'number') {
        currentScoresMap.set(ss.skillId.toString(), ss.score);
      }
    });
  }

  // 7. Delegate calculation to pure deterministic engine
  const snapshots = buildSkillGapPrioritySnapshot(
    careerSkills as ICareerSkill[],
    currentScoresMap,
    skillsMap,
    defaultPriorityStrategy
  );

  return snapshots;
};
