/**
 * Admin Assessments Demo Dataset
 * ------------------------------
 * Represents manageable benchmark assessments across skill domains.
 */

export interface AdminAssessmentRecord {
  id: string
  title: string
  skill: string
  category: 'Technical' | 'Soft Skills' | 'Tooling' | 'Domain'
  questionsCount: number
  attemptsCount: number
  averageScore: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  status: 'published' | 'draft' | 'archived'
  estimatedMinutes: number
  passingScore: number
}

export const DEMO_ADMIN_ASSESSMENTS: AdminAssessmentRecord[] = [
  {
    id: 'asm-001',
    title: 'Frontend Foundations: HTML5 & Modern CSS',
    skill: 'HTML & CSS',
    category: 'Technical',
    questionsCount: 20,
    attemptsCount: 842,
    averageScore: 84,
    difficulty: 'Beginner',
    status: 'published',
    estimatedMinutes: 25,
    passingScore: 70,
  },
  {
    id: 'asm-002',
    title: 'JavaScript Core: ES6+, Scope & Async',
    skill: 'JavaScript',
    category: 'Technical',
    questionsCount: 25,
    attemptsCount: 719,
    averageScore: 76,
    difficulty: 'Intermediate',
    status: 'published',
    estimatedMinutes: 30,
    passingScore: 70,
  },
  {
    id: 'asm-003',
    title: 'React Architecture & State Management',
    skill: 'React',
    category: 'Technical',
    questionsCount: 20,
    attemptsCount: 610,
    averageScore: 72,
    difficulty: 'Intermediate',
    status: 'published',
    estimatedMinutes: 30,
    passingScore: 75,
  },
  {
    id: 'asm-004',
    title: 'Python for Data Analysis & Scripting',
    skill: 'Python',
    category: 'Technical',
    questionsCount: 20,
    attemptsCount: 420,
    averageScore: 79,
    difficulty: 'Intermediate',
    status: 'published',
    estimatedMinutes: 30,
    passingScore: 70,
  },
  {
    id: 'asm-005',
    title: 'SQL Relational Queries & Optimization',
    skill: 'SQL',
    category: 'Technical',
    questionsCount: 15,
    attemptsCount: 504,
    averageScore: 81,
    difficulty: 'Beginner',
    status: 'published',
    estimatedMinutes: 20,
    passingScore: 70,
  },
  {
    id: 'asm-006',
    title: 'Git Version Control & Team Workflows',
    skill: 'Git & GitHub',
    category: 'Tooling',
    questionsCount: 15,
    attemptsCount: 785,
    averageScore: 88,
    difficulty: 'Beginner',
    status: 'published',
    estimatedMinutes: 20,
    passingScore: 70,
  },
  {
    id: 'asm-007',
    title: 'Algorithmic Problem Solving & Big-O',
    skill: 'Problem Solving',
    category: 'Technical',
    questionsCount: 20,
    attemptsCount: 390,
    averageScore: 68,
    difficulty: 'Advanced',
    status: 'published',
    estimatedMinutes: 35,
    passingScore: 75,
  },
  {
    id: 'asm-008',
    title: 'Technical Communication & Code Reviews',
    skill: 'Communication',
    category: 'Soft Skills',
    questionsCount: 12,
    attemptsCount: 260,
    averageScore: 89,
    difficulty: 'Beginner',
    status: 'draft',
    estimatedMinutes: 15,
    passingScore: 65,
  },
]
