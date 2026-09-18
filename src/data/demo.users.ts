/**
 * Demo Users Data
 * ---------------
 * Centralized credentials and user identities for Hackathon Demo Access.
 * For production, this will be replaced by backend database records.
 */

import { UserProfile } from '@/types/user.types'
import { DEMO_STUDENT } from './demo.student'

export interface DemoUserAccount {
  email: string
  password: string
  profile: UserProfile
}

export const DEMO_ADMIN: UserProfile = {
  id: 'admin_demo_001',
  name: 'SkillPath Admin',
  email: 'admin@skillpath.demo',
  role: 'admin',
  careerGoal: 'System Administration',
  bio: 'Platform Administrator overseeing curriculum, assessments, and learner progression metrics.',
  createdAt: '2024-01-01T00:00:00.000Z',
}

export const DEMO_STUDENT_USER: UserProfile = {
  ...DEMO_STUDENT,
  email: 'student@skillpath.demo',
}

export const DEMO_USERS: DemoUserAccount[] = [
  {
    email: 'student@skillpath.demo',
    password: 'Student@123',
    profile: DEMO_STUDENT_USER,
  },
  {
    email: 'admin@skillpath.demo',
    password: 'Admin@123',
    profile: DEMO_ADMIN,
  },
]
