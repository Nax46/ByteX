import { MOCK_USER, MOCK_USER_STATS } from './user.mock'
import { MOCK_SKILLS, MOCK_SKILL_GAPS } from './skills.mock'
import { RoadmapMilestone } from '@/types/roadmap.types'
import { RecommendedProject } from '@/types/project.types'

export interface RecommendationItem {
  id: string
  title: string
  reason: string
  category: string
  estimatedHours: string
  tag: string
}

export interface DashboardData {
  user: typeof MOCK_USER
  stats: typeof MOCK_USER_STATS
  careerGoal: {
    targetRole: string
    readinessScore: number
    targetCompanyType: string
  }
  currentCourse: {
    title: string
    currentModule: string
    progressPercent: number
    estimatedTime: string
  }
  skillSnapshot: typeof MOCK_SKILLS
  recommendations: RecommendationItem[]
  currentRoadmapMilestones: RoadmapMilestone[]
  recommendedProjects: RecommendedProject[]
  skillGaps: typeof MOCK_SKILL_GAPS
}

export const MOCK_DASHBOARD_DATA: DashboardData = {
  user: MOCK_USER,
  stats: MOCK_USER_STATS,
  careerGoal: {
    targetRole: 'Frontend Developer',
    readinessScore: 72,
    targetCompanyType: 'Tech Startup / Modern SaaS',
  },
  currentCourse: {
    title: 'JavaScript Fundamentals',
    currentModule: 'Functions & Arrays',
    progressPercent: 64,
    estimatedTime: '35 min',
  },
  skillSnapshot: MOCK_SKILLS,
  recommendations: [
    {
      id: 'rec_react',
      title: 'React Fundamentals',
      reason: 'Your JavaScript foundation is strong enough to start React.',
      category: 'Frontend',
      estimatedHours: '12 hours',
      tag: 'Next Milestone',
    },
    {
      id: 'rec_git',
      title: 'Git & GitHub Workflows',
      reason: 'Git is currently one of the biggest gaps in your Frontend Developer path.',
      category: 'Tools',
      estimatedHours: '4 hours',
      tag: 'Priority Gap',
    },
    {
      id: 'rec_api',
      title: 'API Integration & Asynchronous Code',
      reason: 'Recommended as your next step after React fundamentals.',
      category: 'Architecture',
      estimatedHours: '6 hours',
      tag: 'Upcoming',
    },
  ],
  currentRoadmapMilestones: [
    {
      id: 'm1',
      title: 'HTML & CSS Foundations',
      description: 'Semantic elements, responsive flexbox/grid, accessible typography.',
      estimatedHours: 12,
      status: 'COMPLETED',
      skillsCovered: ['HTML', 'CSS'],
      order: 1,
      resourcesCount: 5,
      projectsCount: 2,
    },
    {
      id: 'm2',
      title: 'JavaScript Fundamentals',
      description: 'ES6+ syntax, functions, arrays, scope, DOM manipulation.',
      estimatedHours: 18,
      status: 'COMPLETED',
      skillsCovered: ['JavaScript', 'DOM'],
      order: 2,
      resourcesCount: 7,
      projectsCount: 2,
    },
    {
      id: 'm3',
      title: 'Git & GitHub Workflows',
      description: 'Branching, committing, staging, pull requests, resolving conflicts.',
      estimatedHours: 6,
      status: 'IN_PROGRESS',
      skillsCovered: ['Git', 'Version Control'],
      order: 3,
      resourcesCount: 4,
      projectsCount: 1,
    },
    {
      id: 'm4',
      title: 'React Core & Component Architecture',
      description: 'JSX, props, state, effect lifecycles, and component composition.',
      estimatedHours: 20,
      status: 'NOT_STARTED',
      skillsCovered: ['React', 'Components'],
      order: 4,
      resourcesCount: 8,
      projectsCount: 2,
    },
  ],
  recommendedProjects: [
    {
      id: 'prj_1',
      title: 'Interactive Task & Habit Tracker',
      description: 'Build a responsive local-first tracker using modern JavaScript arrays and DOM state.',
      difficulty: 'BEGINNER',
      technologies: ['HTML5', 'CSS3', 'JavaScript'],
      skillsReinforced: ['Functions & Arrays', 'Local Storage', 'Event Handling'],
      estimatedHours: 8,
      status: 'IN_PROGRESS',
    },
    {
      id: 'prj_2',
      title: 'Developer Portfolio & Project Showcase',
      description: 'Design and deploy a semantic, responsive personal portfolio demonstrating your skills.',
      difficulty: 'INTERMEDIATE',
      technologies: ['HTML/CSS', 'Responsive Design', 'Git Pages'],
      skillsReinforced: ['Responsive Layouts', 'Git Workflow', 'SEO Basics'],
      estimatedHours: 12,
      status: 'NOT_STARTED',
    },
  ],
  skillGaps: MOCK_SKILL_GAPS,
}
