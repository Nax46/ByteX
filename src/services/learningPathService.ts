/**
 * Learning Path Service Layer
 * ---------------------------
 * Admin CRUD operations for career roadmaps and milestones.
 */

import { AdminLearningPathRecord, DEMO_ADMIN_LEARNING_PATHS } from '@/data/admin/demo.admin.learningPaths'
import { safeStorage } from '@/utils/storage'

const STORAGE_KEY = 'skillpath_demo_learning_paths'

const getStoredLearningPaths = (): AdminLearningPathRecord[] => {
  const stored = safeStorage.getItem<AdminLearningPathRecord[]>(STORAGE_KEY)
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored
  }
  return DEMO_ADMIN_LEARNING_PATHS
}

const saveLearningPaths = (paths: AdminLearningPathRecord[]): void => {
  safeStorage.setItem(STORAGE_KEY, paths)
}

export const learningPathService = {
  getLearningPaths: async (): Promise<AdminLearningPathRecord[]> => {
    // API Contract placeholder: GET /api/admin/learning-paths
    return getStoredLearningPaths()
  },

  getLearningPathById: async (id: string): Promise<AdminLearningPathRecord | null> => {
    // API Contract placeholder: GET /api/admin/learning-paths/:id
    const list = getStoredLearningPaths()
    return list.find((p) => p.id === id) || null
  },

  createLearningPath: async (data: Omit<AdminLearningPathRecord, 'id'>): Promise<AdminLearningPathRecord> => {
    // API Contract placeholder: POST /api/admin/learning-paths
    const list = getStoredLearningPaths()
    const newRecord: AdminLearningPathRecord = {
      ...data,
      id: `path-${Date.now()}`,
    }
    const updated = [newRecord, ...list]
    saveLearningPaths(updated)
    return newRecord
  },

  updateLearningPath: async (id: string, updates: Partial<AdminLearningPathRecord>): Promise<AdminLearningPathRecord> => {
    // API Contract placeholder: PUT /api/admin/learning-paths/:id
    const list = getStoredLearningPaths()
    const index = list.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error(`Learning path with id ${id} not found`)
    }
    const updatedRecord = { ...list[index], ...updates }
    list[index] = updatedRecord
    saveLearningPaths([...list])
    return updatedRecord
  },

  deleteLearningPath: async (id: string): Promise<void> => {
    // API Contract placeholder: DELETE /api/admin/learning-paths/:id
    const list = getStoredLearningPaths()
    saveLearningPaths(list.filter((p) => p.id !== id))
  },

  resetLearningPaths: async (): Promise<void> => {
    safeStorage.setItem(STORAGE_KEY, DEMO_ADMIN_LEARNING_PATHS)
  },
}
