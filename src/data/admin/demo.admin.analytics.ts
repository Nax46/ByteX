/**
 * Admin Analytics Demo Dataset
 * ----------------------------
 * Chart metrics, distribution cohorts, and usage trends.
 */

export interface TimeSeriesPoint {
  period: string
  value: number
  target?: number
}

export interface DistributionItem {
  label: string
  count: number
  percentage: number
  color: string
}

export const DEMO_ADMIN_ANALYTICS = {
  // Student Enrollment & Growth over last 6 months
  studentGrowth: [
    { period: 'May', value: 480 },
    { period: 'Jun', value: 610 },
    { period: 'Jul', value: 790 },
    { period: 'Aug', value: 950 },
    { period: 'Sep', value: 1120 },
    { period: 'Oct', value: 1248 },
  ] as TimeSeriesPoint[],

  // Weekly Active Study Hours (aggregates across platform)
  weeklyActivity: [
    { period: 'Mon', value: 340 },
    { period: 'Tue', value: 410 },
    { period: 'Wed', value: 490 },
    { period: 'Thu', value: 460 },
    { period: 'Fri', value: 520 },
    { period: 'Sat', value: 390 },
    { period: 'Sun', value: 310 },
  ] as TimeSeriesPoint[],

  // Average assessment performance by core skill domain
  assessmentPerformanceBySkill: [
    { label: 'HTML & CSS', value: 84, color: '#1F6B4F' },
    { label: 'JavaScript', value: 76, color: '#2A8563' },
    { label: 'React', value: 72, color: '#3BA078' },
    { label: 'Python', value: 79, color: '#4CB58B' },
    { label: 'SQL', value: 81, color: '#68C49E' },
    { label: 'Git & GitHub', value: 88, color: '#1F6B4F' },
    { label: 'Problem Solving', value: 68, color: '#E07A5F' },
    { label: 'Communication', value: 89, color: '#2A8563' },
  ],

  // Career Track Enrollment Distribution
  careerDistribution: [
    { label: 'Frontend Developer', count: 432, percentage: 34.6, color: '#1F6B4F' },
    { label: 'Data Analyst', count: 280, percentage: 22.4, color: '#2A8563' },
    { label: 'AI / ML Engineer', count: 215, percentage: 17.2, color: '#4CB58B' },
    { label: 'UI/UX Designer', count: 180, percentage: 14.4, color: '#E07A5F' },
    { label: 'Cybersecurity Analyst', count: 141, percentage: 11.4, color: '#3D405B' },
  ] as DistributionItem[],

  // Resource Modality Breakdown
  resourceUsageByType: [
    { label: 'Courses', count: 520, percentage: 31, color: '#1F6B4F' },
    { label: 'Interactive Practice', count: 440, percentage: 26, color: '#2A8563' },
    { label: 'Projects & Labs', count: 310, percentage: 19, color: '#4CB58B' },
    { label: 'Video Walkthroughs', count: 250, percentage: 15, color: '#E07A5F' },
    { label: 'Technical Articles', count: 152, percentage: 9, color: '#3D405B' },
  ] as DistributionItem[],
}
