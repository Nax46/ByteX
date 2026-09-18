import { apiClient } from '@/api/client'
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

  getRoadmapProgress: async (roadmapId?: string): Promise<{ progress: IRoadmapProgressSummary }> => {
    const url = roadmapId ? `/v1/intelligence/roadmap/progress?roadmapId=${roadmapId}` : '/v1/intelligence/roadmap/progress'
    const res = await apiClient.get<{ progress: IRoadmapProgressSummary }>(url)
    return res.data
  },

  startModule: async (moduleId: string, roadmapId?: string): Promise<{ progress: IRoadmapProgressSummary }> => {
    const res = await apiClient.post<{ progress: IRoadmapProgressSummary }>(`/v1/intelligence/roadmap/modules/${moduleId}/start`, {
      roadmapId,
    })
    return res.data
  },

  updateModuleProgress: async (
    moduleId: string,
    progressPercent: number,
    roadmapId?: string
  ): Promise<{ progress: IRoadmapProgressSummary }> => {
    const res = await apiClient.patch<{ progress: IRoadmapProgressSummary }>(`/v1/intelligence/roadmap/modules/${moduleId}/progress`, {
      progressPercent,
      roadmapId,
    })
    return res.data
  },

  completeModule: async (moduleId: string, roadmapId?: string): Promise<{ progress: IRoadmapProgressSummary }> => {
    const res = await apiClient.post<{ progress: IRoadmapProgressSummary }>(`/v1/intelligence/roadmap/modules/${moduleId}/complete`, {
      roadmapId,
    })
    return res.data
  },

  generateAdaptiveRoadmap: async (force?: boolean): Promise<{ roadmap: unknown }> => {
    const res = await apiClient.post<{ roadmap: unknown }>('/v1/intelligence/roadmap/adaptive', {
      force,
    })
    return res.data
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
