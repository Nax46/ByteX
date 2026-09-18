import Types from 'mongoose';
import { ResourceModel } from '../models/Resource.js';
import { getStudentSkillGapPriority } from './skillGapPriorityReadoutService.js';
import {
  IResource,
  IResourceRecommendation,
  ISkillGapPrioritySnapshot,
  ResourceType,
  ResourceDifficulty,
} from '../types/intelligence.js';

export interface ResourceFilterQuery {
  skillId?: string;
  skillTag?: string;
  type?: ResourceType;
  difficulty?: ResourceDifficulty;
}

export interface RecommendationOptions {
  limitPerSkill?: number;
  maxTotal?: number;
}

/**
 * Retrieves catalog resources with optional filtering.
 * Uses index on skillId, skillTag, or difficulty.
 */
export const getAllResources = async (filter: ResourceFilterQuery = {}): Promise<IResource[]> => {
  const query: any = {};
  if (filter.skillId) query.skillId = filter.skillId;
  if (filter.skillTag) query.skillTag = filter.skillTag.toLowerCase().trim();
  if (filter.type) query.type = filter.type;
  if (filter.difficulty) query.difficulty = filter.difficulty;

  const docs = await ResourceModel.find(query).sort({ rating: -1, createdAt: -1 }).lean();
  return docs as unknown as IResource[];
};

/**
 * Fetches a single resource by ID.
 */
export const getResourceById = async (id: string): Promise<IResource | null> => {
  const doc = await ResourceModel.findById(id).lean();
  return (doc as unknown as IResource) || null;
};

/**
 * Fetches resources associated with a given Skill ID.
 */
export const getResourcesForSkill = async (skillId: string): Promise<IResource[]> => {
  const docs = await ResourceModel.find({ skillId }).sort({ rating: -1 }).lean();
  return docs as unknown as IResource[];
};

/**
 * Deterministically ranks and recommends learning resources for a student
 * based on their active MongoDB skill gap and priority snapshot.
 *
 * Deterministic Ranking Factors:
 * 1. Skill Priority Score (Weight: 50%) — From P2-INT-002 Priority Engine
 * 2. Skill Gap Magnitude (Weight: 30%) — Target level minus current level
 * 3. Resource Rating / Quality (Weight: 20%) — Resource rating (0-5 scale)
 *
 * Avoids N+1 queries by using `$in` batch query across all skill gap IDs.
 */
export const getRecommendedResourcesForStudent = async (
  studentProfileIdOrUserId: string,
  options: RecommendationOptions = {}
): Promise<IResourceRecommendation[]> => {
  const maxTotal = options.maxTotal || 10;
  const limitPerSkill = options.limitPerSkill || 3;

  // 1. Fetch active skill gap priority snapshots from readout service
  const snapshots = await getStudentSkillGapPriority(studentProfileIdOrUserId);

  if (!snapshots || snapshots.length === 0) {
    // Fallback: return top rated resources from catalog if no skill gaps available
    const fallbackResources = await ResourceModel.find().sort({ rating: -1 }).limit(maxTotal).lean();
    return fallbackResources.map((res) => ({
      resource: res as unknown as IResource,
      relevanceScore: 50,
      recommendationReason: 'General recommended catalog resource for career development',
      skillName: res.skillTag || 'Core Skill',
      targetSkillGap: 0,
      priorityScore: 50,
    }));
  }

  // 2. Filter snapshots with active skill gaps
  const gapSnapshots = snapshots.filter((s) => s.gap > 0 || s.priority.priorityStatus !== 'TARGET_MET');
  const activeSnapshots = gapSnapshots.length > 0 ? gapSnapshots : snapshots;

  // Create lookup Map for O(1) snapshot retrieval by skill ID string
  const snapshotMap = new Map<string, ISkillGapPrioritySnapshot>();
  const skillIds: string[] = [];

  for (const snap of activeSnapshots) {
    const sId = snap.skillId.toString();
    snapshotMap.set(sId, snap);
    skillIds.push(sId);
  }

  // 3. Batch query resources for all relevant skill IDs (Avoid N+1)
  const resources = await ResourceModel.find({ skillId: { $in: skillIds } }).lean();

  // Group resources by skillId
  const resourcesBySkill = new Map<string, any[]>();
  for (const res of resources) {
    const sId = res.skillId.toString();
    const existing = resourcesBySkill.get(sId) || [];
    existing.push(res);
    resourcesBySkill.set(sId, existing);
  }

  const recommendations: IResourceRecommendation[] = [];

  // 4. Score and rank resources deterministically per skill gap snapshot
  for (const [skillIdStr, snap] of snapshotMap.entries()) {
    const skillResources = resourcesBySkill.get(skillIdStr) || [];

    // Sort skill resources by rating and match difficulty
    const sortedSkillResources = skillResources.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    const selectedForSkill = sortedSkillResources.slice(0, limitPerSkill);

    for (const res of selectedForSkill) {
      // Deterministic relevance score calculation
      const priorityComponent = (snap.priority.priorityScore / 100) * 50;
      const gapComponent = (Math.min(snap.gap, 100) / 100) * 30;
      const ratingComponent = ((res.rating || 4.5) / 5) * 20;

      const relevanceScore = Math.round((priorityComponent + gapComponent + ratingComponent) * 10) / 10;

      const reason = `Recommended for ${snap.importance} priority skill gap in ${
        snap.skillName || 'target skill'
      } (Gap: ${snap.gap} pts, Priority Score: ${snap.priority.priorityScore})`;

      recommendations.push({
        resource: res as unknown as IResource,
        relevanceScore,
        recommendationReason: reason,
        skillName: snap.skillName || res.skillTag || 'Skill',
        targetSkillGap: snap.gap,
        priorityScore: snap.priority.priorityScore,
      });
    }
  }

  // 5. Rank all recommendations by relevanceScore descending
  recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return recommendations.slice(0, maxTotal);
};
