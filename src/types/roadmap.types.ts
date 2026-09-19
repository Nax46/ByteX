export type MilestoneStatus = 'NOT_STARTED' | 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED'

export interface RoadmapMilestone {
  id: string
  title: string
  description: string
  estimatedHours: number
  status: MilestoneStatus
  skillsCovered: string[]
  order: number
  resourcesCount: number
  projectsCount: number
  progressPercent?: number
}

export interface Roadmap {
  id: string
  userId: string
  careerGoal: string
  targetTimelineWeeks: number
  progressPercentage: number
  milestones: RoadmapMilestone[]
  updatedAt: string
  version?: number
  isCurrent?: boolean
}

export interface IRoadmapProgressSummary {
  roadmapId?: string
  overallProgress: number
  totalModules: number
  completedModules: number
  inProgressModules: number
  lockedModules: number
  modules: Array<{
    moduleId: string
    status: string
    progressPercent: number
    startedAt?: string | null
    completedAt?: string | null
  }>
  roadmapDetails?: {
    careerGoal?: string
    title?: string
    modules: Array<{
      moduleId: string
      order: number
      title: string
      description?: string
    }>
  }
}
