import { apiClient } from '@/api/client'
import {
  LearningResource,
  IBackendResource,
  IBackendResourceRecommendation,
  ResourceLevel,
} from '@/types/resource.types'

/**
 * Storage key for persisted local completed resource IDs.
 */
const COMPLETED_RESOURCES_KEY = 'bytex_completed_resources'

export const getCompletedResourceIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(COMPLETED_RESOURCES_KEY)
    if (raw) {
      return new Set(JSON.parse(raw))
    }
  } catch {
    // Ignore storage errors in non-browser environments
  }
  return new Set()
}

export const setCompletedResourceId = (id: string, isCompleted: boolean): void => {
  try {
    const ids = getCompletedResourceIds()
    if (isCompleted) {
      ids.add(id)
    } else {
      ids.delete(id)
    }
    localStorage.setItem(COMPLETED_RESOURCES_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // Ignore storage errors in non-browser environments
  }
}

/**
 * Maps a backend resource or recommendation to the frontend LearningResource model.
 */
export const mapBackendResource = (
  item: IBackendResourceRecommendation | IBackendResource,
  completedIds?: Set<string>
): LearningResource => {
  const isRec = 'resource' in item && item.resource != null
  const res: IBackendResource = isRec
    ? (item as IBackendResourceRecommendation).resource
    : (item as IBackendResource)
  const rec = isRec ? (item as IBackendResourceRecommendation) : undefined

  let level: ResourceLevel | undefined
  if (res.difficulty) {
    const diffUpper = res.difficulty.toUpperCase()
    if (diffUpper === 'BEGINNER') level = 'Beginner'
    else if (diffUpper === 'INTERMEDIATE') level = 'Intermediate'
    else if (diffUpper === 'ADVANCED') level = 'Advanced'
  }

  const id = res._id || res.slug || res.title
  const isCompleted = completedIds ? completedIds.has(id) : false

  return {
    id,
    title: res.title || 'Untitled Resource',
    description: res.description || '',
    url: res.url || '#',
    type: res.type || 'ARTICLE',
    provider: res.provider || 'Self-Paced',
    skillTag: rec?.skillName || res.skillTag || 'Curriculum',
    estimatedDuration: res.estimatedDuration || 'Self-paced',
    level,
    isCompleted,
    rating: typeof res.rating === 'number' ? res.rating : 4.5,
    relevanceScore: rec?.relevanceScore,
    recommendationReason: rec?.recommendationReason,
    priorityScore: rec?.priorityScore,
    targetSkillGap: rec?.targetSkillGap,
  }
}

export const resourcesApi = {
  /**
   * Fetches personalized learning resource recommendations for the authenticated student.
   * Endpoint: GET /api/v1/intelligence/resources/recommendations (or /recommended)
   */
  getRecommendedResources: async (): Promise<LearningResource[]> => {
    const completedIds = getCompletedResourceIds()
    try {
      const res = await apiClient.get<{ recommendations?: IBackendResourceRecommendation[] }>(
        '/v1/intelligence/resources/recommendations'
      )
      const rawList = res.data?.recommendations || []
      if (rawList.length > 0) {
        return rawList.map((rec) => mapBackendResource(rec, completedIds))
      }
    } catch {
      // If recommendations endpoint fails, try /v1/intelligence/resources/recommended
      try {
        const res = await apiClient.get<{ recommendations?: IBackendResourceRecommendation[] }>(
          '/v1/intelligence/resources/recommended'
        )
        const rawList = res.data?.recommendations || []
        if (rawList.length > 0) {
          return rawList.map((rec) => mapBackendResource(rec, completedIds))
        }
      } catch {
        // Continue to catalog query fallback below
      }
    }

    // If no recommendations are available, query catalog resources
    const catalogRes = await apiClient.get<{ resources?: IBackendResource[] }>('/resources')
    const catalogList = catalogRes.data?.resources || []
    return catalogList.map((res) => mapBackendResource(res, completedIds))
  },

  /**
   * Fetches resources with optional skill filter.
   */
  getResources: async (skillTag?: string): Promise<LearningResource[]> => {
    const completedIds = getCompletedResourceIds()
    if (skillTag && skillTag !== 'ALL') {
      const res = await apiClient.get<{ resources?: IBackendResource[] }>(
        `/resources?skillTag=${encodeURIComponent(skillTag)}`
      )
      const list = res.data?.resources || []
      return list.map((r) => mapBackendResource(r, completedIds))
    }

    return resourcesApi.getRecommendedResources()
  },

  /**
   * Updates resource completion status for the student.
   */
  markCompleted: async (resourceId: string, isCompleted: boolean): Promise<void> => {
    setCompletedResourceId(resourceId, isCompleted)
    try {
      await apiClient.put(`/resources/${resourceId}/completion`, { isCompleted })
    } catch {
      // Backend does not maintain per-user resource completion table; persisted locally
    }
  },
}
