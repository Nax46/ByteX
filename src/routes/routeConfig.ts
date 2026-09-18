import { ROUTES } from '@/constants/routes'

export interface RouteDefinition {
  path: string
  title: string
  isProtected: boolean
  layout: 'public' | 'student' | 'auth' | 'standalone'
}

export const APP_ROUTE_CONFIG: RouteDefinition[] = [
  // Public routes
  { path: ROUTES.HOME, title: 'AI SkillPath — Home', isProtected: false, layout: 'public' },
  { path: ROUTES.FEATURES, title: 'Features — AI SkillPath', isProtected: false, layout: 'public' },
  { path: ROUTES.HOW_IT_WORKS, title: 'How It Works — AI SkillPath', isProtected: false, layout: 'public' },
  { path: ROUTES.LOGIN, title: 'Sign In — AI SkillPath', isProtected: false, layout: 'public' },
  { path: ROUTES.REGISTER, title: 'Create Account — AI SkillPath', isProtected: false, layout: 'public' },

  // Authenticated Student routes
  { path: ROUTES.DASHBOARD, title: 'Dashboard — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.ONBOARDING, title: 'Onboarding — AI SkillPath', isProtected: true, layout: 'standalone' },
  { path: ROUTES.PROFILE, title: 'Student Profile — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.SKILLS, title: 'Skills Inventory — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.ASSESSMENT, title: 'Skills Assessment — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.ASSESSMENT_RESULTS, title: 'Assessment Results — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.SKILL_GAP, title: 'Skill Gap Matrix — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.ROADMAP, title: 'Learning Roadmap — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.RESOURCES, title: 'Learning Resources — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.PROJECTS, title: 'Hands-on Projects — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.PROGRESS, title: 'Learning Progress — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.CAREERS, title: 'Career Explorer — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.CAREER_READINESS, title: 'Career Readiness — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.MENTOR, title: 'AI Mentor — AI SkillPath', isProtected: true, layout: 'student' },
  { path: ROUTES.SETTINGS, title: 'Settings — AI SkillPath', isProtected: true, layout: 'student' },
]
