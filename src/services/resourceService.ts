/**
 * Resource Service Layer
 * ----------------------
 * Admin CRUD operations for learning resources.
 */

import { AdminResourceRecord, DEMO_ADMIN_RESOURCES } from '@/data/admin/demo.admin.resources'
import { safeStorage } from '@/utils/storage'

const STORAGE_KEY = 'skillpath_demo_resources'

const getStoredResources = (): AdminResourceRecord[] => {
  const stored = safeStorage.getItem<AdminResourceRecord[]>(STORAGE_KEY)
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored
  }
  return DEMO_ADMIN_RESOURCES
}

const saveResources = (resources: AdminResourceRecord[]): void => {
  safeStorage.setItem(STORAGE_KEY, resources)
}

export const resourceService = {
  getResources: async (): Promise<AdminResourceRecord[]> => {
    // API Contract placeholder: GET /api/admin/resources
    return getStoredResources()
  },

  getResourceById: async (id: string): Promise<AdminResourceRecord | null> => {
    // API Contract placeholder: GET /api/admin/resources/:id
    const list = getStoredResources()
    return list.find((r) => r.id === id) || null
  },

  createResource: async (data: Omit<AdminResourceRecord, 'id'>): Promise<AdminResourceRecord> => {
    // API Contract placeholder: POST /api/admin/resources
    const list = getStoredResources()
    const newRecord: AdminResourceRecord = {
      ...data,
      id: `res-${Date.now()}`,
    }
    const updated = [newRecord, ...list]
    saveResources(updated)
    return newRecord
  },

  updateResource: async (id: string, updates: Partial<AdminResourceRecord>): Promise<AdminResourceRecord> => {
    // API Contract placeholder: PUT /api/admin/resources/:id
    const list = getStoredResources()
    const index = list.findIndex((r) => r.id === id)
    if (index === -1) {
      throw new Error(`Resource with id ${id} not found`)
    }
    const updatedRecord = { ...list[index], ...updates }
    list[index] = updatedRecord
    saveResources([...list])
    return updatedRecord
  },

  deleteResource: async (id: string): Promise<void> => {
    // API Contract placeholder: DELETE /api/admin/resources/:id
    const list = getStoredResources()
    saveResources(list.filter((r) => r.id !== id))
  },

  resetResources: async (): Promise<void> => {
    safeStorage.setItem(STORAGE_KEY, DEMO_ADMIN_RESOURCES)
  },
}
