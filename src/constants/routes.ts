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
} as const

export type AppRoute = typeof ROUTES[keyof typeof ROUTES]
