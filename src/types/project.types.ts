export type ProjectDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export interface RecommendedProject {
  id: string
  title: string
  description: string
  difficulty: ProjectDifficulty
  technologies: string[]
  skillsReinforced: string[]
  estimatedHours: number
  githubStarterUrl?: string
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED'
  primarySkillName?: string
  relevanceScore?: number
  recommendationReason?: string
  priorityScore?: number
  targetSkillGap?: number
  architectureOverview?: string
  learningObjectives?: string[]
}

export interface IBackendProject {
  _id?: string
  title: string
  slug?: string
  description: string
  difficulty: ProjectDifficulty
  careerId?: string
  skillId?: string
  skillsReinforced?: string[]
  technologies?: string[]
  estimatedHours?: number
  githubStarterUrl?: string
  architectureOverview?: string
  learningObjectives?: string[]
}

export interface IBackendProjectRecommendation {
  project: IBackendProject
  relevanceScore: number
  recommendationReason: string
  primarySkillName: string
  targetSkillGap: number
  priorityScore: number
  reinforcedSkillNames?: string[]
}
