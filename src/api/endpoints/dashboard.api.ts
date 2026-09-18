import { apiClient } from '@/api/client'
import { DashboardSummary } from '@/types/dashboard.types'

export type DashboardSummaryResponse = DashboardSummary

/**
 * Dashboard Aggregation API Module
 */
export const dashboardApi = {
  /**
   * Retrieves aggregated dashboard summary for authenticated user (GET /api/dashboard).
   */
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await apiClient.get<DashboardSummary>('/dashboard')
    const raw = res.data as unknown
    const summary =
      (raw as { dashboard?: DashboardSummary })?.dashboard || (raw as DashboardSummary)
    return summary
  },

  /**
   * Alias for getDashboardSummary for backwards compatibility
   */
  getSummary: async (): Promise<DashboardSummary> => {
    return dashboardApi.getDashboardSummary()
  },
}
