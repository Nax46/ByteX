/**
 * Mentor System Types
 * -------------------
 * TypeScript interfaces for the complete SkillPath mentor matching system.
 * Structured for future API integration without breaking existing UI contracts.
 */

// ─── Problem Categories ────────────────────────────────────────────────────

export type ProblemCategory =
  | 'frontend_development'
  | 'backend_development'
  | 'project_development'
  | 'career_planning'
  | 'interview_placement'
  | 'resume_portfolio'
  | 'data_ai'
  | 'programming_fundamentals'
  | 'learning_strategy'
  | 'full_stack'

export const PROBLEM_CATEGORY_LABELS: Record<ProblemCategory, string> = {
  frontend_development: 'Frontend Development',
  backend_development: 'Backend Development',
  project_development: 'Project & Practical Skills',
  career_planning: 'Career Planning',
  interview_placement: 'Interview & Placement',
  resume_portfolio: 'Resume & Portfolio',
  data_ai: 'Data Science & AI',
  programming_fundamentals: 'Programming Fundamentals',
  learning_strategy: 'Learning Strategy',
  full_stack: 'Full Stack Development',
}

// ─── Goal Types ────────────────────────────────────────────────────────────

export type LearningGoal =
  | 'job_ready'
  | 'switch_career'
  | 'interview_prep'
  | 'build_projects'
  | 'freelancing'
  | 'academic'
  | 'upskill'
  | 'other'

export const GOAL_LABELS: Record<LearningGoal, string> = {
  job_ready: 'Become job-ready',
  switch_career: 'Switch career / field',
  interview_prep: 'Crack interviews & placements',
  build_projects: 'Build real-world projects',
  freelancing: 'Start freelancing',
  academic: 'Academic support',
  upskill: 'Upskill in my current role',
  other: 'Other / Not sure yet',
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

// ─── Skill Areas ───────────────────────────────────────────────────────────

export const SKILL_AREAS = [
  'JavaScript',
  'React',
  'TypeScript',
  'Python',
  'Node.js',
  'HTML & CSS',
  'Git & GitHub',
  'Data Structures',
  'System Design',
  'SQL & Databases',
  'Machine Learning',
  'Data Science',
  'REST APIs',
  'Docker',
  'Interview Skills',
  'Resume Building',
  'Portfolio',
  'Career Strategy',
] as const

export type SkillArea = (typeof SKILL_AREAS)[number]

// ─── Mentor Profile ────────────────────────────────────────────────────────

export interface Mentor {
  id: string
  name: string
  initials: string                // For avatar fallback
  headline: string
  bio: string
  expertise: string[]             // Primary expertise areas (category labels)
  skills: string[]                // Specific skills (technology/domain)
  careerSpecialties: string[]     // Career-level specialties
  experienceYears: number
  rating: number                  // 1–5
  reviewCount: number
  studentsMentored: number
  languages: string[]
  availability: 'weekdays' | 'weekends' | 'flexible' | 'evenings'
  sessionDuration: 30 | 45 | 60  // minutes
  priceMonthly: number            // INR
  demoAvailable: boolean
  responseTime: string            // e.g. "within 2 hours"
  mentoringStyle: string          // e.g. "Structured + Project-based"
  categories: ProblemCategory[]   // Which problem categories this mentor fits
  goals: LearningGoal[]           // Which goals this mentor helps with
  levels: ExperienceLevel[]       // Which experience levels this mentor handles
  verified: boolean
  // Demo-specific fields
  demoApproach: string[]          // 5 steps mentor takes in demo
  sampleFeedback: string          // Example feedback the mentor gives
  weeklyPlan: { week: number; focus: string; activities: string[] }[]
  helpsWith: string[]             // Checklist items on profile
}

// ─── Intake Form ───────────────────────────────────────────────────────────

export interface MentorIntake {
  problemText: string
  goal: LearningGoal
  level: ExperienceLevel
  skillAreas: string[]
}

// ─── Classification Result ─────────────────────────────────────────────────

export interface ClassificationResult {
  primaryCategory: ProblemCategory
  secondaryCategories: ProblemCategory[]
  detectedSkills: string[]
  detectedGoals: LearningGoal[]
  level: ExperienceLevel
  summary: string               // Human-readable 1-line summary
}

// ─── Mentor Match ──────────────────────────────────────────────────────────

export interface MentorMatch {
  mentor: Mentor
  score: number                 // 0–100 internal score
  matchReason: string           // Human-readable reason shown to student
  matchHighlights: string[]     // 2–3 bullet points
}

// ─── Journey State ─────────────────────────────────────────────────────────

export interface MentorJourney {
  mentorId: string
  mentorName: string
  goal: LearningGoal
  level: ExperienceLevel
  intake: MentorIntake
  startDate: string             // ISO date string
  status: 'active' | 'paused' | 'completed'
  progressPercent: number
  currentFocus: string
  nextTask: string
  planWeeks: { week: number; focus: string; completed: boolean }[]
}
