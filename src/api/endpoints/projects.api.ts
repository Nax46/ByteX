import { apiClient } from '@/api/client'
import { RecommendedProject } from '@/types/project.types'

/**
 * Projects API Module
 * NOTE FOR BACKEND TEAM:
 * Wire hands-on portfolio projects and validation checks here.
 */
export const projectsApi = {
  getRecommendedProjects: async (): Promise<RecommendedProject[]> => {
    const res = await apiClient.get<RecommendedProject[]>('/projects/recommended')
    return res.data
  },

  updateProjectStatus: async (
    projectId: string,
    status: RecommendedProject['status']
  ): Promise<RecommendedProject> => {
    const res = await apiClient.put<RecommendedProject, { status: RecommendedProject['status'] }>(
      `/projects/${projectId}/status`,
      { status }
    )
    return res.data
  },
}
