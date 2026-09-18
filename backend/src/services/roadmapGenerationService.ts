import { Types } from 'mongoose';
import { StudentProfile } from '../models/StudentProfile.js';
import { CareerModel } from '../models/Career.js';
import { CareerSkillModel } from '../models/CareerSkill.js';
import { SkillModel } from '../models/Skill.js';
import { AssessmentAttemptModel } from '../models/AssessmentAttempt.js';
import { RoadmapModel, IRoadmapDocument } from '../models/Roadmap.js';
import {
  buildSkillGapPrioritySnapshot,
  defaultPriorityStrategy,
} from './skillGapPriorityEngine.js';
import {
  ICareerSkill,
  ISkill,
  ISkillGapPrioritySnapshot,
  IRoadmapModule,
  RoadmapModuleStatus,
  SkillImportance,
} from '../types/intelligence.js';

export class RoadmapGenerationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'RoadmapGenerationError';
    this.statusCode = statusCode;
  }
}

/**
 * Pure Deterministic Engine: Transforms skill gap priority snapshots into
 * an ordered list of RoadmapModules using topological sorting and priority tie-breaking.
 * Guaranteed 0 database queries inside the pure engine.
 */
export const generateDeterministicRoadmapModules = (
  snapshots: ISkillGapPrioritySnapshot[],
  skillsMap: Map<string, ISkill> = new Map()
): IRoadmapModule[] => {
  if (!snapshots || snapshots.length === 0) {
    return [];
  }

  // 1. Identify TARGET_MET skills vs Eligible Active Learning Skills
  const targetMetSet = new Set<string>();
  const eligibleMap = new Map<string, ISkillGapPrioritySnapshot>();

  snapshots.forEach((snap) => {
    const sIdStr = snap.skillId.toString();
    if (snap.gap === 0 || snap.priority.priorityStatus === 'TARGET_MET') {
      targetMetSet.add(sIdStr);
    } else {
      eligibleMap.set(sIdStr, snap);
    }
  });

  if (eligibleMap.size === 0) {
    return [];
  }

  // 2. Build Dependency Graph (In-Degrees and Out-Edges)
  // An active skill S depends on prerequisite P if P is also an active eligible skill (not TARGET_MET)
  const inDegreeMap = new Map<string, number>();
  const dependentsMap = new Map<string, string[]>(); // P -> list of skills S that depend on P

  eligibleMap.forEach((_snap, sIdStr) => {
    inDegreeMap.set(sIdStr, 0);
    dependentsMap.set(sIdStr, []);
  });

  eligibleMap.forEach((snap, sIdStr) => {
    if (snap.prerequisites && Array.isArray(snap.prerequisites)) {
      snap.prerequisites.forEach((pId) => {
        const pIdStr = pId.toString();
        // If prerequisite P is active (not TARGET_MET) and present in eligible skills:
        if (!targetMetSet.has(pIdStr) && eligibleMap.has(pIdStr)) {
          inDegreeMap.set(sIdStr, (inDegreeMap.get(sIdStr) || 0) + 1);
          dependentsMap.get(pIdStr)!.push(sIdStr);
        }
      });
    }
  });

  // 3. Topological Sort with Priority Tie-Breaking (Kahn's Algorithm variant)
  const availableSet = new Set<string>();
  inDegreeMap.forEach((inDeg, sIdStr) => {
    if (inDeg === 0) {
      availableSet.add(sIdStr);
    }
  });

  const importanceRank: Record<SkillImportance, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const orderedSkillIds: string[] = [];

  while (availableSet.size > 0) {
    // Deterministic selection: Pick candidate with highest priority score (tie-break by importance and slug)
    const candidates = Array.from(availableSet).map((sIdStr) => eligibleMap.get(sIdStr)!);

    candidates.sort((a, b) => {
      // Primary: Priority Score Descending
      if (b.priority.priorityScore !== a.priority.priorityScore) {
        return b.priority.priorityScore - a.priority.priorityScore;
      }
      // Secondary: Importance Weight Descending
      const impA = importanceRank[a.importance] || 0;
      const impB = importanceRank[b.importance] || 0;
      if (impB !== impA) {
        return impB - impA;
      }
      // Tertiary: Stable Slug / ID Ascending
      const slugA = a.skillSlug || a.skillId.toString();
      const slugB = b.skillSlug || b.skillId.toString();
      return slugA.localeCompare(slugB);
    });

    const chosen = candidates[0];
    const chosenIdStr = chosen.skillId.toString();

    orderedSkillIds.push(chosenIdStr);
    availableSet.delete(chosenIdStr);

    // Decrement in-degree for dependent skills
    const dependents = dependentsMap.get(chosenIdStr) || [];
    dependents.forEach((depIdStr) => {
      const currentInDeg = inDegreeMap.get(depIdStr) || 0;
      const newInDeg = Math.max(0, currentInDeg - 1);
      inDegreeMap.set(depIdStr, newInDeg);
      if (newInDeg === 0 && !orderedSkillIds.includes(depIdStr)) {
        availableSet.add(depIdStr);
      }
    });
  }

  // 4. Cycle Detection Check
  if (orderedSkillIds.length < eligibleMap.size) {
    throw new RoadmapGenerationError(
      'Prerequisite cycle detected in skill requirements graph. Cannot generate valid roadmap.',
      400
    );
  }

  // 5. Construct IRoadmapModule[]
  const modules: IRoadmapModule[] = orderedSkillIds.map((sIdStr, index) => {
    const snap = eligibleMap.get(sIdStr)!;
    const skillMeta = skillsMap.get(sIdStr);
    const order = index + 1;
    const displayName = snap.skillName || skillMeta?.name || 'Skill';
    const slugName = snap.skillSlug || skillMeta?.slug || sIdStr;

    // Initial status: First module is IN_PROGRESS (unlocked), subsequent are LOCKED until unlocked
    const status: RoadmapModuleStatus = order === 1 ? 'IN_PROGRESS' : 'LOCKED';

    return {
      moduleId: `mod-${slugName}-${order}`,
      skillId: snap.skillId,
      title: `${displayName} Fundamentals`,
      description: skillMeta?.description || `Learning module focusing on ${displayName}`,
      order,
      targetLevel: snap.targetLevel,
      currentLevel: snap.currentLevel,
      gapMagnitude: snap.gap,
      priorityScore: snap.priority.priorityScore,
      prerequisites: snap.prerequisites || [],
      recommendedResourceIds: [],
      recommendedProjectIds: [],
      status,
    };
  });

  return modules;
};

/**
 * Application Service: Orchestrates data fetching, generates deterministic roadmap modules,
 * and persists a new Roadmap document while preserving historical roadmap versions.
 */
export const generateRoadmapForStudent = async (
  userIdOrProfileId: string,
  targetCareerId?: string
): Promise<IRoadmapDocument> => {
  if (!Types.ObjectId.isValid(userIdOrProfileId)) {
    throw new RoadmapGenerationError('Invalid student ID format.', 400);
  }

  const idObject = new Types.ObjectId(userIdOrProfileId);

  // 1. Fetch StudentProfile
  const studentProfile = await StudentProfile.findOne({
    $or: [{ userId: idObject }, { _id: idObject }],
  });

  if (!studentProfile) {
    throw new RoadmapGenerationError('Student profile not found.', 404);
  }

  // 2. Resolve Career ID
  let careerDoc;
  if (targetCareerId && Types.ObjectId.isValid(targetCareerId)) {
    careerDoc = await CareerModel.findById(targetCareerId);
  } else if (studentProfile.targetCareer && studentProfile.targetCareer.trim() !== '') {
    const careerTerm = studentProfile.targetCareer.trim();
    careerDoc = await CareerModel.findOne({
      $or: [
        { slug: careerTerm.toLowerCase() },
        { title: new RegExp(`^${careerTerm}$`, 'i') },
      ],
    });
  }

  if (!careerDoc) {
    throw new RoadmapGenerationError('Target career not found in catalog.', 404);
  }

  // 3. Batched Data Retrieval (0 N+1 Queries)
  const careerSkills = await CareerSkillModel.find({ careerId: careerDoc._id });
  if (careerSkills.length === 0) {
    throw new RoadmapGenerationError('No skill requirements defined for target career.', 400);
  }

  const skillIds = careerSkills.map((cs) => cs.skillId);
  const skillDocs = await SkillModel.find({ _id: { $in: skillIds } });

  const skillsMap = new Map<string, ISkill>();
  skillDocs.forEach((doc) => {
    const plainObj = doc.toObject ? (doc.toObject() as ISkill) : (doc as ISkill);
    skillsMap.set(doc._id.toString(), plainObj);
  });

  // 4. Query Latest Completed Assessment Attempt for Current Scores
  const latestCompletedAttempt = await AssessmentAttemptModel.findOne({
    $or: [{ userId: studentProfile.userId }, { studentProfileId: studentProfile._id }],
    status: 'COMPLETED',
  }).sort({ completedAt: -1, createdAt: -1 });

  const currentScoresMap = new Map<string, number>();
  if (latestCompletedAttempt && latestCompletedAttempt.skillScores) {
    latestCompletedAttempt.skillScores.forEach((ss) => {
      if (ss.skillId && typeof ss.score === 'number') {
        currentScoresMap.set(ss.skillId.toString(), ss.score);
      }
    });
  }

  // 5. Generate Skill Gap & Priority Snapshots via pure engine
  const snapshots = buildSkillGapPrioritySnapshot(
    careerSkills as ICareerSkill[],
    currentScoresMap,
    skillsMap,
    defaultPriorityStrategy
  );

  // 6. Generate Deterministic Roadmap Modules via pure topological generator
  const modules = generateDeterministicRoadmapModules(snapshots, skillsMap);

  // 7. Versioning & Historical Roadmap Preservation
  const existingActive = await RoadmapModel.findOne({
    studentProfileId: studentProfile._id,
    isCurrent: true,
  });

  let nextVersion = 1;
  if (existingActive) {
    nextVersion = existingActive.version + 1;
    // Archive previous active roadmap without deleting it
    existingActive.isCurrent = false;
    existingActive.status = 'ARCHIVED';
    await existingActive.save();
  } else {
    const highestVersionDoc = await RoadmapModel.findOne({
      studentProfileId: studentProfile._id,
    }).sort({ version: -1 });
    if (highestVersionDoc) {
      nextVersion = highestVersionDoc.version + 1;
    }
  }

  // 8. Create and Persist New Active Roadmap Document
  const newRoadmap = await RoadmapModel.create({
    userId: studentProfile.userId,
    studentProfileId: studentProfile._id,
    careerId: careerDoc._id,
    title: `${careerDoc.title} Learning Roadmap`,
    description: `Personalized, dependency-ordered learning path V${nextVersion} for ${careerDoc.title}`,
    version: nextVersion,
    isCurrent: true,
    status: 'ACTIVE',
    modules,
    generatedFromAssessmentAttemptId: latestCompletedAttempt ? latestCompletedAttempt._id : null,
    generationReason: existingActive ? 'ADAPTIVE' : 'INITIAL',
  });

  return newRoadmap;
};
