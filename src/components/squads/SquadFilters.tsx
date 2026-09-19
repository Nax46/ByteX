import React from 'react'
import { SquadRole } from '@/types/squad.types'

interface SquadFiltersProps {
  viewMode: 'MY_SQUAD' | 'ALL_SQUADS'
  roleFilter: 'ALL' | SquadRole
  onViewModeChange: (mode: 'MY_SQUAD' | 'ALL_SQUADS') => void
  onRoleChange: (role: 'ALL' | SquadRole) => void
}

export const SquadFilters: React.FC<SquadFiltersProps> = ({
  viewMode,
  roleFilter,
  onViewModeChange,
  onRoleChange,
}) => {
  const roleOptions: { label: string; value: 'ALL' | SquadRole }[] = [
    { label: 'All Roles', value: 'ALL' },
    { label: 'Backend API', value: 'BACKEND' },
    { label: 'Frontend UI', value: 'FRONTEND' },
    { label: 'Database', value: 'DATABASE' },
    { label: 'UI/UX Design', value: 'UI_UX' },
    { label: 'Full Stack', value: 'FULL_STACK' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E5E5DF]">
      {/* View Mode Switcher */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onViewModeChange('MY_SQUAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'MY_SQUAD'
              ? 'bg-[#1F6B4F] text-white shadow-xs'
              : 'bg-[#F8F7F3] text-[#626763] hover:text-[#171918] border border-[#E5E5DF]'
          }`}
        >
          Active Squad Workspace
        </button>
        <button
          onClick={() => onViewModeChange('ALL_SQUADS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'ALL_SQUADS'
              ? 'bg-[#1F6B4F] text-white shadow-xs'
              : 'bg-[#F8F7F3] text-[#626763] hover:text-[#171918] border border-[#E5E5DF]'
          }`}
        >
          Explore All Squads
        </button>
      </div>

      {/* Role Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {roleOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onRoleChange(opt.value)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              roleFilter === opt.value
                ? 'bg-[#D8E8DE] text-[#1F6B4F] border border-[#C2D8C9] font-bold'
                : 'bg-white text-[#626763] hover:text-[#171918]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SquadFilters
