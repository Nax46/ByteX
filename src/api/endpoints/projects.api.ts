import { apiClient } from '@/api/client'
import {
  RecommendedProject,
  IBackendProject,
  IBackendProjectRecommendation,
} from '@/types/project.types'

/**
 * Storage key for persisted local project status states.
 */
const PROJECT_STATUSES_KEY = 'bytex_project_statuses'

export const getProjectStatuses = (): Record<string, RecommendedProject['status']> => {
  try {
    const raw = localStorage.getItem(PROJECT_STATUSES_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // Ignore storage errors in non-browser environments
  }
  return {}
}

export const setProjectStatus = (
  projectId: string,
  status: RecommendedProject['status']
): void => {
  try {
    const statuses = getProjectStatuses()
    statuses[projectId] = status
    localStorage.setItem(PROJECT_STATUSES_KEY, JSON.stringify(statuses))
  } catch {
    // Ignore storage errors in non-browser environments
  }
}

/**
 * Maps a backend project or recommendation to the frontend RecommendedProject model.
 */
export const mapBackendProject = (
  item: IBackendProjectRecommendation | IBackendProject,
  statusMap?: Record<string, RecommendedProject['status']>
): RecommendedProject => {
  const isRec = 'project' in item && item.project != null
  const proj: IBackendProject = isRec
    ? (item as IBackendProjectRecommendation).project
    : (item as IBackendProject)
  const rec = isRec ? (item as IBackendProjectRecommendation) : undefined

  const id = proj._id || proj.slug || proj.title
  const status = (statusMap && statusMap[id]) || 'NOT_STARTED'

  // Extract skills reinforced from recommendation display names or fallback to technologies
  const skillsReinforced =
    rec?.reinforcedSkillNames && rec.reinforcedSkillNames.length > 0
      ? rec.reinforcedSkillNames
      : Array.isArray(proj.technologies)
      ? proj.technologies
      : []

  return {
    id,
    title: proj.title || 'Untitled Project',
    description: proj.description || '',
    difficulty: proj.difficulty || 'INTERMEDIATE',
    technologies: proj.technologies || [],
    skillsReinforced,
    estimatedHours: typeof proj.estimatedHours === 'number' ? proj.estimatedHours : 5,
    githubStarterUrl: proj.githubStarterUrl,
    status,
    primarySkillName: rec?.primarySkillName,
    relevanceScore: rec?.relevanceScore,
    recommendationReason: rec?.recommendationReason,
    priorityScore: rec?.priorityScore,
    targetSkillGap: rec?.targetSkillGap,
    architectureOverview: proj.architectureOverview,
    learningObjectives: proj.learningObjectives,
  }
}

export const projectsApi = {
  /**
   * Fetches personalized practical project recommendations for the authenticated student.
   * Endpoint: GET /api/v1/intelligence/projects/recommendations (or /recommended)
   */
  getRecommendedProjects: async (): Promise<RecommendedProject[]> => {
    const statusMap = getProjectStatuses()
    try {
      const res = await apiClient.get<{ recommendations?: IBackendProjectRecommendation[] }>(
        '/v1/intelligence/projects/recommendations'
      )
      const rawList = res.data?.recommendations || []
      if (rawList.length > 0) {
        return rawList.map((rec) => mapBackendProject(rec, statusMap))
      }
    } catch {
      // If recommendations endpoint fails, try /v1/intelligence/projects/recommended
      try {
        const res = await apiClient.get<{ recommendations?: IBackendProjectRecommendation[] }>(
          '/v1/intelligence/projects/recommended'
        )
        const rawList = res.data?.recommendations || []
        if (rawList.length > 0) {
          return rawList.map((rec) => mapBackendProject(rec, statusMap))
        }
      } catch {
        // Fall back to catalog query below
      }
    }

    // If no recommendations are available, query catalog projects
    const catalogRes = await apiClient.get<{ projects?: IBackendProject[] }>('/projects')
    const catalogList = catalogRes.data?.projects || []
    return catalogList.map((proj) => mapBackendProject(proj, statusMap))
  },

  /**
   * Fetches catalog projects with optional filtering.
   */
  getProjects: async (params?: { skillId?: string; careerId?: string; difficulty?: string }): Promise<RecommendedProject[]> => {
    const statusMap = getProjectStatuses()
    const query = new URLSearchParams()
    if (params?.skillId) query.append('skillId', params.skillId)
    if (params?.careerId) query.append('careerId', params.careerId)
    if (params?.difficulty) query.append('difficulty', params.difficulty)

    const url = query.toString() ? `/projects?${query.toString()}` : '/projects'
    const res = await apiClient.get<{ projects?: IBackendProject[] }>(url)
    const list = res.data?.projects || []
    return list.map((proj) => mapBackendProject(proj, statusMap))
  },

  /**
   * Updates project progress status for the student.
   */
  updateProjectStatus: async (
    projectId: string,
    status: RecommendedProject['status']
  ): Promise<void> => {
    setProjectStatus(projectId, status)
    try {
      await apiClient.put(`/projects/${projectId}/status`, { status })
    } catch {
      // Backend does not maintain per-user project status table; persisted locally
    }
  },
}
