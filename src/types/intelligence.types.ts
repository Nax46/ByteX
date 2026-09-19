export type SkillImportance = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type PriorityStatus = 'CRITICAL_GAP' | 'MODERATE_GAP' | 'LOW_GAP' | 'TARGET_MET' | 'NO_EVIDENCE';
export type RoadmapModuleStatus = 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
export type ScoreTrend = 'IMPROVED' | 'DECLINED' | 'UNCHANGED' | 'NEW_EVIDENCE';

export interface ISkillGapPrioritySnapshot {
  skillId: string;
  skillName: string;
  skillSlug: string;
  currentLevel: number | null;
  targetLevel: number;
  gap: number;
  hasEvidence: boolean;
  importance: SkillImportance;
  weight: number;
  priorityRank: number;
  priorityScore: number;
  priorityStatus: PriorityStatus;
}

export interface ISkillGapPriorityReadout {
  snapshots: ISkillGapPrioritySnapshot[];
  targetCareerTitle?: string;
  overallReadinessScore?: number;
  totalRequiredSkills?: number;
  metSkillsCount?: number;
}

export interface IModuleProgressItem {
  moduleId: string;
  status: RoadmapModuleStatus;
  progressPercent: number;
  startedAt?: string | null;
  completedAt?: string | null;
  lastActivityAt?: string | null;
}

export interface IRoadmapProgressSummary {
  roadmapId: string;
  overallProgress: number;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  lockedModules: number;
  modules: IModuleProgressItem[];
  roadmapDetails?: {
    title?: string;
    description?: string;
    modules: Array<{
      moduleId: string;
      skillId: string;
      title: string;
      description?: string;
      order: number;
      targetLevel: number;
      currentLevel: number | null;
      gapMagnitude: number;
      priorityScore: number;
    }>;
  };
}

export interface ISkillScoreComparison {
  skillId: string;
  skillName?: string;
  skillSlug?: string;
  previousScore: number | null;
  currentScore: number;
  change: number | null;
  trend: ScoreTrend;
}

export interface IReassessmentSummary {
  studentProfileId: string;
  latestAttemptId: string;
  previousAttemptId: string | null;
  latestCompletedAt: string;
  previousCompletedAt: string | null;
  skillComparisons: ISkillScoreComparison[];
  overallPreviousScore: number | null;
  overallCurrentScore: number;
  overallChange: number | null;
  attemptCount: number;
}

export interface ReassessmentSummaryResponse {
  summary: IReassessmentSummary;
}
