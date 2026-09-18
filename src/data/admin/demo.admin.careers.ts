/**
 * Admin Careers Demo Dataset
 * --------------------------
 * Industry roles, target skill stacks, and student alignment metrics.
 */

export interface AdminCareerRecord {
  id: string
  title: string
  category: string
  requiredSkills: string[]
  studentsInterested: number
  averageSkillAlignment: number
  status: 'active' | 'emerging' | 'archived'
  marketDemand: 'High' | 'Very High' | 'Medium'
  averageSalaryRange: string
  description: string
}

export const DEMO_ADMIN_CAREERS: AdminCareerRecord[] = [
  {
    id: 'car-001',
    title: 'Frontend Developer',
    category: 'Software Engineering',
    requiredSkills: ['HTML & CSS', 'JavaScript', 'React', 'Git & GitHub', 'Problem Solving'],
    studentsInterested: 432,
    averageSkillAlignment: 72,
    status: 'active',
    marketDemand: 'Very High',
    averageSalaryRange: '₹6L - ₹14L / yr',
    description: 'Build responsive, accessible, interactive user interfaces with modern web standards and client frameworks.',
  },
  {
    id: 'car-002',
    title: 'Data Analyst',
    category: 'Data Science & BI',
    requiredSkills: ['SQL', 'Python', 'Communication', 'Problem Solving'],
    studentsInterested: 280,
    averageSkillAlignment: 64,
    status: 'active',
    marketDemand: 'High',
    averageSalaryRange: '₹5.5L - ₹12L / yr',
    description: 'Transform raw data into strategic insights through statistical querying, modeling, and executive storytelling.',
  },
  {
    id: 'car-003',
    title: 'AI / ML Engineer',
    category: 'Artificial Intelligence',
    requiredSkills: ['Python', 'Problem Solving', 'SQL', 'Git & GitHub'],
    studentsInterested: 215,
    averageSkillAlignment: 51,
    status: 'emerging',
    marketDemand: 'Very High',
    averageSalaryRange: '₹9L - ₹22L / yr',
    description: 'Design and deploy deep learning pipelines, transformer embeddings, and computer vision systems.',
  },
  {
    id: 'car-004',
    title: 'UI/UX Designer',
    category: 'Product & Design',
    requiredSkills: ['HTML & CSS', 'Communication', 'Problem Solving'],
    studentsInterested: 180,
    averageSkillAlignment: 76,
    status: 'active',
    marketDemand: 'High',
    averageSalaryRange: '₹5L - ₹13L / yr',
    description: 'Craft research-backed user journeys, wireframes, and design systems for enterprise web applications.',
  },
  {
    id: 'car-005',
    title: 'Cybersecurity Analyst',
    category: 'Information Security',
    requiredSkills: ['Problem Solving', 'Git & GitHub', 'Communication'],
    studentsInterested: 141,
    averageSkillAlignment: 48,
    status: 'active',
    marketDemand: 'Very High',
    averageSalaryRange: '₹7L - ₹16L / yr',
    description: 'Protect application architecture and enterprise networks from cyber vulnerabilities and operational intrusions.',
  },
]
