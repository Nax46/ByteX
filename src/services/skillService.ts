/**
 * Skill Service Layer
 * -------------------
 * Admin CRUD operations for skills taxonomy.
 */

import { AdminSkillRecord, DEMO_ADMIN_SKILLS } from '@/data/admin/demo.admin.skills'
import { safeStorage } from '@/utils/storage'

const STORAGE_KEY = 'skillpath_demo_skills'

const getStoredSkills = (): AdminSkillRecord[] => {
  const stored = safeStorage.getItem<AdminSkillRecord[]>(STORAGE_KEY)
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored
  }
  return DEMO_ADMIN_SKILLS
}

const saveSkills = (skills: AdminSkillRecord[]): void => {
  safeStorage.setItem(STORAGE_KEY, skills)
}

export const skillService = {
  getSkills: async (): Promise<AdminSkillRecord[]> => {
    // API Contract placeholder: GET /api/admin/skills
    return getStoredSkills()
  },

  getSkillById: async (id: string): Promise<AdminSkillRecord | null> => {
    // API Contract placeholder: GET /api/admin/skills/:id
    const list = getStoredSkills()
    return list.find((s) => s.id === id) || null
  },

  createSkill: async (data: Omit<AdminSkillRecord, 'id'>): Promise<AdminSkillRecord> => {
    // API Contract placeholder: POST /api/admin/skills
    const list = getStoredSkills()
    const newRecord: AdminSkillRecord = {
      ...data,
      id: `skill-${Date.now()}`,
    }
    const updated = [newRecord, ...list]
    saveSkills(updated)
    return newRecord
  },

  updateSkill: async (id: string, updates: Partial<AdminSkillRecord>): Promise<AdminSkillRecord> => {
    // API Contract placeholder: PUT /api/admin/skills/:id
    const list = getStoredSkills()
    const index = list.findIndex((s) => s.id === id)
    if (index === -1) {
      throw new Error(`Skill with id ${id} not found`)
    }
    const updatedRecord = { ...list[index], ...updates }
    list[index] = updatedRecord
    saveSkills([...list])
    return updatedRecord
  },

  deleteSkill: async (id: string): Promise<void> => {
    // API Contract placeholder: DELETE /api/admin/skills/:id
    const list = getStoredSkills()
    saveSkills(list.filter((s) => s.id !== id))
  },

  resetSkills: async (): Promise<void> => {
    safeStorage.setItem(STORAGE_KEY, DEMO_ADMIN_SKILLS)
  },
}
