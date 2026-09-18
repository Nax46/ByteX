import { Skill, SkillGap } from '@/types/skill.types'

export const MOCK_SKILLS: Skill[] = [
  { id: 'sk_html_css', name: 'HTML & CSS', category: 'Frontend Development', currentLevel: 4, targetLevel: 5, progress: 85, lastAssessed: '2026-09-12' },
  { id: 'sk_js', name: 'JavaScript', category: 'Programming Fundamentals', currentLevel: 4, targetLevel: 5, progress: 78, lastAssessed: '2026-09-15' },
  { id: 'sk_ps', name: 'Problem Solving', category: 'Problem Solving', currentLevel: 3, targetLevel: 5, progress: 66, lastAssessed: '2026-09-10' },
  { id: 'sk_sql', name: 'SQL & Relational DBs', category: 'Database Systems', currentLevel: 3, targetLevel: 5, progress: 55, lastAssessed: '2026-09-02' },
  { id: 'sk_react', name: 'React', category: 'Frontend Development', currentLevel: 2, targetLevel: 4, progress: 54, lastAssessed: '2026-09-08' },
  { id: 'sk_git', name: 'Git & GitHub', category: 'Tools & Version Control', currentLevel: 2, targetLevel: 4, progress: 41, lastAssessed: '2026-08-28' },
]

export interface SkillGapComparison {
  skillName: string
  category: string
  currentPercent: number
  targetPercent: number
  gapPercent: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: string
}

export const MOCK_SKILL_COMPARISONS: SkillGapComparison[] = [
  {
    skillName: 'JavaScript',
    category: 'Programming Fundamentals',
    currentPercent: 78,
    targetPercent: 85,
    gapPercent: 7,
    priority: 'MEDIUM',
    status: 'Solid foundation, master async patterns',
  },
  {
    skillName: 'React',
    category: 'Frontend Development',
    currentPercent: 54,
    targetPercent: 80,
    gapPercent: 26,
    priority: 'HIGH',
    status: 'High impact for Frontend Developer role',
  },
  {
    skillName: 'Git & GitHub',
    category: 'Tools & Version Control',
    currentPercent: 41,
    targetPercent: 70,
    gapPercent: 29,
    priority: 'HIGH',
    status: 'Essential team collaboration gap',
  },
  {
    skillName: 'API Integration',
    category: 'Frontend Development',
    currentPercent: 32,
    targetPercent: 70,
    gapPercent: 38,
    priority: 'HIGH',
    status: 'Key for dynamic data-driven applications',
  },
]

export const MOCK_STUDENT_STRENGTHS = [
  'HTML & CSS (85% — Semantics, Flexbox, Responsive layouts)',
  'JavaScript fundamentals (78% — ES6+, array methods, functions)',
  'Logical thinking & algorithmic problem solving (66%)',
]

export const MOCK_FOCUS_NEXT = [
  {
    title: 'React Fundamentals',
    reason: 'Your JavaScript foundation is strong enough to start React.',
    importance: 'Core requirement for Frontend Developer goal',
  },
  {
    title: 'Git & GitHub',
    reason: 'Git is currently one of the biggest gaps in your Frontend Developer path.',
    importance: 'Required for real-world project workflows',
  },
  {
    title: 'API Integration',
    reason: 'Recommended as your next step after React fundamentals.',
    importance: 'Connecting UI components to backend endpoints',
  },
]

export const MOCK_SKILL_GAPS: SkillGap[] = [
  {
    skillId: 'sk_react',
    skillName: 'React Component Architecture',
    category: 'Frontend Development',
    currentLevel: 2,
    targetLevel: 4,
    gap: 2,
    priority: 'HIGH',
    recommendedAction: 'Start React Fundamentals course and build interactive stateful components.',
  },
  {
    skillId: 'sk_git',
    skillName: 'Git & GitHub Workflows',
    category: 'Tools & Version Control',
    currentLevel: 2,
    targetLevel: 4,
    gap: 2,
    priority: 'HIGH',
    recommendedAction: 'Practice branch management, pull requests, and merge conflict resolution.',
  },
  {
    skillId: 'sk_api',
    skillName: 'REST API & Fetch/Axios',
    category: 'Frontend Development',
    currentLevel: 1,
    targetLevel: 4,
    gap: 3,
    priority: 'HIGH',
    recommendedAction: 'Build data-fetching components handling loading, error, and pagination states.',
  },
  {
    skillId: 'sk_js_async',
    skillName: 'JavaScript Asynchronous Patterns',
    category: 'Programming Fundamentals',
    currentLevel: 3,
    targetLevel: 4,
    gap: 1,
    priority: 'MEDIUM',
    recommendedAction: 'Deep dive into Promises, async/await, and event loop execution ordering.',
  },
]
