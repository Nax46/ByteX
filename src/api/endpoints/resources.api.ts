import { apiClient } from '@/api/client'
import { LearningResource, ResourceRecommendation } from '@/types/resource.types'
import { DEMO_RESOURCES } from '@/data/demo.resources'

/**
 * Resources API Module
 * Wire recommended learning resources and documentation endpoints here.
 */
export const resourcesApi = {
  getResources: async (skillTag?: string): Promise<LearningResource[]> => {
    try {
      const url = skillTag ? `/resources?tag=${skillTag}` : '/resources'
      const res = await apiClient.get<LearningResource[] | { resources: LearningResource[] }>(url)
      if (Array.isArray(res.data)) {
        return res.data
      }
      const dataObj = res.data as unknown as { resources?: LearningResource[] }
      if (dataObj && Array.isArray(dataObj.resources)) {
        return dataObj.resources
      }
      return DEMO_RESOURCES
    } catch {
      if (skillTag) {
        return DEMO_RESOURCES.filter((r) => r.skillTag.toLowerCase() === skillTag.toLowerCase())
      }
      return DEMO_RESOURCES
    }
  },

  getRecommendedResources: async (prioritySkillName?: string): Promise<ResourceRecommendation[]> => {
    try {
      const res = await apiClient.get<{ recommendations: ResourceRecommendation[] }>('/resources/recommended')
      if (res.data && Array.isArray(res.data.recommendations)) {
        return res.data.recommendations
      }
    } catch {
      // Graceful fallback handling
    }

    const filtered = prioritySkillName
      ? DEMO_RESOURCES.filter(
          (r) =>
            r.skillTag.toLowerCase().includes(prioritySkillName.toLowerCase()) ||
            prioritySkillName.toLowerCase().includes(r.skillTag.toLowerCase())
        )
      : DEMO_RESOURCES

    const source = filtered.length > 0 ? filtered : DEMO_RESOURCES
    const top4 = source.slice(0, 4)

    return top4.map((res, i) => ({
      resource: res,
      relevanceScore: 95 - i * 5,
      recommendationReason:
        prioritySkillName && res.skillTag.toLowerCase().includes(prioritySkillName.toLowerCase())
          ? `Addresses high-priority skill gap in ${res.skillTag}`
          : `Recommended core resource for ${res.skillTag}`,
      skillName: res.skillTag,
      targetSkillGap: Math.max(10, 40 - i * 5),
      priorityScore: 90 - i * 5,
    }))
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

