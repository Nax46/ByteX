export const ROUTES = {
  // Public Routes
  HOME: '/',
  FEATURES: '/features',
  HOW_IT_WORKS: '/how-it-works',
  LOGIN: '/login',
  REGISTER: '/register',

  // Student / Authenticated Routes
  DASHBOARD: '/dashboard',
  ONBOARDING: '/onboarding',
  PROFILE: '/profile',
  SKILLS: '/skills',
  ASSESSMENT: '/assessment',
  ASSESSMENT_RESULTS: '/assessment/results',
  SKILL_GAP: '/skill-gap',
  ROADMAP: '/roadmap',
  RESOURCES: '/resources',
  PROJECTS: '/projects',
  PROGRESS: '/progress',
  CAREER_READINESS: '/career-readiness',
  CAREERS: '/careers',
  MENTOR: '/mentor',
  SETTINGS: '/settings',

  // Admin Routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_STUDENT_DETAIL: '/admin/students/:id',
  ADMIN_ASSESSMENTS: '/admin/assessments',
  ADMIN_SKILLS: '/admin/skills',
  ADMIN_RESOURCES: '/admin/resources',
  ADMIN_LEARNING_PATHS: '/admin/learning-paths',
  ADMIN_CAREERS: '/admin/careers',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
} as const

export type AppRoute = typeof ROUTES[keyof typeof ROUTES]
