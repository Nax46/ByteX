import { Types } from 'mongoose';
import {
  ICareerSkill,
  ISkill,
  ISkillGapResult,
  IPriorityInput,
  IPriorityResult,
  IPriorityStrategy,
  ISkillGapPrioritySnapshot,
  SkillImportance,
  PriorityStatus,
} from '../types/intelligence.js';

/**
 * Pure Deterministic Skill Gap Function
 * Calculates the non-negative learning gap between target level and current score.
 */
export const calculateSkillGap = (
  currentLevel: number | null | undefined,
  targetLevel: number,
  skillId: Types.ObjectId = new Types.ObjectId(),
  skillName?: string,
  skillSlug?: string
): ISkillGapResult => {
  // 1. Target Level Input Validation
  if (
    targetLevel === null ||
    targetLevel === undefined ||
    typeof targetLevel !== 'number' ||
    isNaN(targetLevel) ||
    !isFinite(targetLevel)
  ) {
    throw new Error('Target level must be a valid finite number.');
  }

  if (targetLevel < 0 || targetLevel > 100) {
    throw new Error('Target level must be between 0 and 100.');
  }

  // 2. Missing Assessment Evidence Case
  if (currentLevel === null || currentLevel === undefined) {
    return {
      skillId,
      skillName,
      skillSlug,
      currentLevel: null,
      targetLevel,
      gap: targetLevel,
      hasEvidence: false,
      status: 'NO_EVIDENCE',
    };
  }

  // 3. Current Level Input Validation
  if (
    typeof currentLevel !== 'number' ||
    isNaN(currentLevel) ||
    !isFinite(currentLevel)
  ) {
    throw new Error('Current level must be a valid finite number.');
  }

  if (currentLevel < 0 || currentLevel > 100) {
    throw new Error('Current level must be between 0 and 100.');
  }

  // 4. Normalized Gap Calculation (clamped to min 0)
  const gap = Math.max(0, targetLevel - currentLevel);

  let status: PriorityStatus = 'LOW_GAP';
  if (gap === 0) {
    status = 'TARGET_MET';
  } else if (gap >= 40) {
    status = 'CRITICAL_GAP';
  } else if (gap >= 20) {
    status = 'MODERATE_GAP';
  }

  return {
    skillId,
    skillName,
    skillSlug,
    currentLevel,
    targetLevel,
    gap,
    hasEvidence: true,
    status,
  };
};

/**
 * Provisional Priority Strategy (Explicitly marked PROPOSED)
 * Encapsulates the unapproved priority weighting algorithm so it can be cleanly swapped
 * when Person 1 and team formally finalize business priority rules.
 */
export class ProposedPriorityStrategy implements IPriorityStrategy {
  public readonly name = 'PROPOSED_WEIGHTED_HYBRID';
  public readonly isProvisional = true;

  public calculatePriority(input: IPriorityInput): IPriorityResult {
    const { gapResult, importance, weight, isPrerequisiteForOthers } = input;
    const { gap, hasEvidence, currentLevel, targetLevel, status, skillName } = gapResult;

    // Numerical Importance Map
    const importanceMap: Record<SkillImportance, number> = {
      CRITICAL: 1.0,
      HIGH: 0.75,
      MEDIUM: 0.5,
      LOW: 0.25,
    };
    const impWeight = importanceMap[importance] || 0.5;
    const prereqBonus = isPrerequisiteForOthers ? 15 : 0;

    let rawPriority = 0;
    if (status === 'TARGET_MET') {
      rawPriority = 0; // Target met skills carry 0 active learning priority
    } else {
      // Formula: (gap * 0.5) + (importanceWeight * 30) + prereqBonus + (weight * 10)
      rawPriority = gap * 0.5 + impWeight * 30 + prereqBonus + (weight || 1.0) * 10;
    }

    const priorityScore = Math.round(rawPriority * 10) / 10;

    // Deterministic Explanation Generation (No AI required)
    const displayName = skillName || 'Skill';
    let explanation = '';

    if (status === 'TARGET_MET') {
      explanation = `${displayName} target level of ${targetLevel} is already met (current score: ${currentLevel}). No active learning gap.`;
    } else if (status === 'NO_EVIDENCE') {
      explanation = `${displayName} requires target level of ${targetLevel} at ${importance} importance, but has no assessment evidence yet.`;
    } else {
      explanation = `${displayName} has a ${gap}-point skill gap against the target level of ${targetLevel} (current: ${currentLevel}) at ${importance} importance.`;
    }

    return {
      priorityScore,
      strategyName: this.name,
      isProvisional: this.isProvisional,
      priorityStatus: status,
      explanation,
    };
  }
}

/**
 * Default Strategy Instance
 */
export const defaultPriorityStrategy = new ProposedPriorityStrategy();

/**
 * Pure Service Function: Builds a complete, sorted Skill Gap & Priority Snapshot
 * array combining CareerSkill requirements and student current scores.
 */
export const buildSkillGapPrioritySnapshot = (
  careerSkills: ICareerSkill[],
  currentScoresMap: Map<string, number>,
  skillsMap: Map<string, ISkill> = new Map(),
  strategy: IPriorityStrategy = defaultPriorityStrategy
): ISkillGapPrioritySnapshot[] => {
  if (!careerSkills || careerSkills.length === 0) {
    return [];
  }

  // 1. Identify which skills are prerequisites for OTHER skills in this career
  const prerequisiteSkillIdsSet = new Set<string>();
  careerSkills.forEach((cs) => {
    if (cs.prerequisites && Array.isArray(cs.prerequisites)) {
      cs.prerequisites.forEach((pId) => prerequisiteSkillIdsSet.add(pId.toString()));
    }
  });

  // 2. Build Gap and Priority for each CareerSkill
  const snapshots: ISkillGapPrioritySnapshot[] = [];

  for (const cs of careerSkills) {
    const sIdStr = cs.skillId.toString();
    const skillMeta = skillsMap.get(sIdStr);
    const currentScore = currentScoresMap.has(sIdStr) ? currentScoresMap.get(sIdStr)! : null;

    const gapResult = calculateSkillGap(
      currentScore,
      cs.requiredLevel,
      cs.skillId,
      skillMeta?.name,
      skillMeta?.slug
    );

    const isPrerequisiteForOthers = prerequisiteSkillIdsSet.has(sIdStr);
    const prereqs = cs.prerequisites || [];
    const weight = cs.weight !== undefined ? cs.weight : 1.0;

    const priorityInput: IPriorityInput = {
      gapResult,
      importance: cs.importance,
      weight,
      prerequisites: prereqs,
      isPrerequisiteForOthers,
    };

    const priority = strategy.calculatePriority(priorityInput);

    snapshots.push({
      skillId: cs.skillId,
      skillName: skillMeta?.name,
      skillSlug: skillMeta?.slug,
      currentLevel: gapResult.currentLevel,
      targetLevel: cs.requiredLevel,
      gap: gapResult.gap,
      hasEvidence: gapResult.hasEvidence,
      importance: cs.importance,
      weight,
      prerequisites: prereqs,
      isPrerequisiteForOthers,
      priority,
    });
  }

  // 3. Sort snapshots by descending priority score (highest priority first)
  snapshots.sort((a, b) => b.priority.priorityScore - a.priority.priorityScore);

  return snapshots;
};
