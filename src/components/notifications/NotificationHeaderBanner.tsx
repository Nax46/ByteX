import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { NotificationSummary } from '@/types/notification.types'
import { Bell, CheckCheck, Sparkles, ShieldCheck } from 'lucide-react'

interface NotificationHeaderBannerProps {
  summary: NotificationSummary
  onMarkAllRead: () => void
}

export const NotificationHeaderBanner: React.FC<NotificationHeaderBannerProps> = ({
  summary,
  onMarkAllRead,
}) => {
  return (
    <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D8E8DE]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          {/* Tag Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
              <Bell className="w-5 h-5 fill-current" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Notifications Intelligence Center
            </span>
            <Badge variant="forest" size="sm" className="gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Career Journey Stream
            </Badge>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
              Career Notifications & Activity Stream
            </h1>
            <p className="text-xs sm:text-sm text-[#626763] mt-1.5 leading-relaxed max-w-2xl">
              Real-time actionable alerts informing you of diagnostic results, challenge verifications, project submissions, roadmap milestone completions, and squad tasks.
            </p>
          </div>

          {/* Context Line */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#626763]">
            <span className="flex items-center gap-1.5 font-semibold text-[#1F6B4F]">
              <ShieldCheck className="w-4 h-4 text-[#1F6B4F]" />
              Verified Event Stream
            </span>
            <span>•</span>
            <span>{summary.totalCount} Total Career Notifications Logged</span>
          </div>
        </div>

        {/* Unread Metric & Mark-All-Read Button */}
        <div className="shrink-0 flex flex-col items-stretch lg:items-end gap-3 min-w-[200px]">
          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center w-full">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              Unread Alerts
            </span>
            <span className="text-3xl font-bold text-[#1F6B4F] font-heading block mt-0.5">
              {summary.unreadCount}
            </span>
            <span className="text-[10px] text-[#1F6B4F] font-semibold block">
              {summary.unreadCount > 0 ? '● Action Needed' : '✓ All Up To Date'}
            </span>
          </div>

          {summary.unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="w-4 h-4" />}
              onClick={onMarkAllRead}
              className="w-full text-xs"
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default NotificationHeaderBanner
