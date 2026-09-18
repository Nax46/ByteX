import { apiClient } from '@/api/client'
import { LearningResource } from '@/types/resource.types'
import { DEMO_RESOURCES } from '@/data/demo.resources'

/**
 * Resources API Module
 * NOTE FOR BACKEND TEAM:
 * Wire recommended learning resources and documentation endpoints here.
 *
 * DEMO FALLBACK: Returns 12 curated, real-URL learning resources when the backend
 * is unavailable. Simply remove the catch block when the backend is connected.
 */
export const resourcesApi = {
  getResources: async (skillTag?: string): Promise<LearningResource[]> => {
    try {
      const url = skillTag ? `/resources?tag=${skillTag}` : '/resources'
      const res = await apiClient.get<LearningResource[]>(url)
      return res.data
    } catch {
      if (skillTag) {
        return DEMO_RESOURCES.filter((r) => r.skillTag === skillTag)
      }
      return DEMO_RESOURCES
    }
  },

  markCompleted: async (resourceId: string, isCompleted: boolean): Promise<LearningResource> => {
    try {
      const res = await apiClient.put<LearningResource, { isCompleted: boolean }>(
        `/resources/${resourceId}/completion`,
        { isCompleted }
      )
      return res.data
    } catch {
      // Silently succeed — the page already updates state optimistically
      const resource = DEMO_RESOURCES.find((r) => r.id === resourceId)
      if (!resource) throw new Error(`Resource ${resourceId} not found`)
      return { ...resource, isCompleted }
    }
  },
}
