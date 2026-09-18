import { apiClient } from '../client'
import { LearningResource } from '@/types/resource.types'

/**
 * Resources API Module
 * NOTE FOR BACKEND TEAM:
 * Wire recommended learning resources and documentation endpoints here.
 */
export const resourcesApi = {
  getResources: async (skillTag?: string): Promise<LearningResource[]> => {
    const url = skillTag ? `/resources?tag=${skillTag}` : '/resources'
    const res = await apiClient.get<LearningResource[]>(url)
    return res.data
  },

  markCompleted: async (resourceId: string, isCompleted: boolean): Promise<LearningResource> => {
    const res = await apiClient.put<LearningResource, { isCompleted: boolean }>(
      `/resources/${resourceId}/completion`,
      { isCompleted }
    )
    return res.data
  },
}
