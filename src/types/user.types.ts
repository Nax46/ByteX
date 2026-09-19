export interface UserProfile {
  id: string
  name: string
  fullName?: string
  email: string
  avatarUrl?: string
  role?: 'student' | 'mentor' | 'admin'
  careerGoal?: string
  targetCareer?: string
  education?: {
    institution?: string
    degree?: string
    graduationYear?: number
  }
  bio?: string
  createdAt?: string
}

export interface UserStats {
  overallScore: number
  careerReadiness: number
  completedAssessments: number
  skillsTracked: number
  completedMilestones: number
  learningStreakDays: number
}
