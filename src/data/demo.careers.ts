/**
 * Demo Career Data
 * ----------------
 * Centralizes all career-related options used across the app:
 *   - Career goal selector options (ProfilePage, OnboardingPage)
 *   - Focus area options (OnboardingPage)
 *   - Study timeline options (OnboardingPage)
 *   - CareerGoal objects (matching CareerGoal interface from skill.types)
 *
 * TO SWAP WITH REAL DATA: Replace CAREER_GOAL_OPTIONS with options fetched from a careers API endpoint.
 */

import type { CareerGoal } from '@/types/skill.types'

/**
 * Career goal option list used in:
 *   - ProfilePage → "Edit Goal" quick selector
 *   - OnboardingPage → Step 4 "Target Role" select
 */
export const CAREER_GOAL_OPTIONS: { value: string; label: string }[] = [
  { value: 'Frontend Developer', label: 'Frontend Developer (Recommended)' },
  { value: 'Full-Stack Engineer', label: 'Full-Stack Engineer' },
  { value: 'UI/UX Designer', label: 'UI/UX Designer & Design Engineer' },
  { value: 'Data Analyst', label: 'Data Analyst' },
  { value: 'AI / ML Engineer', label: 'AI / ML Engineer' },
  { value: 'Cybersecurity Analyst', label: 'Cybersecurity Analyst' },
]

/**
 * Career goal labels used in ProfilePage quick-select buttons.
 * Subset of CAREER_GOAL_OPTIONS values only.
 */
export const CAREER_GOAL_LABELS: string[] = CAREER_GOAL_OPTIONS.map((o) => o.value)

/**
 * Primary focus area options used in OnboardingPage Step 3.
 */
export const FOCUS_AREA_OPTIONS: { value: string; label: string }[] = [
  { value: 'Frontend Development', label: 'Frontend Web Development' },
  { value: 'UI/UX Design', label: 'UI/UX & Product Design' },
  { value: 'Backend Development', label: 'Backend Engineering & APIs' },
  { value: 'Data Analytics', label: 'Data Analysis & SQL' },
  { value: 'AI Engineering', label: 'AI & Machine Learning' },
]

/**
 * Weekly study commitment options used in OnboardingPage Step 5.
 */
export const STUDY_HOURS_OPTIONS: { value: number; label: string }[] = [
  { value: 5, label: '5-10 Hours / week (Steady)' },
  { value: 15, label: '15-20 Hours / week (Active)' },
  { value: 30, label: '30+ Hours / week (Intensive)' },
]

/**
 * Preparation timeline options used in OnboardingPage Step 4.
 */
export const TIMELINE_OPTIONS: { value: number; label: string }[] = [
  { value: 3, label: '3 Months (Accelerated)' },
  { value: 6, label: '6 Months (Recommended)' },
  { value: 12, label: '12 Months (Comprehensive)' },
]

/**
 * Onboarding student status options used in OnboardingPage Step 2.
 */
export const STUDENT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'student', label: 'College / University Student' },
  { value: 'bootcamp', label: 'Bootcamp / Intensive Course' },
  { value: 'self-taught', label: 'Self-Taught Student' },
  { value: 'professional', label: 'Early Career Professional' },
]

/**
 * CareerGoal objects matching the CareerGoal interface from skill.types.
 * Used wherever the app needs to show career path cards with required skills.
 */
export const DEMO_CAREER_GOALS: CareerGoal[] = [
  {
    id: 'career_frontend',
    name: 'Frontend Developer',
    description: 'Build responsive, accessible, and performant user interfaces for web applications.',
    matchPercentage: 72,
    requiredSkills: [
      { skillName: 'HTML & CSS', targetLevel: 4 },
      { skillName: 'JavaScript', targetLevel: 4 },
      { skillName: 'React', targetLevel: 4 },
      { skillName: 'TypeScript', targetLevel: 3 },
      { skillName: 'Git & Version Control', targetLevel: 3 },
    ],
  },
  {
    id: 'career_fullstack',
    name: 'Full-Stack Engineer',
    description: 'Design and develop both frontend interfaces and backend APIs for complete web applications.',
    matchPercentage: 48,
    requiredSkills: [
      { skillName: 'JavaScript', targetLevel: 5 },
      { skillName: 'React', targetLevel: 4 },
      { skillName: 'SQL & Databases', targetLevel: 4 },
      { skillName: 'Git & Version Control', targetLevel: 4 },
      { skillName: 'Algorithms & Data Structures', targetLevel: 3 },
    ],
  },
  {
    id: 'career_data',
    name: 'Data Analyst',
    description: 'Extract insights from data using SQL, Python, and visualization tools to guide business decisions.',
    matchPercentage: 35,
    requiredSkills: [
      { skillName: 'SQL & Databases', targetLevel: 5 },
      { skillName: 'Algorithms & Data Structures', targetLevel: 3 },
    ],
  },
]
