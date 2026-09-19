import React from 'react'
import { Card } from '@/components/ui/Card'
import { Search, X, SlidersHorizontal, ClipboardCheck, Dumbbell, FolderGit2, Map, Layers } from 'lucide-react'

interface EvidenceFiltersBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSkill: string
  onSkillChange: (skill: string) => void
  skillsList: string[]
  selectedSource: string
  onSourceChange: (source: string) => void
  sourcesList: string[]
  totalCount: number
  filteredCount: number
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export const EvidenceFiltersBar: React.FC<EvidenceFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSkill,
  onSkillChange,
  skillsList,
  selectedSource,
  onSourceChange,
  sourcesList,
  totalCount,
  filteredCount,
  hasActiveFilters,
  onResetFilters,
}) => {
  const getSourceIcon = (source: string) => {
    switch (source.toUpperCase()) {
      case 'ASSESSMENT':
        return <ClipboardCheck className="w-3.5 h-3.5 inline mr-1" />
      case 'CHALLENGE':
        return <Dumbbell className="w-3.5 h-3.5 inline mr-1" />
      case 'PROJECT':
        return <FolderGit2 className="w-3.5 h-3.5 inline mr-1" />
      case 'ROADMAP_MILESTONE':
        return <Map className="w-3.5 h-3.5 inline mr-1" />
      default:
        return <Layers className="w-3.5 h-3.5 inline mr-1" />
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source.toUpperCase()) {
      case 'ALL':
        return 'All Sources'
      case 'ASSESSMENT':
        return 'Assessments'
      case 'CHALLENGE':
        return 'Challenges'
      case 'PROJECT':
        return 'Projects'
      case 'ROADMAP_MILESTONE':
        return 'Roadmap'
      default:
        return source
    }
  }

  return (
    <Card className="p-5 sm:p-6 border-[#E5E5DF] bg-white shadow-xs space-y-4">
      {/* Search Input */}
      <div className="space-y-1.5">
        <label htmlFor="evidence-search" className="block text-xs font-bold uppercase tracking-wider text-[#626763]">
          Search Evidence
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E948F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="evidence-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search evidence by title, skill topic, or result..."
            className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg pl-10 pr-10 py-2.5 text-sm text-[#171918] placeholder-[#8E948F] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E948F] hover:text-[#171918] p-1 rounded-md"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Source Quick Pills */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#626763]">
          Filter by Source
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {sourcesList.map((src) => {
            const isSelected = selectedSource === src
            return (
              <button
                key={src}
                type="button"
                onClick={() => onSourceChange(src)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F6B4F] text-white shadow-xs'
                    : 'bg-[#F8F7F3] text-[#626763] hover:bg-[#E5E5DF] hover:text-[#171918] border border-[#E5E5DF]'
                }`}
              >
                {src !== 'ALL' && getSourceIcon(src)}
                {getSourceLabel(src)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Skill Selector Row */}
      <div className="pt-3 border-t border-[#E5E5DF]/70 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#626763]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#1F6B4F]" />
          <span>Skill Filtering</span>
        </div>

        <div className="max-w-xs space-y-1">
          <label htmlFor="filter-evidence-skill" className="text-[11px] font-semibold text-[#626763]">
            Demonstrated Skill Topic
          </label>
          <select
            id="filter-evidence-skill"
            value={selectedSkill}
            onChange={(e) => onSkillChange(e.target.value)}
            className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg px-3 py-2 text-xs font-medium text-[#171918] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
          >
            <option value="ALL">All Skills</option>
            {skillsList
              .filter((s) => s !== 'ALL')
              .map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Results Info & Active Filter Badges */}
      <div className="pt-2 border-t border-[#E5E5DF]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#171918]">
            Showing {filteredCount} of {totalCount} verified evidence records
          </span>

          {selectedSkill !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-semibold">
              Skill: {selectedSkill}
              <button type="button" onClick={() => onSkillChange('ALL')} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedSource !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-semibold">
              Source: {getSourceLabel(selectedSource)}
              <button type="button" onClick={() => onSourceChange('ALL')} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-[#1F6B4F] hover:underline font-bold cursor-pointer shrink-0"
          >
            Reset Filters
          </button>
        )}
      </div>
    </Card>
  )
}
