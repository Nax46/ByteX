/**
 * Admin Learning Paths Demo Dataset
 * ---------------------------------
 * Structured career roadmaps with milestone steps.
 */

export interface LearningPathStep {
  id: string
  title: string
  estimatedWeeks: number
  skillsCovered: string[]
  isCore: boolean
}

export interface AdminLearningPathRecord {
  id: string
  career: string
  category: string
  stepsCount: number
  studentsEnrolled: number
  completionRate: number
  status: 'active' | 'draft' | 'archived'
  description: string
  steps: LearningPathStep[]
}

export const DEMO_ADMIN_LEARNING_PATHS: AdminLearningPathRecord[] = [
  {
    id: 'path-001',
    career: 'Frontend Developer',
    category: 'Engineering',
    stepsCount: 6,
    studentsEnrolled: 432,
    completionRate: 68,
    status: 'active',
    description: 'Master HTML, CSS, JavaScript, React, state systems, and responsive design for production web apps.',
    steps: [
      { id: 's-1', title: 'Web Foundations & Accessibility', estimatedWeeks: 2, skillsCovered: ['HTML & CSS'], isCore: true },
      { id: 's-2', title: 'JavaScript Core & DOM Scripting', estimatedWeeks: 3, skillsCovered: ['JavaScript'], isCore: true },
      { id: 's-3', title: 'Modern React & Component Patterns', estimatedWeeks: 4, skillsCovered: ['React'], isCore: true },
      { id: 's-4', title: 'State Management & Async Data', estimatedWeeks: 2, skillsCovered: ['React', 'JavaScript'], isCore: true },
      { id: 's-5', title: 'Build Tooling & Testing Basics', estimatedWeeks: 2, skillsCovered: ['Git & GitHub'], isCore: false },
      { id: 's-6', title: 'Production Capstone Deployment', estimatedWeeks: 3, skillsCovered: ['React', 'HTML & CSS'], isCore: true },
    ],
  },
  {
    id: 'path-002',
    career: 'Data Analyst',
    category: 'Data & Analytics',
    stepsCount: 5,
    studentsEnrolled: 280,
    completionRate: 54,
    status: 'active',
    description: 'Data wrangling, SQL joins, exploratory data analysis, and dashboard communication with Python and Tableau.',
    steps: [
      { id: 'da-1', title: 'Relational Database Fundamentals', estimatedWeeks: 2, skillsCovered: ['SQL'], isCore: true },
      { id: 'da-2', title: 'Advanced SQL Queries & Window Functions', estimatedWeeks: 3, skillsCovered: ['SQL'], isCore: true },
      { id: 'da-3', title: 'Python Pandas & Data Cleaning', estimatedWeeks: 4, skillsCovered: ['Python'], isCore: true },
      { id: 'da-4', title: 'Data Storytelling & Visualization', estimatedWeeks: 2, skillsCovered: ['Communication'], isCore: false },
      { id: 'da-5', title: 'Business Case Study Capstone', estimatedWeeks: 3, skillsCovered: ['SQL', 'Python'], isCore: true },
    ],
  },
  {
    id: 'path-003',
    career: 'AI / ML Engineer',
    category: 'Artificial Intelligence',
    stepsCount: 7,
    studentsEnrolled: 215,
    completionRate: 42,
    status: 'active',
    description: 'Statistical foundations, neural networks, PyTorch model deployment, and LLM fine-tuning.',
    steps: [
      { id: 'ai-1', title: 'Linear Algebra & Probability', estimatedWeeks: 3, skillsCovered: ['Problem Solving'], isCore: true },
      { id: 'ai-2', title: 'Python for Scientific Computing', estimatedWeeks: 3, skillsCovered: ['Python'], isCore: true },
      { id: 'ai-3', title: 'Supervised & Unsupervised Learning', estimatedWeeks: 4, skillsCovered: ['Python', 'Problem Solving'], isCore: true },
      { id: 'ai-4', title: 'Deep Learning Architectures', estimatedWeeks: 5, skillsCovered: ['Python'], isCore: true },
      { id: 'ai-5', title: 'Model Evaluation & Tuning', estimatedWeeks: 2, skillsCovered: ['Problem Solving'], isCore: true },
      { id: 'ai-6', title: 'MLOps & Inference Serving', estimatedWeeks: 3, skillsCovered: ['Git & GitHub'], isCore: false },
      { id: 'ai-7', title: 'Generative AI Pipeline Project', estimatedWeeks: 4, skillsCovered: ['Python'], isCore: true },
    ],
  },
  {
    id: 'path-004',
    career: 'UI/UX Designer',
    category: 'Design & Product',
    stepsCount: 5,
    studentsEnrolled: 180,
    completionRate: 72,
    status: 'active',
    description: 'Human-centered design, Figma design systems, wireframing, high-fidelity prototypes, and usability testing.',
    steps: [
      { id: 'ux-1', title: 'User Research & Personas', estimatedWeeks: 2, skillsCovered: ['Communication'], isCore: true },
      { id: 'ux-2', title: 'Information Architecture & Wireframes', estimatedWeeks: 3, skillsCovered: ['HTML & CSS'], isCore: true },
      { id: 'ux-3', title: 'Figma Design Tokens & Components', estimatedWeeks: 3, skillsCovered: ['HTML & CSS'], isCore: true },
      { id: 'ux-4', title: 'Interactive Prototyping & Motion', estimatedWeeks: 2, skillsCovered: ['HTML & CSS'], isCore: false },
      { id: 'ux-5', title: 'Usability Benchmarking Portfolio', estimatedWeeks: 3, skillsCovered: ['Communication'], isCore: true },
    ],
  },
  {
    id: 'path-005',
    career: 'Cybersecurity Analyst',
    category: 'Security & Infrastructure',
    stepsCount: 6,
    studentsEnrolled: 141,
    completionRate: 48,
    status: 'active',
    description: 'Network protocols, threat detection, ethical penetration audits, and security compliance.',
    steps: [
      { id: 'sec-1', title: 'Network Fundamentals & TCP/IP', estimatedWeeks: 3, skillsCovered: ['Problem Solving'], isCore: true },
      { id: 'sec-2', title: 'Linux System Administration & Bash', estimatedWeeks: 3, skillsCovered: ['Problem Solving'], isCore: true },
      { id: 'sec-3', title: 'Vulnerability Assessment & OWASP Top 10', estimatedWeeks: 4, skillsCovered: ['Problem Solving'], isCore: true },
      { id: 'sec-4', title: 'Defensive Security & SIEM Logging', estimatedWeeks: 3, skillsCovered: ['Problem Solving'], isCore: true },
      { id: 'sec-5', title: 'Cryptography & Identity Governance', estimatedWeeks: 2, skillsCovered: ['Problem Solving'], isCore: false },
      { id: 'sec-6', title: 'Incident Response Simulation Capstone', estimatedWeeks: 3, skillsCovered: ['Communication'], isCore: true },
    ],
  },
]
