import { apiClient } from '@/api/client'
import { Roadmap, RoadmapMilestone } from '@/types/roadmap.types'

export interface IRoadmapModuleProgress {
  moduleId: string
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED'
  progressPercent: number
  startedAt?: string
  completedAt?: string
  lastActivityAt?: string
}

export interface IRoadmapProgressSummary {
  roadmapId: string
  version: number
  isCurrent: boolean
  status: string
  overallProgress: number
  totalModules: number
  completedModules: number
  inProgressModules: number
  lockedModules: number
  lastActiveAt?: string
  modules: IRoadmapModuleProgress[]
  roadmapDetails?: {
    careerId: string
    modules: Array<{
      moduleId: string
      skillId: string
      skillName: string
      order: number
      title: string
      description: string
      targetLevel: number
      currentLevel: number
      estimatedHours: number
      prerequisites: string[]
    }>
  }
}

export const roadmapApi = {
  getCurrentRoadmap: async (): Promise<Roadmap> => {
    const res = await apiClient.get<Roadmap>('/roadmap')
    return res.data
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
