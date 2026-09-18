import { StudentProfile } from '../../models/StudentProfile.js';
import { User } from '../../models/User.js';
import { RoadmapModel } from '../../models/Roadmap.js';
import { RoadmapProgressModel } from '../../models/RoadmapProgress.js';
import { getStudentSkillGapPriority } from '../skillGapPriorityReadoutService.js';
import { AIPersonalizationContext, AISkillGapContext } from '../../types/ai.js';
import { ReadoutError } from '../skillGapPriorityReadoutService.js';

/**
 * Builds a sanitized, high-fidelity AI Personalization Context
 * derived strictly from live MongoDB Atlas records for a student.
 *
 * Security: NO passwords, NO JWT secrets, NO payment info exposed to AI prompts.
 */
export const buildStudentAIContext = async (
  studentProfileIdOrUserId: string
): Promise<AIPersonalizationContext> => {
  // 1. Resolve StudentProfile and User
  let profile = await StudentProfile.findById(studentProfileIdOrUserId).lean();
  let user: any = null;

  if (!profile) {
    user = await User.findById(studentProfileIdOrUserId).lean();
    if (user) {
      profile = await StudentProfile.findOne({ userId: user._id }).lean();
    }
  } else {
    user = await User.findById(profile.userId).lean();
  }

  if (!profile || !user) {
    throw new ReadoutError(`Student profile or user account not found for ID: ${studentProfileIdOrUserId}`, 404);
  }

  const studentName = profile.fullName || user.email.split('@')[0] || 'Student';
  const targetCareer = profile.targetCareer || 'Full Stack Developer';
  const careerSlug = targetCareer.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // 2. Fetch active skill gap priority readout (returns snapshots)
  let snapshots: any[] = [];
  try {
    snapshots = await getStudentSkillGapPriority(user._id.toString());
  } catch (_err) {
    // If student hasn't completed assessment yet, handle gracefully
    snapshots = [];
  }

  const skillGaps: AISkillGapContext[] = snapshots.map((s) => ({
    skillName: s.skillName || 'Skill',
    skillSlug: s.skillSlug || 'skill',
    category: s.category || 'TECHNICAL',
    currentLevel: s.currentLevel,
    targetLevel: s.targetLevel,
    gap: s.gap,
    importance: s.importance,
    priorityScore: s.priority ? s.priority.priorityScore : 50,
    priorityStatus: s.priority ? s.priority.priorityStatus : 'NO_EVIDENCE',
  }));

  // Sort by priorityScore descending
  skillGaps.sort((a, b) => b.priorityScore - a.priorityScore);

  const topSnap = skillGaps[0];
  const topPrioritySkill = topSnap ? topSnap.skillName : undefined;
  const topPriorityGap = topSnap ? topSnap.gap : undefined;
  const topPriorityScore = topSnap ? topSnap.priorityScore : undefined;

  // 3. Fetch active Roadmap & Progress
  const activeRoadmap = await RoadmapModel.findOne({
    studentProfileId: profile._id,
    isCurrent: true,
  }).lean();

  let overallProgressPercent = 0;
  let completedModulesCount = 0;
  let totalModulesCount = 0;

  if (activeRoadmap) {
    totalModulesCount = activeRoadmap.modules ? activeRoadmap.modules.length : 0;
    const progressDoc = await RoadmapProgressModel.findOne({ roadmapId: activeRoadmap._id }).lean();
    if (progressDoc) {
      overallProgressPercent = progressDoc.overallProgress || 0;
      completedModulesCount = progressDoc.completedModules || 0;
    }
  }

  return {
    studentProfileId: profile._id.toString(),
    userId: user._id.toString(),
    studentName,
    targetCareer,
    careerSlug,
    skillGaps,
    topPrioritySkill,
    topPriorityGap,
    topPriorityScore,
    activeRoadmapVersion: activeRoadmap ? activeRoadmap.version : 1,
    overallProgressPercent,
    completedModulesCount,
    totalModulesCount,
  };
};
