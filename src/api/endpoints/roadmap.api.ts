import { apiClient } from '../client'
import { Roadmap, RoadmapMilestone } from '@/types/roadmap.types'
import { DEMO_ROADMAP } from '@/data/demo.roadmap'

/**
 * Roadmap API Module
 * NOTE FOR BACKEND TEAM:
 * Connect personalized AI learning path generator and milestone progression endpoints here.
 *
 * DEMO FALLBACK: Returns a realistic 6-stage demo roadmap when the backend is unavailable.
 * Simply remove the catch block when the backend is connected.
 */
export const roadmapApi = {
  getCurrentRoadmap: async (): Promise<Roadmap> => {
    try {
      const res = await apiClient.get<Roadmap>('/roadmap')
      return res.data
    } catch {
      return DEMO_ROADMAP
    }
  },

  updateMilestoneStatus: async (
    milestoneId: string,
    status: RoadmapMilestone['status']
  ): Promise<RoadmapMilestone> => {
    try {
      const res = await apiClient.put<RoadmapMilestone, { status: RoadmapMilestone['status'] }>(
        `/roadmap/milestones/${milestoneId}/status`,
        { status }
      )
      return res.data
    } catch {
      // Return a minimal milestone stub on failure so the UI toggle still works locally
      const milestone = DEMO_ROADMAP.milestones.find((m) => m.id === milestoneId)
      if (!milestone) throw new Error(`Milestone ${milestoneId} not found`)
      return { ...milestone, status }
    }
  },

  regenerateRoadmap: async (careerGoalId?: string): Promise<Roadmap> => {
    try {
      const res = await apiClient.post<Roadmap, { careerGoalId?: string }>('/roadmap/regenerate', {
        careerGoalId,
      })
      return res.data
    } catch {
      return DEMO_ROADMAP
    }
  },
}
