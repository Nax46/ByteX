export type ResourceType = 'ARTICLE' | 'VIDEO' | 'COURSE' | 'DOCUMENTATION' | 'BOOK'

export interface LearningResource {
  id: string
  title: string
  description: string
  url: string
  type: ResourceType
  provider: string // e.g., MDN, Coursera, YouTube, Official Docs
  skillTag: string
  estimatedDuration: string
  isCompleted?: boolean
  rating?: number
}
