import { Types } from 'mongoose';
import { RoadmapModuleStatus } from './intelligence.js';

export class RoadmapProgressError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'RoadmapProgressError';
    this.statusCode = statusCode;
  }
}

export interface IModuleProgressItem {
  moduleId: string;
  status: RoadmapModuleStatus;
  progressPercent: number;
  startedAt?: Date | null;
  completedAt?: Date | null;
  lastActivityAt?: Date | null;
}

export interface IRoadmapProgress {
  _id?: Types.ObjectId;
  roadmapId: Types.ObjectId;
  studentProfileId: Types.ObjectId;
  userId?: Types.ObjectId;
  modules: IModuleProgressItem[];
  overallProgress: number;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  lockedModules: number;
  lastActiveAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUpdateModuleProgressInput {
  progressPercent: number;
}
