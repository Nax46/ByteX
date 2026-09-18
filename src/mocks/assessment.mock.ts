import { AssessmentQuestion, AssessmentResult } from '@/types/assessment.types'

export const MOCK_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'q1',
    text: 'What is the primary difference between let and const in modern JavaScript (ES6+)?',
    type: 'MULTIPLE_CHOICE',
    category: 'Programming Fundamentals',
    difficulty: 'EASY',
    options: [
      { id: 'opt_1', text: 'let variables are block-scoped and reassignable; const variables cannot be reassigned.' },
      { id: 'opt_2', text: 'const variables can only hold strings and numbers, while let can hold objects.' },
      { id: 'opt_3', text: 'let is hoisted to the top of the function while const is never hoisted.' },
      { id: 'opt_4', text: 'There is no difference; they are interchangeable aliases.' },
    ],
  },
  {
    id: 'q2',
    text: 'Which array method should you use to create a new array containing only elements that satisfy a condition?',
    type: 'MULTIPLE_CHOICE',
    category: 'Programming Fundamentals',
    difficulty: 'EASY',
    options: [
      { id: 'opt_1', text: 'Array.prototype.filter()' },
      { id: 'opt_2', text: 'Array.prototype.map()' },
      { id: 'opt_3', text: 'Array.prototype.forEach()' },
      { id: 'opt_4', text: 'Array.prototype.reduce()' },
    ],
  },
  {
    id: 'q7',
    text: 'You need to make a webpage responsive across mobile and desktop devices. Which approach would be most appropriate?',
    type: 'MULTIPLE_CHOICE',
    category: 'Frontend Development',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt_1', text: 'Use a mobile-first CSS architecture with relative units (rem, em, %) and fluid media queries' },
      { id: 'opt_2', text: 'Create separate HTML files for desktop and mobile devices and redirect users via JavaScript' },
      { id: 'opt_3', text: 'Fix all container widths to 1200px and allow mobile browsers to zoom in automatically' },
      { id: 'opt_4', text: 'Rely exclusively on table layouts with pixel-based min-width constraints' },
    ],
  },
  {
    id: 'q4',
    text: 'In Git, what is the best practice before starting work on a new feature?',
    type: 'MULTIPLE_CHOICE',
    category: 'Tools & Version Control',
    difficulty: 'EASY',
    options: [
      { id: 'opt_1', text: 'Create and switch to a new descriptive branch derived from the updated main branch' },
      { id: 'opt_2', text: 'Commit directly to the main branch with force pushes enabled' },
      { id: 'opt_3', text: 'Clone a completely new copy of the repository into another folder' },
      { id: 'opt_4', text: 'Delete the .git directory to reset project history' },
    ],
  },
]

export const MOCK_LATEST_RESULT: AssessmentResult = {
  id: 'res_001',
  assessmentId: 'asmt_frontend_foundations',
  title: 'Frontend Foundations & Web Core Evaluation',
  category: 'Frontend Development',
  completedAt: '2026-09-18T15:00:00Z',
  score: 76,
  totalQuestions: 20,
  correctQuestions: 15,
  evaluatedSkills: [
    { skillName: 'HTML & CSS', demonstratedLevel: 4, delta: 0 },
    { skillName: 'JavaScript Fundamentals', demonstratedLevel: 4, delta: 0 },
    { skillName: 'Git & Version Control', demonstratedLevel: 2, delta: 0 },
    { skillName: 'React & Component Concepts', demonstratedLevel: 2, delta: 0 },
  ],
  identifiedGaps: [
    'Git Branching & Collaborative Workflow',
    'Component State Management with Hooks',
    'Asynchronous API Data Fetching',
  ],
  recommendedRoadmapSteps: [
    'Milestone 3: Git & GitHub Workflows for Teams',
    'Milestone 4: React Core & Component Architecture',
  ],
}
