export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'

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
}

export interface Roadmap {
  id: string
  userId: string
  careerGoal: string
  targetTimelineWeeks: number
  progressPercentage: number
  milestones: RoadmapMilestone[]
  updatedAt: string
}
