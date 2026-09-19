import { apiClient } from '@/api/client'

export interface BackendCareer {
  id: string
  title: string
  slug: string
  description?: string
  category?: string
  isActive: boolean
}

export interface BackendRequiredSkill {
  skillId: string
  name: string
  slug: string
  category: string
  description?: string
  requiredLevel: number
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  weight?: number
  prerequisites: Array<{
    skillId: string
    name: string
    slug: string
    category: string
  }>
}

export interface BackendCareerDetails {
  career: BackendCareer
  requiredSkills: BackendRequiredSkill[]
  summaryMetrics: {
    totalRequiredSkills: number
    resourceCount: number
    projectCount: number
    hasDiagnosticAssessment: boolean
    diagnosticAssessment?: {
      id: string
      slug: string
      title: string
      durationMinutes: number
    } | null
  }
}

export interface BackendCareerReadiness {
  career: BackendCareer
  readinessMetrics: {
    formulaStatus: string
    totalRequiredSkills: number
    metSkillsCount: number
    developingSkillsCount: number
    needsWorkSkillsCount: number
  }
  skillBreakdown: Array<{
    skillId: string
    name: string
    slug: string
    category: string
    currentLevel: number
    requiredLevel: number
    gap: number
    importance: string
    priorityScore: number
    status: 'MET' | 'DEVELOPING' | 'NEEDS_WORK'
    prerequisites: any[]
  }>
}

export const careersApi = {
  getCareers: async (): Promise<BackendCareer[]> => {
    const res = await apiClient.get<{ careers: BackendCareer[]; total: number }>('/v1/intelligence/careers')
    return res.data?.careers || []
  },

  getCareerDetails: async (careerIdOrSlug: string): Promise<BackendCareerDetails> => {
    const res = await apiClient.get<BackendCareerDetails>(`/v1/intelligence/careers/${careerIdOrSlug}`)
    return res.data
  },

  getCareerSkills: async (careerIdOrSlug: string): Promise<{ careerId: string; careerTitle: string; careerSlug: string; skills: BackendRequiredSkill[] }> => {
    const res = await apiClient.get<{ careerId: string; careerTitle: string; careerSlug: string; skills: BackendRequiredSkill[] }>(`/v1/intelligence/careers/${careerIdOrSlug}/skills`)
    return res.data
  },

  getCareerReadiness: async (careerIdOrSlug: string): Promise<BackendCareerReadiness> => {
    const res = await apiClient.get<BackendCareerReadiness>(`/v1/intelligence/careers/${careerIdOrSlug}/readiness`)
    return res.data
  },
}
