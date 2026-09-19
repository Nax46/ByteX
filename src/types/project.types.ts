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
  architectureOverview?: string
  learningObjectives?: string[]
  category?: string
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED'
}

export interface ProjectRecommendation {
  project: RecommendedProject
  relevanceScore: number
  recommendationReason: string
  primarySkillName: string
  targetSkillGap: number
  priorityScore: number
  reinforcedSkillNames: string[]
}

