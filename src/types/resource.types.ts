export type ResourceType =
  | 'ARTICLE'
  | 'VIDEO'
  | 'COURSE'
  | 'DOCUMENTATION'
  | 'BOOK'
  | 'PRACTICE'
  | 'QUIZ'

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
  relevanceScore?: number
  recommendationReason?: string
  priorityScore?: number
  targetSkillGap?: number
}

export interface IBackendResource {
  _id?: string
  title: string
  slug?: string
  description: string
  url: string
  type: ResourceType
  provider: string
  skillId?: string
  skillTag?: string
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedDuration?: string
  rating?: number
  authorOrInstructor?: string
  isPaid?: boolean
  tags?: string[]
}

export interface IBackendResourceRecommendation {
  resource: IBackendResource
  relevanceScore: number
  recommendationReason: string
  skillName: string
  targetSkillGap: number
  priorityScore: number
}
