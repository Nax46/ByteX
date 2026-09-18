import { apiClient } from '../client'
import { DashboardSummary } from '@/types/dashboard.types'

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
}
