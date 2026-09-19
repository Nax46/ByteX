import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { notificationsApi } from '@/api/endpoints/notifications.api'
import { CareerNotification, NotificationSummary, NotificationCategory } from '@/types/notification.types'
import { Bell, Zap, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'

// Import Notification Subcomponents
import { NotificationHeaderBanner } from '@/components/notifications/NotificationHeaderBanner'
import { NotificationCard } from '@/components/notifications/NotificationCard'
import { NotificationFilters } from '@/components/notifications/NotificationFilters'

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<CareerNotification[]>([])
  const [summary, setSummary] = useState<NotificationSummary | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNREAD'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | NotificationCategory>('ALL')

  const fetchNotificationsData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [listData, summaryData] = await Promise.all([
        notificationsApi.getNotifications(),
        notificationsApi.getSummary(),
      ])
      setNotifications(listData || [])
      setSummary(summaryData)
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setError('Unable to fetch career notifications stream. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotificationsData()
  }, [])

  if (isLoading && !summary) {
    return <LoadingState message="Loading your career notifications stream..." minHeight="min-h-[400px]" />
  }

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      setNotifications(updated)
      if (summary) {
        setSummary({
          ...summary,
          unreadCount: Math.max(0, summary.unreadCount - 1),
        })
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      const updated = notifications.map((n) => ({ ...n, isRead: true }))
      setNotifications(updated)
      if (summary) {
        setSummary({
          ...summary,
          unreadCount: 0,
        })
      }
      setNotice('All career notifications marked as read.')
      setTimeout(() => setNotice(null), 3500)
    } catch (err) {
      console.error('Failed to mark all notifications read:', err)
    }
  }

  const filteredNotifications = notifications.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'UNREAD' && !item.isRead)
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter
    return matchesStatus && matchesCategory
  })

  const defaultSummary: NotificationSummary = summary || {
    unreadCount: notifications.filter((n) => !n.isRead).length,
    totalCount: notifications.length,
    categoryCounts: {
      CAREER: 0,
      ASSESSMENT: 0,
      CHALLENGE: 0,
      PROJECT: 0,
      EVIDENCE: 0,
      ROADMAP: 0,
      ACHIEVEMENTS: 0,
      COLLABORATION: 0,
    },
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Career Notifications & Activity Center"
        subtitle="Real-time actionable alerts informing you of diagnostic results, challenge verifications, project submissions, and milestone updates."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Notifications' },
        ]}
      />

      {/* 2. NOTICE BAR */}
      {notice && (
        <div className="p-3.5 rounded-xl border border-[#1F6B4F]/30 bg-[#D8E8DE]/80 text-[#1F6B4F] text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1F6B4F]" />
          <span>{notice}</span>
        </div>
      )}

      {/* 3. ERROR STATE HANDLER */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200 text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchNotificationsData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </Card>
      )}

      {/* 4. OVERVIEW HEADER */}
      <NotificationHeaderBanner
        summary={defaultSummary}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* 5. FILTERS BAR */}
      <NotificationFilters
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* 6. NOTIFICATIONS FEED */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 bg-white border-[#E5E5DF] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D8E8DE]/70 text-[#1F6B4F] flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-[#171918]">
            {statusFilter === 'UNREAD' ? 'No Unread Notifications' : 'No Notifications Found'}
          </h3>
          <p className="text-xs sm:text-sm text-[#626763] max-w-md mx-auto">
            {statusFilter === 'UNREAD'
              ? "You're completely up to date with your active learning roadmap, milestone evaluations, and skill assessments."
              : 'Try clearing your category or status filters to view previous alerts.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter('ALL')
              setCategoryFilter('ALL')
            }}
          >
            Reset Filters
          </Button>
        </Card>
      )}

      {/* 7. BOTTOM ACTION FOOTER */}
      <Card className="p-6 bg-white border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#D8E8DE] text-[#1F6B4F]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#171918]">Ready to execute your daily focus task?</h4>
            <p className="text-xs text-[#626763]">Open Today's Career Action to resolve your top skill bottlenecks.</p>
          </div>
        </div>
        <Link to={ROUTES.TODAY}>
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Today's Action →
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default NotificationsPage
