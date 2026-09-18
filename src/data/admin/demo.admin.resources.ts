/**
 * Admin Learning Resources Demo Dataset
 * -------------------------------------
 * Curriculum assets mapped across modalities and skill competencies.
 */

export type ResourceType = 'Course' | 'Video' | 'Article' | 'Practice' | 'Project' | 'Quiz'

export interface AdminResourceRecord {
  id: string
  title: string
  type: ResourceType
  skill: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  studentsEnrolled: number
  status: 'active' | 'draft' | 'archived'
  url: string
  provider: string
}

export const DEMO_ADMIN_RESOURCES: AdminResourceRecord[] = [
  {
    id: 'res-001',
    title: 'Modern HTML & Responsive CSS Masterclass',
    type: 'Course',
    skill: 'HTML & CSS',
    difficulty: 'Beginner',
    duration: '6 hours',
    studentsEnrolled: 640,
    status: 'active',
    url: 'https://web.dev/learn/css',
    provider: 'web.dev',
  },
  {
    id: 'res-002',
    title: 'JavaScript Event Loop & Concurrency Explained',
    type: 'Video',
    skill: 'JavaScript',
    difficulty: 'Intermediate',
    duration: '45 mins',
    studentsEnrolled: 512,
    status: 'active',
    url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
    provider: 'JSConf EU',
  },
  {
    id: 'res-003',
    title: 'React 19 Official Documentation & Core Concepts',
    type: 'Article',
    skill: 'React',
    difficulty: 'Intermediate',
    duration: '2.5 hours',
    studentsEnrolled: 720,
    status: 'active',
    url: 'https://react.dev/learn',
    provider: 'React Official',
  },
  {
    id: 'res-004',
    title: 'LeetCode 75: Interactive Algorithm Practice',
    type: 'Practice',
    skill: 'Problem Solving',
    difficulty: 'Intermediate',
    duration: '15 hours',
    studentsEnrolled: 380,
    status: 'active',
    url: 'https://leetcode.com/studyplan/leetcode-75/',
    provider: 'LeetCode',
  },
  {
    id: 'res-005',
    title: 'Full-Stack Portfolio Project: Task & Team Manager',
    type: 'Project',
    skill: 'React',
    difficulty: 'Advanced',
    duration: '12 hours',
    studentsEnrolled: 290,
    status: 'active',
    url: 'https://github.com/topics/react-project',
    provider: 'SkillPath Labs',
  },
  {
    id: 'res-006',
    title: 'SQL Relational Sandbox & Schema Queries',
    type: 'Quiz',
    skill: 'SQL',
    difficulty: 'Beginner',
    duration: '30 mins',
    studentsEnrolled: 415,
    status: 'active',
    url: 'https://sqlbolt.com/',
    provider: 'SQLBolt',
  },
  {
    id: 'res-007',
    title: 'Git Immersion: From Commits to Rebase & Cherry-Pick',
    type: 'Practice',
    skill: 'Git & GitHub',
    difficulty: 'Beginner',
    duration: '3 hours',
    studentsEnrolled: 810,
    status: 'active',
    url: 'https://gitimmersion.com/',
    provider: 'Git Immersion',
  },
  {
    id: 'res-008',
    title: 'Python for Beginners: Zero to Scripting',
    type: 'Course',
    skill: 'Python',
    difficulty: 'Beginner',
    duration: '8 hours',
    studentsEnrolled: 490,
    status: 'draft',
    url: 'https://docs.python.org/3/tutorial/',
    provider: 'Python Foundation',
  },
]
