/**
 * Admin Skills Demo Dataset
 * -------------------------
 * Taxonomy and analytics for skills managed on SkillPath.
 */

export interface AdminSkillRecord {
  id: string
  name: string
  category: string
  studentsLearning: number
  averageScore: number
  status: 'active' | 'in-review' | 'deprecated'
  targetBenchmark: number
  description: string
}

export const DEMO_ADMIN_SKILLS: AdminSkillRecord[] = [
  {
    id: 'skill-001',
    name: 'HTML & CSS',
    category: 'Frontend Development',
    studentsLearning: 940,
    averageScore: 84,
    status: 'active',
    targetBenchmark: 85,
    description: 'Semantic markup, accessibility standards, responsive CSS layout and Tailwind utilities.',
  },
  {
    id: 'skill-002',
    name: 'JavaScript',
    category: 'Core Programming',
    studentsLearning: 890,
    averageScore: 76,
    status: 'active',
    targetBenchmark: 80,
    description: 'ES6+ syntax, asynchronous programming, event loop, closures, and DOM manipulation.',
  },
  {
    id: 'skill-003',
    name: 'React',
    category: 'Frontend Frameworks',
    studentsLearning: 780,
    averageScore: 72,
    status: 'active',
    targetBenchmark: 75,
    description: 'Hooks, functional components, context API, state machines, and reconciliation lifecycle.',
  },
  {
    id: 'skill-004',
    name: 'Python',
    category: 'Core Programming',
    studentsLearning: 620,
    averageScore: 79,
    status: 'active',
    targetBenchmark: 80,
    description: 'Data structures, NumPy/Pandas pipelines, scripting, and backend web frameworks.',
  },
  {
    id: 'skill-005',
    name: 'SQL',
    category: 'Database & Infrastructure',
    studentsLearning: 510,
    averageScore: 81,
    status: 'active',
    targetBenchmark: 75,
    description: 'Relational schema design, complex joins, index tuning, and normalization.',
  },
  {
    id: 'skill-006',
    name: 'Git & GitHub',
    category: 'Developer Tooling',
    studentsLearning: 1020,
    averageScore: 88,
    status: 'active',
    targetBenchmark: 85,
    description: 'Branching models, merge conflict resolution, pull request workflows, and CI/CD basics.',
  },
  {
    id: 'skill-007',
    name: 'Problem Solving',
    category: 'Algorithms & Data Structures',
    studentsLearning: 480,
    averageScore: 68,
    status: 'active',
    targetBenchmark: 75,
    description: 'Complexity analysis, array algorithms, trees, dynamic programming, and recursion.',
  },
  {
    id: 'skill-008',
    name: 'Communication',
    category: 'Professional Skills',
    studentsLearning: 340,
    averageScore: 89,
    status: 'active',
    targetBenchmark: 80,
    description: 'Technical writing, synchronous stand-up presentation, and stakeholder documentation.',
  },
]
