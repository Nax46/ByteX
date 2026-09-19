export type ResourceType = 'ARTICLE' | 'VIDEO' | 'COURSE' | 'DOCUMENTATION' | 'BOOK' | 'PRACTICE' | 'PROJECT'

export type ResourceLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface LearningResource {
  id: string
  title: string
  description: string
  url: string
  type: ResourceType
  provider: string // e.g., MDN, Coursera, YouTube, Official Docs
  skillTag: string
  estimatedDuration: string
  level?: ResourceLevel
  isCompleted?: boolean
  rating?: number
}

export interface ResourceRecommendation {
  resource: LearningResource
  relevanceScore: number
  recommendationReason: string
  skillName: string
  targetSkillGap: number
  priorityScore: number
}

