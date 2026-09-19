export type NotificationCategory =
  | 'CAREER'
  | 'ASSESSMENT'
  | 'CHALLENGE'
  | 'PROJECT'
  | 'EVIDENCE'
  | 'ROADMAP'
  | 'ACHIEVEMENTS'
  | 'COLLABORATION'

export type NotificationPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface CareerNotification {
  id: string
  title: string
  message: string
  whyItMatters: string
  category: NotificationCategory
  isRead: boolean
  createdAt: string
  priority: NotificationPriority
  actionUrl: string
  actionLabel: string
  relatedSkill?: string
}

export interface NotificationSummary {
  unreadCount: number
  totalCount: number
  categoryCounts: Record<NotificationCategory, number>
}
