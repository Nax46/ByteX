/**
 * Career Service Layer
 * --------------------
 * Admin CRUD operations for careers, skills requirements, and market demand.
 */

import { AdminCareerRecord, DEMO_ADMIN_CAREERS } from '@/data/admin/demo.admin.careers'
import { safeStorage } from '@/utils/storage'

const STORAGE_KEY = 'skillpath_demo_careers'

const getStoredCareers = (): AdminCareerRecord[] => {
  const stored = safeStorage.getItem<AdminCareerRecord[]>(STORAGE_KEY)
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored
  }
  return DEMO_ADMIN_CAREERS
}

const saveCareers = (careers: AdminCareerRecord[]): void => {
  safeStorage.setItem(STORAGE_KEY, careers)
}

export const careerService = {
  getCareers: async (): Promise<AdminCareerRecord[]> => {
    // API Contract placeholder: GET /api/admin/careers
    return getStoredCareers()
  },

  getCareerById: async (id: string): Promise<AdminCareerRecord | null> => {
    // API Contract placeholder: GET /api/admin/careers/:id
    const list = getStoredCareers()
    return list.find((c) => c.id === id) || null
  },

  createCareer: async (data: Omit<AdminCareerRecord, 'id'>): Promise<AdminCareerRecord> => {
    // API Contract placeholder: POST /api/admin/careers
    const list = getStoredCareers()
    const newRecord: AdminCareerRecord = {
      ...data,
      id: `car-${Date.now()}`,
    }
    const updated = [newRecord, ...list]
    saveCareers(updated)
    return newRecord
  },

  updateCareer: async (id: string, updates: Partial<AdminCareerRecord>): Promise<AdminCareerRecord> => {
    // API Contract placeholder: PUT /api/admin/careers/:id
    const list = getStoredCareers()
    const index = list.findIndex((c) => c.id === id)
    if (index === -1) {
      throw new Error(`Career with id ${id} not found`)
    }
    const updatedRecord = { ...list[index], ...updates }
    list[index] = updatedRecord
    saveCareers([...list])
    return updatedRecord
  },

  deleteCareer: async (id: string): Promise<void> => {
    // API Contract placeholder: DELETE /api/admin/careers/:id
    const list = getStoredCareers()
    saveCareers(list.filter((c) => c.id !== id))
  },

  resetCareers: async (): Promise<void> => {
    safeStorage.setItem(STORAGE_KEY, DEMO_ADMIN_CAREERS)
  },
}
