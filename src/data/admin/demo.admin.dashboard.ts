/**
 * Admin Dashboard Metrics & Quick Feed
 * -----------------------------------
 * Centralized metrics for the Admin Overview screen.
 */

export interface AdminDashboardMetric {
  id: string
  label: string
  value: string | number
  change: string
  isPositive: boolean
  description: string
}

export interface AdminActivityItem {
  id: string
  title: string
  timestamp: string
  category: 'assessment' | 'roadmap' | 'enrollment' | 'system'
  details: string
}

export const ADMIN_DASHBOARD_METRICS: AdminDashboardMetric[] = [
  {
    id: 'metric-total-students',
    label: 'Total Students',
    value: '1,248',
    change: '+14.2% vs last month',
    isPositive: true,
    description: 'Enrolled across all tracks',
  },
  {
    id: 'metric-active-learners',
    label: 'Active Learners',
    value: '846',
    change: '+8.7% vs last week',
    isPositive: true,
    description: 'Engaged in last 7 days',
  },
  {
    id: 'metric-assessments-completed',
    label: 'Assessments Completed',
    value: '2,936',
    change: '+22.4% vs last month',
    isPositive: true,
    description: 'Benchmarked tests graded',
  },
  {
    id: 'metric-courses-completed',
    label: 'Courses Completed',
    value: '1,672',
    change: '+11.8% vs last month',
    isPositive: true,
    description: 'Milestones achieved',
  },
]

export const ADMIN_RECENT_ACTIVITY: AdminActivityItem[] = [
  {
    id: 'act-1',
    title: 'Alex Patel completed JavaScript Advanced Assessment',
    timestamp: '12 minutes ago',
    category: 'assessment',
    details: 'Score: 88% — Proficiency elevated to Advanced Level',
  },
  {
    id: 'act-2',
    title: 'New Student Enrollment',
    timestamp: '45 minutes ago',
    category: 'enrollment',
    details: 'Priya Sharma registered for UI/UX Design Track',
  },
  {
    id: 'act-3',
    title: 'Milestone Completed: Full-Stack Project',
    timestamp: '2 hours ago',
    category: 'roadmap',
    details: 'Rohan Mehra finalized E-Commerce Microservices project',
  },
  {
    id: 'act-4',
    title: 'Curriculum Update',
    timestamp: '5 hours ago',
    category: 'system',
    details: 'React 19 Server Components section added to Frontend Path',
  },
]
