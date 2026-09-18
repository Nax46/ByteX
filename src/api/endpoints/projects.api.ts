import { apiClient } from '../client'
import { RecommendedProject } from '@/types/project.types'
import { DEMO_PROJECTS } from '@/data/demo.projects'

/**
 * Projects API Module
 * NOTE FOR BACKEND TEAM:
 * Wire hands-on portfolio projects and validation checks here.
 *
 * DEMO FALLBACK: Returns 4 realistic frontend practice projects when the backend
 * is unavailable. Simply remove the catch block when the backend is connected.
 */
export const projectsApi = {
  getRecommendedProjects: async (): Promise<RecommendedProject[]> => {
    try {
      const res = await apiClient.get<RecommendedProject[]>('/projects/recommended')
      return res.data
    } catch {
      return DEMO_PROJECTS
    }
  },

  updateProjectStatus: async (
    projectId: string,
    status: RecommendedProject['status']
  ): Promise<RecommendedProject> => {
    try {
      const res = await apiClient.put<RecommendedProject, { status: RecommendedProject['status'] }>(
        `/projects/${projectId}/status`,
        { status }
      )
      return res.data
    } catch {
      const project = DEMO_PROJECTS.find((p) => p.id === projectId)
      if (!project) throw new Error(`Project ${projectId} not found`)
      return { ...project, status }
    }
  },
}
