/**
 * Demo Student Identity
 * ---------------------
 * Single source of truth for the demo user persona used across all pages.
 * When the backend is connected, AuthContext / API responses will replace these values.
 *
 * TO SWAP WITH REAL DATA: Replace this with the authenticated user's profile from the API.
 */

import type { UserProfile } from '@/types/user.types'

/**
 * Default career goal used as a fallback string throughout the app.
 * Replace all inline `'Frontend Developer'` strings with this constant.
 */
export const DEFAULT_CAREER_GOAL = 'Frontend Developer'

/**
 * Default demo student profile — matches the UserProfile interface.
 * Used wherever `useAuth().user` is null (unauthenticated / demo mode).
 */
export const DEMO_STUDENT: UserProfile = {
  id: 'student_demo_001',
  name: 'Alex Patel',
  email: 'alex.patel@skillpath.edu',
  role: 'student',
  careerGoal: DEFAULT_CAREER_GOAL,
  education: {
    institution: 'Indian Institute of Information Technology',
    degree: 'BCA — Semester 3',
    graduationYear: 2026,
  },
  bio: 'Aspiring frontend developer passionate about building great user experiences. Currently mastering JavaScript, React, and modern web technologies.',
  createdAt: '2024-07-15T09:00:00.000Z',
}
