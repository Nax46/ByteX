import { apiClient } from '@/api/client'
import { RecommendedProject, ProjectRecommendation } from '@/types/project.types'
import { DEMO_PROJECTS } from '@/data/demo.projects'

/**
 * Projects API Module
 * Wire hands-on portfolio projects and intelligence recommendations here.
 */
export const projectsApi = {
  getRecommendedProjects: async (): Promise<RecommendedProject[]> => {
    try {
      const res = await apiClient.get<
        RecommendedProject[] | { projects?: RecommendedProject[]; recommendations?: ProjectRecommendation[] }
      >('/projects/recommended')
      if (Array.isArray(res.data)) {
        return res.data
      }
      const dataObj = res.data as unknown as {
        projects?: RecommendedProject[]
        recommendations?: ProjectRecommendation[]
      }
      if (dataObj && Array.isArray(dataObj.projects)) {
        return dataObj.projects
      }
      if (dataObj && Array.isArray(dataObj.recommendations)) {
        return dataObj.recommendations.map((r) => r.project)
      }
      return DEMO_PROJECTS
    } catch {
      return DEMO_PROJECTS
    }
  },

  getProjectRecommendations: async (prioritySkillName?: string): Promise<ProjectRecommendation[]> => {
    try {
      const res = await apiClient.get<{ recommendations: ProjectRecommendation[] }>('/projects/recommended')
      if (res.data && Array.isArray(res.data.recommendations)) {
        return res.data.recommendations
      }
    } catch {
      // Graceful fallback
    }

    const filtered = prioritySkillName
      ? DEMO_PROJECTS.filter(
          (p) =>
            p.skillsReinforced.some((s) => s.toLowerCase().includes(prioritySkillName.toLowerCase())) ||
            p.title.toLowerCase().includes(prioritySkillName.toLowerCase())
        )
      : DEMO_PROJECTS

    const source = filtered.length > 0 ? filtered : DEMO_PROJECTS

    return source.map((proj, i) => ({
      project: proj,
      relevanceScore: 96 - i * 4,
      recommendationReason:
        prioritySkillName &&
        proj.skillsReinforced.some((s) => s.toLowerCase().includes(prioritySkillName.toLowerCase()))
          ? `Directly closes your high-priority skill gap in ${prioritySkillName}`
          : `Reinforces practical application for ${proj.skillsReinforced[0] || 'Web Development'}`,
      primarySkillName: prioritySkillName || proj.skillsReinforced[0] || 'Core Engineering',
      targetSkillGap: Math.max(10, 45 - i * 6),
      priorityScore: 92 - i * 5,
      reinforcedSkillNames: proj.skillsReinforced,
    }))
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

