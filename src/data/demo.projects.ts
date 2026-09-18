/**
 * Demo Recommended Projects
 * --------------------------
 * Matches the RecommendedProject interface from @/types/project.types.
 * Used by: ProjectsPage.
 *
 * TO SWAP WITH REAL DATA: projectsApi.getRecommendedProjects() returns RecommendedProject[].
 */

import type { RecommendedProject } from '@/types/project.types'

export const DEMO_PROJECTS: RecommendedProject[] = [
  {
    id: 'proj_01',
    title: 'Personal Portfolio Website',
    description: 'Build a professional multi-section portfolio site showcasing your skills, projects, and contact information. Focus on responsive layout, accessibility, and clean typography using pure HTML and CSS.',
    difficulty: 'BEGINNER',
    technologies: ['HTML5', 'CSS3', 'Flexbox', 'CSS Grid'],
    skillsReinforced: ['HTML & CSS', 'Responsive Design', 'Accessibility'],
    estimatedHours: 12,
    status: 'IN_PROGRESS',
  },
  {
    id: 'proj_02',
    title: 'Interactive Quiz App',
    description: 'Create a dynamic quiz application that loads questions from a JSON file, tracks user scores, shows a timer, and displays a detailed results screen. Practice DOM manipulation, event handling, and state management in vanilla JavaScript.',
    difficulty: 'BEGINNER',
    technologies: ['JavaScript ES6+', 'HTML5', 'CSS3'],
    skillsReinforced: ['JavaScript', 'DOM Manipulation', 'Event Handling'],
    estimatedHours: 18,
    status: 'NOT_STARTED',
  },
  {
    id: 'proj_03',
    title: 'GitHub User Profile Explorer',
    description: 'Build a React app that fetches GitHub user data from the public GitHub API, displays repositories, follower counts, and profile stats. Implement search functionality, loading states, and error handling.',
    difficulty: 'INTERMEDIATE',
    technologies: ['React', 'Fetch API', 'CSS Modules', 'React Hooks'],
    skillsReinforced: ['React', 'JavaScript', 'API Integration'],
    estimatedHours: 22,
    status: 'NOT_STARTED',
  },
  {
    id: 'proj_04',
    title: 'Task Manager Dashboard (TypeScript + React)',
    description: 'Build a full-featured task management app with TypeScript. Include features like task creation, priority tags, due dates, filtering, and local storage persistence. This is your capstone project to demonstrate production-grade frontend skills.',
    difficulty: 'INTERMEDIATE',
    technologies: ['React', 'TypeScript', 'React Router', 'localStorage'],
    skillsReinforced: ['React', 'TypeScript', 'JavaScript', 'Git & Version Control'],
    estimatedHours: 35,
    status: 'NOT_STARTED',
  },
]
