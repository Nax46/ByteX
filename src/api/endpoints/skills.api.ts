import { apiClient } from '../client'
import { Skill, SkillGap } from '@/types/skill.types'

/**
 * Skills & Gap Analysis API Module
 * NOTE FOR BACKEND TEAM:
 * Wire skill taxonomy and gap identification services here.
 */
export const skillsApi = {
  getSkills: async (): Promise<Skill[]> => {
    const res = await apiClient.get<Skill[]>('/skills')
    return res.data
  },

  getSkillGaps: async (): Promise<SkillGap[]> => {
    const res = await apiClient.get<SkillGap[]>('/skills/gaps')
    return res.data
  },

  updateSkillTarget: async (skillId: string, targetLevel: number): Promise<Skill> => {
    const res = await apiClient.put<Skill, { targetLevel: number }>(`/skills/${skillId}/target`, {
      targetLevel,
    })
    return res.data
  },
}
