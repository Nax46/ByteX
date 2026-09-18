/**
 * Student Service Layer
 * ---------------------
 * Encapsulates student data queries and operations.
 * Allows components to remain decoupled from underlying demo storage vs live backend API.
 */

import { AdminStudentRecord, DEMO_ADMIN_STUDENTS } from '@/data/admin/demo.admin.students'
import { safeStorage } from '@/utils/storage'

const STORAGE_KEY = 'skillpath_demo_students'

const getStoredStudents = (): AdminStudentRecord[] => {
  const stored = safeStorage.getItem<AdminStudentRecord[]>(STORAGE_KEY)
  if (stored && Array.isArray(stored) && stored.length > 0) {
    return stored
  }
  return DEMO_ADMIN_STUDENTS
}

const saveStudents = (students: AdminStudentRecord[]): void => {
  safeStorage.setItem(STORAGE_KEY, students)
}

export const studentService = {
  getStudents: async (): Promise<AdminStudentRecord[]> => {
    // API Contract placeholder: GET /api/admin/students
    return getStoredStudents()
  },

  getStudentById: async (id: string): Promise<AdminStudentRecord | null> => {
    // API Contract placeholder: GET /api/admin/students/:id
    const students = getStoredStudents()
    const found = students.find((s) => s.id === id)
    return found || null
  },

  createStudent: async (data: Omit<AdminStudentRecord, 'id'>): Promise<AdminStudentRecord> => {
    // API Contract placeholder: POST /api/admin/students
    const students = getStoredStudents()
    const newStudent: AdminStudentRecord = {
      ...data,
      id: `student_${Date.now()}`,
    }
    const updated = [newStudent, ...students]
    saveStudents(updated)
    return newStudent
  },

  updateStudent: async (id: string, updates: Partial<AdminStudentRecord>): Promise<AdminStudentRecord> => {
    // API Contract placeholder: PUT /api/admin/students/:id
    const students = getStoredStudents()
    const index = students.findIndex((s) => s.id === id)
    if (index === -1) {
      throw new Error(`Student with id ${id} not found`)
    }
    const updatedStudent = { ...students[index], ...updates }
    students[index] = updatedStudent
    saveStudents([...students])
    return updatedStudent
  },

  deleteStudent: async (id: string): Promise<void> => {
    // API Contract placeholder: DELETE /api/admin/students/:id
    const students = getStoredStudents()
    const filtered = students.filter((s) => s.id !== id)
    saveStudents(filtered)
  },

  resetStudents: async (): Promise<void> => {
    safeStorage.setItem(STORAGE_KEY, DEMO_ADMIN_STUDENTS)
  },
}
