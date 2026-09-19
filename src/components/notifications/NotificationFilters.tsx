import React from 'react'
import { NotificationCategory } from '@/types/notification.types'

interface NotificationFiltersProps {
  statusFilter: 'ALL' | 'UNREAD'
  categoryFilter: 'ALL' | NotificationCategory
  onStatusChange: (status: 'ALL' | 'UNREAD') => void
  onCategoryChange: (category: 'ALL' | NotificationCategory) => void
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
}) => {
  const statusOptions: { label: string; value: 'ALL' | 'UNREAD' }[] = [
    { label: 'All Alerts', value: 'ALL' },
    { label: '● Unread Only', value: 'UNREAD' },
  ]

  const categoryOptions: { label: string; value: 'ALL' | NotificationCategory }[] = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Career Goal', value: 'CAREER' },
    { label: 'Assessments', value: 'ASSESSMENT' },
    { label: 'Challenges', value: 'CHALLENGE' },
    { label: 'Projects', value: 'PROJECT' },
    { label: 'Skill Evidence', value: 'EVIDENCE' },
    { label: 'Roadmap', value: 'ROADMAP' },
    { label: 'Achievements', value: 'ACHIEVEMENTS' },
    { label: 'Collaboration', value: 'COLLABORATION' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E5E5DF]">
      {/* Unread Switcher */}
      <div className="flex items-center gap-1.5">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === opt.value
                ? 'bg-[#1F6B4F] text-white shadow-xs'
                : 'bg-[#F8F7F3] text-[#626763] hover:text-[#171918] border border-[#E5E5DF]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {categoryOptions.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              categoryFilter === cat.value
                ? 'bg-[#D8E8DE] text-[#1F6B4F] border border-[#C2D8C9] font-bold'
                : 'bg-white text-[#626763] hover:text-[#171918]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default NotificationFilters
