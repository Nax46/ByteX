export type ResourceType = 'ARTICLE' | 'VIDEO' | 'COURSE' | 'DOCUMENTATION' | 'BOOK'

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
