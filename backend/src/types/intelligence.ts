import { Types } from 'mongoose';

export type SkillCategory = 'TECHNICAL' | 'SOFT' | 'TOOL' | 'FRAMEWORK' | 'CORE_CS';

export interface ISkill {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  category: SkillCategory;
  description?: string;
  maxLevel: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICareer {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SkillImportance = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ICareerSkill {
  _id?: Types.ObjectId;
  careerId: Types.ObjectId;
  skillId: Types.ObjectId;
  requiredLevel: number;
  importance: SkillImportance;
  weight?: number;
  prerequisites?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type PriorityStatus = 'CRITICAL_GAP' | 'MODERATE_GAP' | 'LOW_GAP' | 'TARGET_MET' | 'NO_EVIDENCE';

export interface ISkillGapResult {
  skillId: Types.ObjectId;
  skillName?: string;
  skillSlug?: string;
  currentLevel: number | null;
  targetLevel: number;
  gap: number;
  hasEvidence: boolean;
  status: PriorityStatus;
}

export interface IPriorityInput {
  gapResult: ISkillGapResult;
  importance: SkillImportance;
  weight: number;
  prerequisites: Types.ObjectId[];
  isPrerequisiteForOthers: boolean;
}

export interface IPriorityResult {
  priorityScore: number;
  strategyName: string;
  isProvisional: boolean;
  priorityStatus: PriorityStatus;
  explanation: string;
}

export interface ISkillGapPrioritySnapshot {
  skillId: Types.ObjectId;
  skillName?: string;
  skillSlug?: string;
  currentLevel: number | null;
  targetLevel: number;
  gap: number;
  hasEvidence: boolean;
  importance: SkillImportance;
  weight: number;
  prerequisites: Types.ObjectId[];
  isPrerequisiteForOthers: boolean;
  priority: IPriorityResult;
}

export interface IPriorityStrategy {
  name: string;
  isProvisional: boolean;
  calculatePriority(input: IPriorityInput): IPriorityResult;
}

