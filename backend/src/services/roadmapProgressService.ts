import { Types } from 'mongoose';
import { StudentProfile } from '../models/StudentProfile.js';
import { RoadmapModel, IRoadmapDocument } from '../models/Roadmap.js';
import { RoadmapProgressModel, IRoadmapProgressDocument } from '../models/RoadmapProgress.js';
import { IRoadmapModule } from '../types/intelligence.js';
import {
  IModuleProgressItem,
  IRoadmapProgress,
  RoadmapProgressError,
} from '../types/progress.js';

/**
 * PURE ENGINE FUNCTIONS: 100% deterministic calculations without side-effects or DB calls.
 */

const toPlainItem = (item: IModuleProgressItem): IModuleProgressItem => {
  if (item && typeof (item as any).toObject === 'function') {
    return (item as any).toObject() as IModuleProgressItem;
  }
  return {
    moduleId: item.moduleId,
    status: item.status,
    progressPercent: item.progressPercent,
    startedAt: item.startedAt || null,
    completedAt: item.completedAt || null,
    lastActivityAt: item.lastActivityAt || null,
  };
};

/**
 * Pure function: Calculates overall roadmap progress percentage and summary statistics.
 */
export const calculateOverallProgress = (
  modules: IModuleProgressItem[]
): {
  overallProgress: number;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  lockedModules: number;
} => {
  if (!modules || modules.length === 0) {
    return {
      overallProgress: 0,
      totalModules: 0,
      completedModules: 0,
      inProgressModules: 0,
      lockedModules: 0,
    };
  }

  const totalModules = modules.length;
  let completedModules = 0;
  let inProgressModules = 0;
  let lockedModules = 0;

  modules.forEach((rawMod) => {
    const mod = toPlainItem(rawMod);
    if (mod.status === 'COMPLETED') {
      completedModules++;
    } else if (mod.status === 'IN_PROGRESS') {
      inProgressModules++;
    } else if (mod.status === 'LOCKED') {
      lockedModules++;
    }
  });

  const overallProgress = Math.round((completedModules / totalModules) * 100);

  return {
    overallProgress,
    totalModules,
    completedModules,
    inProgressModules,
    lockedModules,
  };
};

/**
 * Pure function: Determines whether a given module in the roadmap is unlocked (available to learn).
 */
export const isModuleUnlocked = (
  targetModuleId: string,
  roadmapModules: IRoadmapModule[],
  progressMap: Map<string, IModuleProgressItem>
): boolean => {
  const targetModule = roadmapModules.find((m) => m.moduleId === targetModuleId);
  if (!targetModule) {
    return false;
  }

  const currentProgressItem = progressMap.get(targetModuleId);
  if (
    currentProgressItem &&
    (currentProgressItem.status === 'IN_PROGRESS' || currentProgressItem.status === 'COMPLETED')
  ) {
    return true;
  }

  // Order 1 module is always unlocked
  if (targetModule.order === 1) {
    return true;
  }

  // Check prerequisite skills
  const prerequisites = targetModule.prerequisites || [];
  if (prerequisites.length > 0) {
    for (const prereqSkillId of prerequisites) {
      const pIdStr = prereqSkillId.toString();
      const prereqModule = roadmapModules.find((m) => m.skillId.toString() === pIdStr);
      if (prereqModule) {
        const prereqProgress = progressMap.get(prereqModule.moduleId);
        if (!prereqProgress || prereqProgress.status !== 'COMPLETED') {
          return false;
        }
      }
    }
    return true;
  }

  // If module has no explicit prerequisite skills listed, check if the previous module in order is completed
  const prevModule = roadmapModules.find((m) => m.order === targetModule.order - 1);
  if (prevModule) {
    const prevProgress = progressMap.get(prevModule.moduleId);
    if (!prevProgress || prevProgress.status !== 'COMPLETED') {
      return false;
    }
  }

  return true;
};

/**
 * Pure function: Applies START module logic cleanly without mutating input.
 */
export const applyModuleStart = (
  rawItem: IModuleProgressItem,
  timestamp: Date = new Date()
): IModuleProgressItem => {
  const item = toPlainItem(rawItem);
  const updated: IModuleProgressItem = { ...item };

  if (updated.status === 'LOCKED') {
    updated.status = 'IN_PROGRESS';
    updated.startedAt = updated.startedAt || timestamp;
    updated.lastActivityAt = timestamp;
    updated.progressPercent = Math.max(updated.progressPercent, 0);
  } else if (updated.status === 'IN_PROGRESS') {
    updated.startedAt = updated.startedAt || timestamp;
    updated.lastActivityAt = timestamp;
  } else if (updated.status === 'COMPLETED') {
    // Idempotent & non-regressive: preserve COMPLETED status & 100% progress
    updated.status = 'COMPLETED';
    updated.progressPercent = 100;
  }

  return updated;
};

/**
 * Pure function: Applies PROGRESS UPDATE logic cleanly without mutating input.
 */
export const applyModuleProgressUpdate = (
  rawItem: IModuleProgressItem,
  progressPercent: number,
  timestamp: Date = new Date()
): IModuleProgressItem => {
  if (
    typeof progressPercent !== 'number' ||
    isNaN(progressPercent) ||
    progressPercent < 0 ||
    progressPercent > 100
  ) {
    throw new RoadmapProgressError(
      'Invalid progress percentage. Must be a valid number between 0 and 100.',
      400
    );
  }

  const item = toPlainItem(rawItem);
  const updated: IModuleProgressItem = { ...item };

  // If already COMPLETED, do not regress status or completedAt timestamp
  if (updated.status === 'COMPLETED') {
    updated.progressPercent = 100;
    return updated;
  }

  if (progressPercent === 100) {
    updated.status = 'COMPLETED';
    updated.progressPercent = 100;
    updated.startedAt = updated.startedAt || timestamp;
    updated.completedAt = updated.completedAt || timestamp;
    updated.lastActivityAt = timestamp;
  } else if (progressPercent > 0) {
    updated.status = 'IN_PROGRESS';
    updated.progressPercent = progressPercent;
    updated.startedAt = updated.startedAt || timestamp;
    updated.lastActivityAt = timestamp;
  } else {
    // progressPercent === 0
    updated.progressPercent = 0;
    if (updated.status === 'IN_PROGRESS') {
      updated.lastActivityAt = timestamp;
    }
  }

  return updated;
};

/**
 * Pure function: Applies COMPLETE module logic cleanly without mutating input.
 */
export const applyModuleComplete = (
  rawItem: IModuleProgressItem,
  timestamp: Date = new Date()
): IModuleProgressItem => {
  const item = toPlainItem(rawItem);
  const updated: IModuleProgressItem = { ...item };

  updated.status = 'COMPLETED';
  updated.progressPercent = 100;
  updated.startedAt = updated.startedAt || timestamp;
  updated.completedAt = updated.completedAt || timestamp;
  updated.lastActivityAt = timestamp;

  return updated;
};

/**
 * APPLICATION SERVICE: Interacts with database, handles student authentication & authorization,
 * enforces version isolation, and persists progress changes.
 */

/**
 * Fetches or initializes a RoadmapProgress document for a given roadmap and student.
 */
export const getOrCreateRoadmapProgress = async (
  roadmapIdStr: string | null | undefined,
  userIdOrProfileId: string
): Promise<{ roadmap: IRoadmapDocument; progress: IRoadmapProgressDocument }> => {
  if (!Types.ObjectId.isValid(userIdOrProfileId)) {
    throw new RoadmapProgressError('Invalid student identity format.', 400);
  }

  const idObj = new Types.ObjectId(userIdOrProfileId);

  // 1. Resolve StudentProfile
  const studentProfile = await StudentProfile.findOne({
    $or: [{ userId: idObj }, { _id: idObj }],
  });

  if (!studentProfile) {
    throw new RoadmapProgressError('Student profile not found.', 404);
  }

  // 2. Resolve Roadmap Document
  let roadmap: IRoadmapDocument | null = null;
  if (roadmapIdStr && Types.ObjectId.isValid(roadmapIdStr)) {
    roadmap = await RoadmapModel.findById(roadmapIdStr);
  } else {
    // Default to student's current active roadmap
    roadmap = await RoadmapModel.findOne({
      studentProfileId: studentProfile._id,
      isCurrent: true,
    });
  }

  if (!roadmap) {
    throw new RoadmapProgressError('Roadmap document not found.', 404);
  }

  // 3. Validate Student Ownership & Security
  const isOwner =
    (roadmap.studentProfileId && roadmap.studentProfileId.toString() === studentProfile._id.toString()) ||
    (roadmap.userId && studentProfile.userId && roadmap.userId.toString() === studentProfile.userId.toString());

  if (!isOwner) {
    throw new RoadmapProgressError(
      'Forbidden: You do not have permission to access or modify this roadmap progress.',
      403
    );
  }

  // 4. Fetch or Create RoadmapProgress Document
  let progress = await RoadmapProgressModel.findOne({ roadmapId: roadmap._id });

  if (!progress) {
    const now = new Date();
    const initialModules: IModuleProgressItem[] = roadmap.modules.map((m) => {
      const isInitialActive = m.order === 1 || m.status === 'IN_PROGRESS';
      const isCompleted = m.status === 'COMPLETED';

      return {
        moduleId: m.moduleId,
        status: isCompleted ? 'COMPLETED' : isInitialActive ? 'IN_PROGRESS' : 'LOCKED',
        progressPercent: isCompleted ? 100 : 0,
        startedAt: isInitialActive || isCompleted ? now : null,
        completedAt: isCompleted ? now : null,
        lastActivityAt: isInitialActive || isCompleted ? now : null,
      };
    });

    const stats = calculateOverallProgress(initialModules);

    progress = await RoadmapProgressModel.create({
      roadmapId: roadmap._id,
      studentProfileId: studentProfile._id,
      userId: studentProfile.userId,
      modules: initialModules,
      overallProgress: stats.overallProgress,
      totalModules: stats.totalModules,
      completedModules: stats.completedModules,
      inProgressModules: stats.inProgressModules,
      lockedModules: stats.lockedModules,
      lastActiveAt: now,
    });
  }

  return { roadmap, progress };
};

/**
 * Starts a roadmap module (LOCKED -> IN_PROGRESS).
 */
export const startModuleProgress = async (
  roadmapIdStr: string | null | undefined,
  moduleId: string,
  userIdOrProfileId: string
): Promise<IRoadmapProgressDocument> => {
  if (!moduleId || moduleId.trim() === '') {
    throw new RoadmapProgressError('moduleId is required.', 400);
  }

  const { roadmap, progress } = await getOrCreateRoadmapProgress(roadmapIdStr, userIdOrProfileId);

  // Build progress map
  const progressMap = new Map<string, IModuleProgressItem>();
  progress.modules.forEach((m) => progressMap.set(m.moduleId, toPlainItem(m)));

  const targetProgress = progressMap.get(moduleId);
  if (!targetProgress) {
    throw new RoadmapProgressError(`Module '${moduleId}' not found in roadmap.`, 404);
  }

  // Check locking / prerequisite rules
  const unlocked = isModuleUnlocked(moduleId, roadmap.modules, progressMap);
  if (!unlocked) {
    throw new RoadmapProgressError(
      `Cannot start module '${moduleId}'. Prerequisite modules are incomplete.`,
      400
    );
  }

  const now = new Date();
  const updatedItem = applyModuleStart(targetProgress, now);

  // Update modules array in progress document
  const modIndex = progress.modules.findIndex((m) => m.moduleId === moduleId);
  progress.modules[modIndex] = updatedItem;

  const stats = calculateOverallProgress(progress.modules);
  progress.overallProgress = stats.overallProgress;
  progress.totalModules = stats.totalModules;
  progress.completedModules = stats.completedModules;
  progress.inProgressModules = stats.inProgressModules;
  progress.lockedModules = stats.lockedModules;
  progress.lastActiveAt = now;

  await progress.save();
  return progress;
};

/**
 * Updates progress percentage for a module (0-100%).
 */
export const updateModuleProgress = async (
  roadmapIdStr: string | null | undefined,
  moduleId: string,
  progressPercent: number,
  userIdOrProfileId: string
): Promise<IRoadmapProgressDocument> => {
  if (!moduleId || moduleId.trim() === '') {
    throw new RoadmapProgressError('moduleId is required.', 400);
  }

  if (
    typeof progressPercent !== 'number' ||
    isNaN(progressPercent) ||
    progressPercent < 0 ||
    progressPercent > 100
  ) {
    throw new RoadmapProgressError(
      'Invalid progress percentage. Must be a number between 0 and 100.',
      400
    );
  }

  const { roadmap, progress } = await getOrCreateRoadmapProgress(roadmapIdStr, userIdOrProfileId);

  const progressMap = new Map<string, IModuleProgressItem>();
  progress.modules.forEach((m) => progressMap.set(m.moduleId, toPlainItem(m)));

  const targetProgress = progressMap.get(moduleId);
  if (!targetProgress) {
    throw new RoadmapProgressError(`Module '${moduleId}' not found in roadmap.`, 404);
  }

  const unlocked = isModuleUnlocked(moduleId, roadmap.modules, progressMap);
  if (!unlocked) {
    throw new RoadmapProgressError(
      `Cannot update progress for locked module '${moduleId}'. Prerequisites are incomplete.`,
      400
    );
  }

  const now = new Date();
  const updatedItem = applyModuleProgressUpdate(targetProgress, progressPercent, now);

  const modIndex = progress.modules.findIndex((m) => m.moduleId === moduleId);
  progress.modules[modIndex] = updatedItem;

  const stats = calculateOverallProgress(progress.modules);
  progress.overallProgress = stats.overallProgress;
  progress.totalModules = stats.totalModules;
  progress.completedModules = stats.completedModules;
  progress.inProgressModules = stats.inProgressModules;
  progress.lockedModules = stats.lockedModules;
  progress.lastActiveAt = now;

  await progress.save();
  return progress;
};

/**
 * Completes a roadmap module (sets progressPercent = 100, status = COMPLETED).
 */
export const completeModuleProgress = async (
  roadmapIdStr: string | null | undefined,
  moduleId: string,
  userIdOrProfileId: string
): Promise<IRoadmapProgressDocument> => {
  if (!moduleId || moduleId.trim() === '') {
    throw new RoadmapProgressError('moduleId is required.', 400);
  }

  const { roadmap, progress } = await getOrCreateRoadmapProgress(roadmapIdStr, userIdOrProfileId);

  const progressMap = new Map<string, IModuleProgressItem>();
  progress.modules.forEach((m) => progressMap.set(m.moduleId, toPlainItem(m)));

  const targetProgress = progressMap.get(moduleId);
  if (!targetProgress) {
    throw new RoadmapProgressError(`Module '${moduleId}' not found in roadmap.`, 404);
  }

  const unlocked = isModuleUnlocked(moduleId, roadmap.modules, progressMap);
  if (!unlocked) {
    throw new RoadmapProgressError(
      `Cannot complete locked module '${moduleId}'. Prerequisites are incomplete.`,
      400
    );
  }

  const now = new Date();
  const updatedItem = applyModuleComplete(targetProgress, now);

  const modIndex = progress.modules.findIndex((m) => m.moduleId === moduleId);
  progress.modules[modIndex] = updatedItem;

  const stats = calculateOverallProgress(progress.modules);
  progress.overallProgress = stats.overallProgress;
  progress.totalModules = stats.totalModules;
  progress.completedModules = stats.completedModules;
  progress.inProgressModules = stats.inProgressModules;
  progress.lockedModules = stats.lockedModules;
  progress.lastActiveAt = now;

  await progress.save();
  return progress;
};

/**
 * Retrieves the overall roadmap progress summary for a student.
 */
export const getRoadmapProgressSummary = async (
  roadmapIdStr: string | null | undefined,
  userIdOrProfileId: string
): Promise<IRoadmapProgressDocument> => {
  const { progress } = await getOrCreateRoadmapProgress(roadmapIdStr, userIdOrProfileId);
  return progress;
};
