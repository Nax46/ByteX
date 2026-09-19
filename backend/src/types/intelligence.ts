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

// Resource Types
export type ResourceType = 'ARTICLE' | 'VIDEO' | 'COURSE' | 'DOCUMENTATION' | 'BOOK' | 'PRACTICE' | 'QUIZ';
export type ResourceDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface IResource {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  url: string;
  type: ResourceType;
  provider: string;
  skillId: Types.ObjectId;
  skillTag?: string;
  difficulty: ResourceDifficulty;
  estimatedDuration: string;
  rating?: number;
  authorOrInstructor?: string;
  isPaid?: boolean;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IResourceRecommendation {
  resource: IResource;
  relevanceScore: number;
  recommendationReason: string;
  skillName: string;
  targetSkillGap: number;
  priorityScore: number;
}

// Project Types
export type ProjectDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface IProject {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  difficulty: ProjectDifficulty;
  careerId?: Types.ObjectId;
  skillId: Types.ObjectId;
  skillsReinforced?: Types.ObjectId[];
  technologies?: string[];
  estimatedHours: number;
  githubStarterUrl?: string;
  architectureOverview?: string;
  learningObjectives?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProjectRecommendation {
  project: IProject;
  relevanceScore: number;
  recommendationReason: string;
  primarySkillName: string;
  targetSkillGap: number;
  priorityScore: number;
  reinforcedSkillNames: string[];
}

// Roadmap Types
export type RoadmapModuleStatus = 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
export type RoadmapStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

export interface IRoadmapModule {
  moduleId: string;
  skillId: Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  targetLevel: number;
  currentLevel: number | null;
  gapMagnitude: number;
  priorityScore: number;
  prerequisites?: Types.ObjectId[];
  recommendedResourceIds?: Types.ObjectId[];
  recommendedProjectIds?: Types.ObjectId[];
  status: RoadmapModuleStatus;
}

export interface IRoadmap {
  _id?: Types.ObjectId;
  userId?: Types.ObjectId;
  studentProfileId?: Types.ObjectId;
  careerId: Types.ObjectId;
  title?: string;
  description?: string;
  version: number;
  isCurrent: boolean;
  status: RoadmapStatus;
  modules: IRoadmapModule[];
  generatedFromAssessmentAttemptId?: Types.ObjectId | null;
  generationReason?: 'INITIAL' | 'REASSESSMENT' | 'ADAPTIVE';
  createdAt?: Date;
  updatedAt?: Date;
}



