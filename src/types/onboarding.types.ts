export interface OnboardingPayload {
  personalInfo: {
    fullName: string
    headline?: string
    location?: string
    preferredLanguage?: string
  }
  education: {
    institution: string
    degree: string
    fieldOfStudy: string
    graduationYear: number
    currentStatus: 'student' | 'bootcamp' | 'self-taught' | 'professional'
  }
  skills: {
    knownSkills: string[]
    primaryFocus: string
    yearsOfExperience: number
  }
  careerGoal: {
    targetRole: string
    targetTimelineMonths: number
    targetCompanyType: 'startup' | 'faang' | 'mid-tier' | 'freelance' | 'undecided'
  }
  interests: {
    preferredLearningFormat: ('reading' | 'videos' | 'interactive' | 'projects')[]
    weeklyCommitmentHours: number
    openToMentorship: boolean
  }
}

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6
