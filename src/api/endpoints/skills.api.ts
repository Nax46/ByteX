import { apiClient } from '@/api/client'
import { Skill, SkillGap, ISkillGapPriorityReadout } from '@/types/skill.types'
import { DEMO_SKILLS, DEMO_SKILL_GAPS } from '@/data/demo.skills'

/**
 * Skills & Gap Analysis API Module
 * NOTE FOR BACKEND TEAM:
 * Wire skill taxonomy and gap identification services here.
 *
 * DEMO FALLBACK: When the backend is unavailable, returns realistic demo data
 * that matches the same TypeScript interface. Simply remove the catch block
 * when the backend is connected.
 */
export const skillsApi = {
  getSkills: async (): Promise<Skill[]> => {
    try {
      const res = await apiClient.get<Skill[]>('/skills')
      return res.data
    } catch {
      return DEMO_SKILLS
    }
  },

  getSkillGaps: async (): Promise<SkillGap[]> => {
    try {
      const res = await apiClient.get<SkillGap[]>('/skills/gaps')
      return res.data
    } catch {
      return DEMO_SKILL_GAPS
    }
  },

  getSkillGapPriority: async (): Promise<ISkillGapPriorityReadout> => {
    const res = await apiClient.get<ISkillGapPriorityReadout>('/v1/intelligence/skill-gap-priority')
    return res.data
  },

  updateSkillTarget: async (skillId: string, targetLevel: number): Promise<Skill> => {
    const res = await apiClient.put<Skill, { targetLevel: number }>(`/skills/${skillId}/target`, {
      targetLevel,
    })
    return res.data
  },
}
