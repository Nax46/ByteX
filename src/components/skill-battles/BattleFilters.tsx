import React from 'react'
import { BattleCategory } from '@/types/battle.types'

interface BattleFiltersProps {
  statusFilter: 'ALL' | 'AVAILABLE' | 'COMPLETED'
  categoryFilter: 'ALL' | BattleCategory
  onStatusChange: (status: 'ALL' | 'AVAILABLE' | 'COMPLETED') => void
  onCategoryChange: (category: 'ALL' | BattleCategory) => void
}

export const BattleFilters: React.FC<BattleFiltersProps> = ({
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
}) => {
  const statusOptions: { label: string; value: 'ALL' | 'AVAILABLE' | 'COMPLETED' }[] = [
    { label: 'All Battles', value: 'ALL' },
    { label: '● Available', value: 'AVAILABLE' },
    { label: '✓ Completed', value: 'COMPLETED' },
  ]

  const categoryOptions: { label: string; value: 'ALL' | BattleCategory }[] = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'API Architecture', value: 'API' },
    { label: 'Frontend', value: 'FRONTEND' },
    { label: 'Database', value: 'DATABASE' },
    { label: 'System Design', value: 'SYSTEM_DESIGN' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E5E5DF]">
      {/* Status Filter */}
      <div className="flex flex-wrap items-center gap-1.5">
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

      {/* Category Filter */}
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

export default BattleFilters
