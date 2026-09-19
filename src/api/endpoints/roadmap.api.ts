import { apiClient } from '@/api/client'
import { Roadmap, RoadmapMilestone, MilestoneStatus, IRoadmapProgressSummary } from '@/types/roadmap.types'
import { DEMO_ROADMAP } from '@/data/demo.roadmap'

interface BackendModule {
  moduleId: string
  skillId?: string
  title: string
  description?: string
  order: number
  targetLevel?: number
  currentLevel?: number | null
  gapMagnitude?: number
  priorityScore?: number
  prerequisites?: string[]
  recommendedResourceIds?: string[]
  recommendedProjectIds?: string[]
  status?: string
}

interface BackendRoadmap {
  _id?: string
  id?: string
  userId?: string
  studentProfileId?: string
  careerId?: string
  title?: string
  description?: string
  version?: number
  isCurrent?: boolean
  modules?: BackendModule[]
  updatedAt?: string
}

/**
 * Normalizes backend IRoadmap and IRoadmapProgress models into the frontend Roadmap shape.
 */
export function formatBackendRoadmap(
  rawRoadmap: BackendRoadmap | null | undefined,
  rawProgress?: IRoadmapProgressSummary | null
): Roadmap {
  if (!rawRoadmap || !Array.isArray(rawRoadmap.modules) || rawRoadmap.modules.length === 0) {
    return DEMO_ROADMAP
  }

  const progressModules = rawProgress?.modules || []
  const progressMap = new Map<string, { status: MilestoneStatus; progressPercent: number }>()
  progressModules.forEach((pm) => {
    progressMap.set(pm.moduleId, {
      status: (pm.status as MilestoneStatus) || 'LOCKED',
      progressPercent: pm.progressPercent ?? (pm.status === 'COMPLETED' ? 100 : 0),
    })
  })

  const rawModules = rawRoadmap.modules || []
  const milestones: RoadmapMilestone[] = rawModules.map((m) => {
    const prog = progressMap.get(m.moduleId)
    const status: MilestoneStatus = (prog?.status || m.status || (m.order === 1 ? 'IN_PROGRESS' : 'LOCKED')) as MilestoneStatus
    const progressPercent = prog?.progressPercent ?? (status === 'COMPLETED' ? 100 : 0)
    const displayName = m.title ? m.title.replace(/ Fundamentals$/i, '') : `Skill ${m.order}`

    return {
      id: m.moduleId,
      title: m.title || `Module ${m.order}`,
      description: m.description || `Targeted learning and practice for ${displayName}.`,
      estimatedHours: Math.max(8, Math.round((m.gapMagnitude || 40) * 0.5)),
      status,
      progressPercent,
      skillsCovered: [displayName],
      order: m.order,
      resourcesCount: Array.isArray(m.recommendedResourceIds) && m.recommendedResourceIds.length > 0 ? m.recommendedResourceIds.length : 3,
      projectsCount: Array.isArray(m.recommendedProjectIds) && m.recommendedProjectIds.length > 0 ? m.recommendedProjectIds.length : 1,
    }
  })

  const total = milestones.length
  const completed = milestones.filter((m) => m.status === 'COMPLETED').length
  const progressPercentage =
    typeof rawProgress?.overallProgress === 'number'
      ? rawProgress.overallProgress
      : total > 0
      ? Math.round((completed / total) * 100)
      : 0

  return {
    id: rawRoadmap._id || rawRoadmap.id || 'roadmap_current',
    userId: rawRoadmap.userId || rawRoadmap.studentProfileId || '',
    careerGoal: rawRoadmap.title || 'Learning Roadmap',
    targetTimelineWeeks: Math.max(6, Math.ceil(total * 2)),
    progressPercentage,
    milestones,
    updatedAt: rawRoadmap.updatedAt || new Date().toISOString(),
    version: rawRoadmap.version || 1,
    isCurrent: rawRoadmap.isCurrent !== false,
  }
}

/**
 * Roadmap API Module
 * Directly connects the frontend to live Person 2 intelligence, roadmap generation,
 * adaptive roadmap, and roadmap progress engine endpoints.
 */
export const roadmapApi = {
  /**
   * Retrieves current active roadmap and merges with persisted roadmap progress.
   */
  getCurrentRoadmap: async (): Promise<Roadmap> => {
    try {
      const res = await apiClient.get<{ roadmap: BackendRoadmap }>('/v1/intelligence/roadmap/current')
      const rawRoadmap = res.data?.roadmap
      if (!rawRoadmap) {
        return DEMO_ROADMAP
      }

      // Fetch accompanying persisted progress for the roadmap
      let progressSummary: IRoadmapProgressSummary | null = null
      try {
        const roadmapId = rawRoadmap._id || rawRoadmap.id
        const progRes = await apiClient.get<{ progress: IRoadmapProgressSummary }>(
          roadmapId ? `/v1/intelligence/roadmap/progress?roadmapId=${roadmapId}` : '/v1/intelligence/roadmap/progress'
        )
        progressSummary = progRes.data?.progress || null
      } catch {
        progressSummary = null
      }

      return formatBackendRoadmap(rawRoadmap, progressSummary)
    } catch {
      return DEMO_ROADMAP
    }
  },

  /**
   * Retrieves roadmap progress summary document for a specific roadmap or active roadmap.
   */
  getRoadmapProgress: async (roadmapId?: string): Promise<{ progress: IRoadmapProgressSummary }> => {
    const url = roadmapId
      ? `/v1/intelligence/roadmap/progress?roadmapId=${roadmapId}`
      : '/v1/intelligence/roadmap/progress'
    const res = await apiClient.get<{ progress: IRoadmapProgressSummary }>(url)
    return res.data
  },

  /**
   * Starts module progress (LOCKED -> IN_PROGRESS) on the backend.
   */
  startModule: async (moduleId: string, roadmapId?: string): Promise<{ progress: IRoadmapProgressSummary }> => {
    const res = await apiClient.post<{ progress: IRoadmapProgressSummary }>(
      `/v1/intelligence/roadmap/modules/${moduleId}/start`,
      { roadmapId }
    )
    return res.data
  },

  /**
   * Updates module progress percentage (0-100%) on the backend.
   */
  updateModuleProgress: async (
    moduleId: string,
    progressPercent: number,
    roadmapId?: string
  ): Promise<{ progress: IRoadmapProgressSummary }> => {
    const res = await apiClient.patch<{ progress: IRoadmapProgressSummary }>(
      `/v1/intelligence/roadmap/modules/${moduleId}/progress`,
      { progressPercent, roadmapId }
    )
    return res.data
  },

  /**
   * Marks a module completed (status = COMPLETED, progressPercent = 100) on the backend.
   */
  completeModule: async (moduleId: string, roadmapId?: string): Promise<{ progress: IRoadmapProgressSummary }> => {
    const res = await apiClient.post<{ progress: IRoadmapProgressSummary }>(
      `/v1/intelligence/roadmap/modules/${moduleId}/complete`,
      { roadmapId }
    )
    return res.data
  },

  /**
   * Generates or adapts a roadmap version with the AI adaptive roadmap engine.
   */
  generateAdaptiveRoadmap: async (force: boolean = true): Promise<{ roadmap: BackendRoadmap }> => {
    const res = await apiClient.post<{ roadmap: BackendRoadmap }>(
      '/v1/intelligence/roadmap/adaptive',
      { force }
    )
    return res.data
  },

  /**
   * Generates a baseline roadmap for the student's career target.
   */
  generateRoadmap: async (careerId?: string): Promise<{ roadmap: BackendRoadmap }> => {
    const res = await apiClient.post<{ roadmap: BackendRoadmap }>(
      '/v1/intelligence/roadmap/generate',
      { careerId }
    )
    return res.data
  },

  /**
   * Updates a milestone status by calling either completeModule or startModule on the backend.
   */
  updateMilestoneStatus: async (
    milestoneId: string,
    status: RoadmapMilestone['status'],
    roadmapId?: string
  ): Promise<RoadmapMilestone> => {
    if (status === 'COMPLETED') {
      await roadmapApi.completeModule(milestoneId, roadmapId)
    } else if (status === 'IN_PROGRESS') {
      await roadmapApi.startModule(milestoneId, roadmapId)
    }

    const current = await roadmapApi.getCurrentRoadmap()
    const found = current.milestones.find((m) => m.id === milestoneId)
    if (found) return found

    return {
      id: milestoneId,
      title: milestoneId,
      description: '',
      estimatedHours: 10,
      status,
      skillsCovered: [],
      order: 1,
      resourcesCount: 3,
      projectsCount: 1,
    }
  },

  /**
   * Regenerates/adapts the student learning roadmap via the backend adaptive roadmap engine.
   */
  regenerateRoadmap: async (_careerGoalId?: string): Promise<Roadmap> => {
    try {
      await roadmapApi.generateAdaptiveRoadmap(true)
      return await roadmapApi.getCurrentRoadmap()
    } catch {
      return DEMO_ROADMAP
    }
  },
}
