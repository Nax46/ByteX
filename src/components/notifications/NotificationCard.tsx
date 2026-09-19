import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CareerNotification } from '@/types/notification.types'
import {
  Bell,
  Code,
  FolderGit2,
  FileText,
  ShieldCheck,
  Map,
  Award,
  Users,
  Target,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react'

interface NotificationCardProps {
  notification: CareerNotification
  onMarkRead: (id: string) => void
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
}) => {
  const getCategoryIcon = () => {
    switch (notification.category) {
      case 'ASSESSMENT':
        return <FileText className="w-5 h-5 text-[#1F6B4F]" />
      case 'CHALLENGE':
        return <Code className="w-5 h-5 text-[#1F6B4F]" />
      case 'PROJECT':
        return <FolderGit2 className="w-5 h-5 text-[#1F6B4F]" />
      case 'EVIDENCE':
        return <ShieldCheck className="w-5 h-5 text-[#1F6B4F]" />
      case 'ROADMAP':
        return <Map className="w-5 h-5 text-[#1F6B4F]" />
      case 'ACHIEVEMENTS':
        return <Award className="w-5 h-5 text-[#1F6B4F]" />
      case 'COLLABORATION':
        return <Users className="w-5 h-5 text-[#1F6B4F]" />
      default:
        return <Bell className="w-5 h-5 text-[#1F6B4F]" />
    }
  }

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    if (diffHours < 1) return 'Just now'
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  return (
    <Card
      glass="interactive"
      className={`p-5 border-white/80 animate-slideUp transition-all relative ${
        !notification.isRead
          ? 'bg-[#F8F7F3] border-[#1F6B4F]/40 shadow-xs ring-1 ring-[#1F6B4F]/20'
          : 'bg-white border-[#E5E5DF] opacity-90'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Icon & Notification Content */}
        <div className="flex items-start gap-3.5 flex-1">
          <span
            className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
              !notification.isRead ? 'bg-[#D8E8DE] text-[#1F6B4F]' : 'bg-[#F8F7F3] text-[#626763]'
            }`}
          >
            {getCategoryIcon()}
          </span>

          <div className="space-y-2 flex-1">
            {/* Title Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#1F6B4F] ring-2 ring-white shrink-0" />
              )}
              <h3 className="font-heading text-base font-bold text-[#171918]">
                {notification.title}
              </h3>
              <Badge variant={!notification.isRead ? 'forest' : 'outline'} size="sm">
                {notification.category}
              </Badge>
              {notification.priority === 'HIGH' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                  High Impact
                </span>
              )}
            </div>

            {/* Message Body */}
            <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
              {notification.message}
            </p>

            {/* Why This Matters Callout */}
            <div className="p-3 rounded-lg bg-white border border-[#E5E5DF] text-xs space-y-1">
              <span className="text-[11px] font-bold text-[#1F6B4F] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Why This Matters to Your Career Goal
              </span>
              <p className="text-[#171918] leading-relaxed">
                {notification.whyItMatters}
              </p>
            </div>

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#626763] pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#626763]" />
                {formatRelativeTime(notification.createdAt)}
              </span>
              {notification.relatedSkill && (
                <>
                  <span>•</span>
                  <span>Related Skill: <strong className="text-[#1F6B4F]">{notification.relatedSkill}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E5DF]">
          <Link to={notification.actionUrl} onClick={() => onMarkRead(notification.id)}>
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              {notification.actionLabel}
            </Button>
          </Link>

          {!notification.isRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="text-[11px] font-semibold text-[#626763] hover:text-[#1F6B4F] flex items-center gap-1 py-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Read
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default NotificationCard
