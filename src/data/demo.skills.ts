/**
 * Demo Skills & Skill Gap Data
 * ----------------------------
 * Matches the Skill and SkillGap interfaces from @/types/skill.types.
 * Used by: SkillsPage, SkillGapPage, DashboardPage, CareerReadinessPage, ProfilePage.
 *
 * TO SWAP WITH REAL DATA:
 *   - skillsApi.getSkills()    → returns Skill[]
 *   - skillsApi.getSkillGaps() → returns SkillGap[]
 */

import type { Skill, SkillGap } from '@/types/skill.types'

/**
 * Verified skill portfolio for the demo student (Alex Patel).
 * Covers the core Frontend Developer skill taxonomy.
 */
export const DEMO_SKILLS: Skill[] = [
  {
    id: 'skill_js',
    name: 'JavaScript',
    category: 'Frontend Development',
    currentLevel: 3,
    targetLevel: 5,
    progress: 64,
    lastAssessed: '2024-09-10T00:00:00.000Z',
  },
  {
    id: 'skill_html_css',
    name: 'HTML & CSS',
    category: 'Frontend Development',
    currentLevel: 4,
    targetLevel: 5,
    progress: 80,
    lastAssessed: '2024-09-10T00:00:00.000Z',
  },
  {
    id: 'skill_react',
    name: 'React',
    category: 'Frontend Development',
    currentLevel: 2,
    targetLevel: 5,
    progress: 42,
    lastAssessed: '2024-09-08T00:00:00.000Z',
  },
  {
    id: 'skill_git',
    name: 'Git & Version Control',
    category: 'Tools & Version Control',
    currentLevel: 3,
    targetLevel: 4,
    progress: 70,
    lastAssessed: '2024-09-05T00:00:00.000Z',
  },
  {
    id: 'skill_algo',
    name: 'Algorithms & Data Structures',
    category: 'Computer Science Core',
    currentLevel: 2,
    targetLevel: 4,
    progress: 38,
    lastAssessed: '2024-09-01T00:00:00.000Z',
  },
  {
    id: 'skill_sql',
    name: 'SQL & Databases',
    category: 'Database Systems',
    currentLevel: 2,
    targetLevel: 3,
    progress: 55,
    lastAssessed: '2024-08-28T00:00:00.000Z',
  },
  {
    id: 'skill_ts',
    name: 'TypeScript',
    category: 'Frontend Development',
    currentLevel: 2,
    targetLevel: 4,
    progress: 35,
    lastAssessed: '2024-09-12T00:00:00.000Z',
  },
]

/**
 * Skill gap analysis results for the demo student.
 * Positive `gap` = needs improvement. Negative/zero `gap` = benchmark met.
 */
export const DEMO_SKILL_GAPS: SkillGap[] = [
  {
    skillId: 'skill_react',
    skillName: 'React',
    category: 'Frontend Development',
    currentLevel: 2,
    targetLevel: 5,
    gap: 3,
    priority: 'HIGH',
    recommendedAction:
      'Complete the official React docs tutorial and build 2 mini projects using hooks and component composition patterns.',
  },
  {
    skillId: 'skill_algo',
    skillName: 'Algorithms & Data Structures',
    category: 'Computer Science Core',
    currentLevel: 2,
    targetLevel: 4,
    gap: 2,
    priority: 'HIGH',
    recommendedAction:
      'Practice array manipulation, recursion, and sorting algorithms through LeetCode Easy problems daily.',
  },
  {
    skillId: 'skill_ts',
    skillName: 'TypeScript',
    category: 'Frontend Development',
    currentLevel: 2,
    targetLevel: 4,
    gap: 2,
    priority: 'MEDIUM',
    recommendedAction:
      'Study TypeScript handbook sections on generics and utility types, then apply them in your React projects.',
  },
  {
    skillId: 'skill_js',
    skillName: 'JavaScript',
    category: 'Frontend Development',
    currentLevel: 3,
    targetLevel: 5,
    gap: 2,
    priority: 'MEDIUM',
    recommendedAction:
      'Deep-dive into closures, event loop, Promises, and async/await with the JavaScript.info guide.',
  },
  {
    skillId: 'skill_git',
    skillName: 'Git & Version Control',
    category: 'Tools & Version Control',
    currentLevel: 3,
    targetLevel: 4,
    gap: 1,
    priority: 'LOW',
    recommendedAction:
      'Learn branching strategies, rebasing, and PR workflows. Contribute to an open-source project.',
  },
  {
    skillId: 'skill_sql',
    skillName: 'SQL & Databases',
    category: 'Database Systems',
    currentLevel: 2,
    targetLevel: 3,
    gap: 1,
    priority: 'LOW',
    recommendedAction:
      'Practice JOIN queries and aggregation on SQLZoo or Mode Analytics SQL Tutorial.',
  },
  {
    skillId: 'skill_html_css',
    skillName: 'HTML & CSS',
    category: 'Frontend Development',
    currentLevel: 4,
    targetLevel: 5,
    gap: 1,
    priority: 'LOW',
    recommendedAction:
      'Focus on CSS Grid mastery and accessibility best practices to reach the advanced benchmark.',
  },
]
