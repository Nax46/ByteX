import { UserProfile, UserStats } from '@/types/user.types'

export const MOCK_USER: UserProfile = {
  id: 'usr_alex_patel',
  name: 'Alex Patel',
  email: 'alex.patel@student.edu',
  role: 'student',
  careerGoal: 'Frontend Developer',
  education: {
    institution: 'College of Computer Applications',
    degree: 'BCA — Semester 3',
    graduationYear: 2026,
  },
  bio: 'Second-year student building practical web engineering skills and modern interface development.',
  createdAt: '2026-01-15T00:00:00.000Z',
}

export const MOCK_USER_STATS: UserStats = {
  overallScore: 64,          // Learning Progress 64%
  careerReadiness: 72,       // Career Readiness 72%
  completedAssessments: 4,
  skillsTracked: 6,
  completedMilestones: 8,    // Skills Improved: 8
  learningStreakDays: 12,    // Learning Streak: 12 days
}
