/**
 * Analytics & Platform Maintenance Service
 * ----------------------------------------
 * Supplies administrative analytics and platform-wide demo reset capabilities.
 */

import {
  ADMIN_DASHBOARD_METRICS,
  ADMIN_RECENT_ACTIVITY,
  AdminDashboardMetric,
  AdminActivityItem,
} from '@/data/admin/demo.admin.dashboard'
import { DEMO_ADMIN_ANALYTICS } from '@/data/admin/demo.admin.analytics'
import { studentService } from './studentService'
import { assessmentService } from './assessmentService'
import { skillService } from './skillService'
import { resourceService } from './resourceService'
import { learningPathService } from './learningPathService'
import { careerService } from './careerService'

export const analyticsService = {
  getDashboardMetrics: async (): Promise<AdminDashboardMetric[]> => {
    // API Contract placeholder: GET /api/admin/metrics
    return ADMIN_DASHBOARD_METRICS
  },

  getRecentActivity: async (): Promise<AdminActivityItem[]> => {
    // API Contract placeholder: GET /api/admin/activity
    return ADMIN_RECENT_ACTIVITY
  },

  getAnalyticsData: async () => {
    // API Contract placeholder: GET /api/admin/analytics
    return DEMO_ADMIN_ANALYTICS
  },

  /**
   * Restores all demo datasets to initial state across local storage.
   */
  resetAllDemoData: async (): Promise<void> => {
    await Promise.all([
      studentService.resetStudents(),
      assessmentService.resetAssessments(),
      skillService.resetSkills(),
      resourceService.resetResources(),
      learningPathService.resetLearningPaths(),
      careerService.resetCareers(),
    ])
  },
}
