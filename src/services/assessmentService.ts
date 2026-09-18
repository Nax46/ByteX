/**
 * Assessment Service Layer
 * ------------------------
 * Admin CRUD operations for benchmark assessments.
 */

import { AdminAssessmentRecord, DEMO_ADMIN_ASSESSMENTS } from '@/data/admin/demo.admin.assessments'
import { safeStorage } from '@/utils/storage'

const STORAGE_KEY = 'skillpath_demo_assessments'

const getStoredAssessments = (): AdminAssessmentRecord[] => {
  const stored = safeStorage.getItem<AdminAssessmentRecord[]>(STORAGE_KEY)
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored
  }
  return DEMO_ADMIN_ASSESSMENTS
}

const saveAssessments = (assessments: AdminAssessmentRecord[]): void => {
  safeStorage.setItem(STORAGE_KEY, assessments)
}

export const assessmentService = {
  getAssessments: async (): Promise<AdminAssessmentRecord[]> => {
    // API Contract placeholder: GET /api/admin/assessments
    return getStoredAssessments()
  },

  getAssessmentById: async (id: string): Promise<AdminAssessmentRecord | null> => {
    // API Contract placeholder: GET /api/admin/assessments/:id
    const list = getStoredAssessments()
    return list.find((a) => a.id === id) || null
  },

  createAssessment: async (data: Omit<AdminAssessmentRecord, 'id'>): Promise<AdminAssessmentRecord> => {
    // API Contract placeholder: POST /api/admin/assessments
    const list = getStoredAssessments()
    const newRecord: AdminAssessmentRecord = {
      ...data,
      id: `asm-${Date.now()}`,
    }
    const updated = [newRecord, ...list]
    saveAssessments(updated)
    return newRecord
  },

  updateAssessment: async (id: string, updates: Partial<AdminAssessmentRecord>): Promise<AdminAssessmentRecord> => {
    // API Contract placeholder: PUT /api/admin/assessments/:id
    const list = getStoredAssessments()
    const index = list.findIndex((a) => a.id === id)
    if (index === -1) {
      throw new Error(`Assessment with id ${id} not found`)
    }
    const updatedRecord = { ...list[index], ...updates }
    list[index] = updatedRecord
    saveAssessments([...list])
    return updatedRecord
  },

  duplicateAssessment: async (id: string): Promise<AdminAssessmentRecord> => {
    const list = getStoredAssessments()
    const original = list.find((a) => a.id === id)
    if (!original) {
      throw new Error(`Assessment with id ${id} not found`)
    }
    const duplicated: AdminAssessmentRecord = {
      ...original,
      id: `asm-${Date.now()}`,
      title: `${original.title} (Copy)`,
      attemptsCount: 0,
      status: 'draft',
    }
    saveAssessments([duplicated, ...list])
    return duplicated
  },

  deleteAssessment: async (id: string): Promise<void> => {
    // API Contract placeholder: DELETE /api/admin/assessments/:id
    const list = getStoredAssessments()
    saveAssessments(list.filter((a) => a.id !== id))
  },

  resetAssessments: async (): Promise<void> => {
    safeStorage.setItem(STORAGE_KEY, DEMO_ADMIN_ASSESSMENTS)
  },
}
