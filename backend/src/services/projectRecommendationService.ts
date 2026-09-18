import Types from 'mongoose';
import { ProjectModel } from '../models/Project.js';
import { SkillModel } from '../models/Skill.js';
import { getStudentSkillGapPriority } from './skillGapPriorityReadoutService.js';
import {
  IProject,
  IProjectRecommendation,
  ISkillGapPrioritySnapshot,
  ProjectDifficulty,
} from '../types/intelligence.js';

export interface ProjectFilterQuery {
  skillId?: string;
  careerId?: string;
  difficulty?: ProjectDifficulty;
}

export interface ProjectRecommendationOptions {
  limit?: number;
}

/**
 * Retrieves catalog projects with optional filtering.
 * Uses indexes on skillId, careerId, or difficulty.
 */
export const getAllProjects = async (filter: ProjectFilterQuery = {}): Promise<IProject[]> => {
  const query: any = {};
  if (filter.skillId) query.skillId = filter.skillId;
  if (filter.careerId) query.careerId = filter.careerId;
  if (filter.difficulty) query.difficulty = filter.difficulty;

  const docs = await ProjectModel.find(query).sort({ estimatedHours: 1, createdAt: -1 }).lean();
  return docs as unknown as IProject[];
};

/**
 * Fetches a single project by ID.
 */
export const getProjectById = async (id: string): Promise<IProject | null> => {
  const doc = await ProjectModel.findById(id).lean();
  return (doc as unknown as IProject) || null;
};

/**
 * Fetches projects associated with a given Skill ID.
 */
export const getProjectsForSkill = async (skillId: string): Promise<IProject[]> => {
  const docs = await ProjectModel.find({
    $or: [{ skillId }, { skillsReinforced: skillId }],
  }).lean();
  return docs as unknown as IProject[];
};

/**
 * Deterministically ranks and recommends practical projects for a student
 * based on their active MongoDB skill gap and priority snapshot.
 *
 * Deterministic Ranking Factors:
 * 1. Primary Skill Priority Score (Weight: 45%) — From P2-INT-002 Priority Engine
 * 2. Primary Skill Gap Magnitude (Weight: 35%) — Target level minus current level
 * 3. Multi-Gap Skill Reinforcement Bonus (Weight: 20%) — Bonus for projects addressing multiple active gap skills
 *
 * Avoids N+1 queries by using `$in` batch query for primary and reinforced skills.
 */
export const getRecommendedProjectsForStudent = async (
  studentProfileIdOrUserId: string,
  options: ProjectRecommendationOptions = {}
): Promise<IProjectRecommendation[]> => {
  const limit = options.limit || 6;

  // 1. Fetch active skill gap priority snapshots from readout service
  const snapshots = await getStudentSkillGapPriority(studentProfileIdOrUserId);

  if (!snapshots || snapshots.length === 0) {
    // Fallback: return general projects if no assessment/gap data available
    const fallbackProjects = await ProjectModel.find().limit(limit).lean();
    return fallbackProjects.map((proj) => ({
      project: proj as unknown as IProject,
      relevanceScore: 50,
      recommendationReason: 'General practice project for skill building',
      primarySkillName: 'Core Skill',
      targetSkillGap: 0,
      priorityScore: 50,
      reinforcedSkillNames: [],
    }));
  }

  // 2. Map snapshots by skillId string
  const snapshotMap = new Map<string, ISkillGapPrioritySnapshot>();
  const skillIds: string[] = [];

  for (const snap of snapshots) {
    const sId = snap.skillId.toString();
    snapshotMap.set(sId, snap);
    skillIds.push(sId);
  }

  // 3. Batch query candidate projects matching any active gap skill (Avoid N+1)
  const candidateProjects = await ProjectModel.find({
    $or: [{ skillId: { $in: skillIds } }, { skillsReinforced: { $in: skillIds } }],
  }).lean();

  if (candidateProjects.length === 0) {
    // Fallback: return available projects if specific skill query returns empty
    const allProjects = await ProjectModel.find().limit(limit).lean();
    return allProjects.map((proj) => ({
      project: proj as unknown as IProject,
      relevanceScore: 40,
      recommendationReason: 'Recommended baseline project for practical application',
      primarySkillName: 'Web Development',
      targetSkillGap: 0,
      priorityScore: 40,
      reinforcedSkillNames: [],
    }));
  }

  // 4. Batch query Skill names for all skill IDs in candidates to construct clean display names
  const allReferencedSkillIdsSet = new Set<string>();
  for (const proj of candidateProjects) {
    if (proj.skillId) allReferencedSkillIdsSet.add(proj.skillId.toString());
    if (Array.isArray(proj.skillsReinforced)) {
      for (const rId of proj.skillsReinforced) {
        allReferencedSkillIdsSet.add(rId.toString());
      }
    }
  }

  const skillDocs = await SkillModel.find({ _id: { $in: Array.from(allReferencedSkillIdsSet) } })
    .select('name slug')
    .lean();

  const skillNameMap = new Map<string, string>();
  for (const sDoc of skillDocs) {
    skillNameMap.set(sDoc._id.toString(), sDoc.name);
  }

  // 5. Score and rank projects deterministically
  const recommendations: IProjectRecommendation[] = [];

  for (const proj of candidateProjects) {
    const primarySkillIdStr = proj.skillId ? proj.skillId.toString() : '';
    const primarySnap = snapshotMap.get(primarySkillIdStr);

    const primarySkillName =
      (primarySnap && primarySnap.skillName) ||
      skillNameMap.get(primarySkillIdStr) ||
      'Core Skill';

    const targetGap = primarySnap ? primarySnap.gap : 0;
    const priorityScore = primarySnap ? primarySnap.priority.priorityScore : 30;

    // Check reinforced skills for multi-gap bonus
    const reinforcedSkillNames: string[] = [];
    let multiGapBonus = 0;

    if (Array.isArray(proj.skillsReinforced)) {
      for (const rId of proj.skillsReinforced) {
        const rIdStr = rId.toString();
        const rName = skillNameMap.get(rIdStr) || 'Skill';
        reinforcedSkillNames.push(rName);

        const rSnap = snapshotMap.get(rIdStr);
        if (rSnap && rSnap.gap > 0) {
          multiGapBonus += 10; // +10 points per additional active gap skill reinforced
        }
      }
    }

    // Deterministic relevance score calculation
    const priorityComponent = (priorityScore / 100) * 45;
    const gapComponent = (Math.min(targetGap, 100) / 100) * 35;
    const multiGapComponent = Math.min(multiGapBonus, 20); // capped at 20

    const relevanceScore = Math.round((priorityComponent + gapComponent + multiGapComponent) * 10) / 10;

    const reason = primarySnap
      ? `Recommended project targeting ${primarySnap.importance} priority gap in ${primarySkillName} (Gap: ${targetGap} pts)`
      : `Recommended practice project for ${primarySkillName}`;

    recommendations.push({
      project: proj as unknown as IProject,
      relevanceScore,
      recommendationReason: reason,
      primarySkillName,
      targetSkillGap: targetGap,
      priorityScore,
      reinforcedSkillNames,
    });
  }

  // 6. Sort recommendations descending by relevance score
  recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return recommendations.slice(0, limit);
};
