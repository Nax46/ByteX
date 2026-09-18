import { apiClient } from '@/api/client'
import { Skill, SkillGap } from '@/types/skill.types'

export interface ISkillGapPrioritySnapshot {
  skillId: string
  skillName: string
  category: string
  currentLevel: number
  targetLevel: number
  gap: number
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  priorityScore: number
  priorityRank: number
  gapStatus: 'TARGET_MET' | 'LOW_GAP' | 'MODERATE_GAP' | 'CRITICAL_GAP' | 'NO_EVIDENCE'
  prerequisitesMet?: boolean
}

export interface ISkillGapPriorityReadout {
  studentProfileId: string
  targetCareerId: string
  targetCareerTitle: string
  overallReadinessScore: number
  lastEvaluatedAt: string
  totalRequiredSkills: number
  metSkillsCount: number
  gapSkillsCount: number
  snapshots: ISkillGapPrioritySnapshot[]
}

export const skillsApi = {
  getSkills: async (): Promise<Skill[]> => {
    const res = await apiClient.get<Skill[]>('/skills')
    return res.data
  },

  getSkillGaps: async (): Promise<SkillGap[]> => {
    const res = await apiClient.get<SkillGap[]>('/skills/gaps')
    return res.data
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
