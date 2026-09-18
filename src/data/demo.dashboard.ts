/**
 * Demo Dashboard Statistics
 * -------------------------
 * Matches the UserStats interface from @/types/user.types.
 * Used by DashboardPage, CareerReadinessPage, SkillGapPage, ProfilePage.
 *
 * TO SWAP WITH REAL DATA: profileApi.getUserStats() will return this shape from the backend.
 */

import type { UserStats } from '@/types/user.types'

export const DEMO_USER_STATS: UserStats = {
  overallScore: 68,
  careerReadiness: 72,
  completedAssessments: 3,
  skillsTracked: 7,
  completedMilestones: 2,
  learningStreakDays: 12,
}
