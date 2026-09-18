/**
 * Demo Personalized Learning Roadmap
 * ------------------------------------
 * Matches the Roadmap and RoadmapMilestone interfaces from @/types/roadmap.types.
 * Used by: RoadmapPage, DashboardPage (active milestone + roadmap stages preview).
 *
 * TO SWAP WITH REAL DATA: roadmapApi.getCurrentRoadmap() returns this exact shape.
 */

import type { Roadmap } from '@/types/roadmap.types'

export const DEMO_ROADMAP: Roadmap = {
  id: 'roadmap_demo_001',
  userId: 'student_demo_001',
  careerGoal: 'Frontend Developer',
  targetTimelineWeeks: 24,
  progressPercentage: 33,
  updatedAt: '2024-09-14T10:00:00.000Z',
  milestones: [
    {
      id: 'm_01',
      order: 1,
      title: 'Web Foundations',
      description: 'Master the core building blocks of the web — HTML semantics, CSS layouts, and responsive design patterns.',
      status: 'COMPLETED',
      estimatedHours: 30,
      skillsCovered: ['HTML5 Semantics', 'CSS Flexbox', 'CSS Grid', 'Responsive Design', 'Accessibility Basics'],
      resourcesCount: 6,
      projectsCount: 1,
    },
    {
      id: 'm_02',
      order: 2,
      title: 'JavaScript Essentials',
      description: 'Build a strong JavaScript foundation — variables, functions, DOM manipulation, events, and asynchronous programming.',
      status: 'COMPLETED',
      estimatedHours: 45,
      skillsCovered: ['JavaScript ES6+', 'DOM Manipulation', 'Event Handling', 'Promises & Async/Await', 'Fetch API'],
      resourcesCount: 8,
      projectsCount: 2,
    },
    {
      id: 'm_03',
      order: 3,
      title: 'Git & Professional Workflow',
      description: 'Learn version control with Git, collaborate on GitHub, and adopt industry-standard code review and branching workflows.',
      status: 'IN_PROGRESS',
      estimatedHours: 20,
      skillsCovered: ['Git Basics', 'GitHub Collaboration', 'Branching & Merging', 'Pull Requests', 'Commit Best Practices'],
      resourcesCount: 4,
      projectsCount: 1,
    },
    {
      id: 'm_04',
      order: 4,
      title: 'React & Component Architecture',
      description: 'Learn React from first principles — JSX, props, state, hooks, and component composition for building real UIs.',
      status: 'NOT_STARTED',
      estimatedHours: 60,
      skillsCovered: ['React JSX', 'useState & useEffect', 'Component Composition', 'Custom Hooks', 'React Router'],
      resourcesCount: 10,
      projectsCount: 2,
    },
    {
      id: 'm_05',
      order: 5,
      title: 'TypeScript & Type-Safe Development',
      description: 'Adopt TypeScript to write safer, more maintainable code — interfaces, generics, and utility types in a React context.',
      status: 'NOT_STARTED',
      estimatedHours: 25,
      skillsCovered: ['TypeScript Basics', 'Interfaces & Types', 'Generics', 'Type Narrowing', 'Typed React Components'],
      resourcesCount: 5,
      projectsCount: 1,
    },
    {
      id: 'm_06',
      order: 6,
      title: 'Portfolio Projects & Interview Prep',
      description: 'Build 2 production-quality frontend projects, write a technical resume, and practice common frontend interview topics.',
      status: 'NOT_STARTED',
      estimatedHours: 50,
      skillsCovered: ['Project Architecture', 'Performance Optimization', 'API Integration', 'Technical Resume', 'Behavioral Interview'],
      resourcesCount: 7,
      projectsCount: 2,
    },
  ],
}
