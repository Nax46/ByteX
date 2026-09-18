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
}
