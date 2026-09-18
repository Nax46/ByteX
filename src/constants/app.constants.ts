export const APP_CONFIG = {
  NAME: 'SkillPath',
  TAGLINE: 'Know where you are. Build where you\'re going.',
  SUPPORTING_STATEMENT:
    'Understand your skills, discover your gaps, and follow a learning path designed around your goals.',
  DESCRIPTION:
    'A smart education and skill development platform helping students identify skill gaps, master practical competencies, and follow personalized roadmaps.',
  VERSION: '1.0.0',
  DEFAULT_TOKEN_KEY: 'skillpath_auth_token',
  DEFAULT_USER_KEY: 'skillpath_auth_user',
} as const

export const SKILL_CATEGORIES = [
  'Frontend Development',
  'Programming Fundamentals',
  'Database Systems',
  'Tools & Version Control',
  'Problem Solving',
  'Computer Science Core',
] as const
