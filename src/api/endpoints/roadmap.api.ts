import { apiClient } from '../client'
import { Roadmap, RoadmapMilestone } from '@/types/roadmap.types'

/**
 * Roadmap API Module
 * NOTE FOR BACKEND TEAM:
 * Connect personalized AI learning path generator and milestone progression endpoints here.
 */
export const roadmapApi = {
  getCurrentRoadmap: async (): Promise<Roadmap> => {
    const res = await apiClient.get<Roadmap>('/roadmap')
    return res.data
  },

  updateMilestoneStatus: async (
    milestoneId: string,
    status: RoadmapMilestone['status']
  ): Promise<RoadmapMilestone> => {
    const res = await apiClient.put<RoadmapMilestone, { status: RoadmapMilestone['status'] }>(
      `/roadmap/milestones/${milestoneId}/status`,
      { status }
    )
    return res.data
  },

  regenerateRoadmap: async (careerGoalId?: string): Promise<Roadmap> => {
    const res = await apiClient.post<Roadmap, { careerGoalId?: string }>('/roadmap/regenerate', {
      careerGoalId,
    })
    return res.data
  },
}
