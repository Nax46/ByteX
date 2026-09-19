import React from 'react'
import { Card } from '@/components/ui/Card'
import { Search, X, SlidersHorizontal, BookOpen, Video, FileText, Code2, Award, Layers } from 'lucide-react'

export type SortOption = 'RECOMMENDED' | 'TITLE_ASC' | 'TITLE_DESC' | 'RATING_DESC'

interface ResourceFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSkill: string
  onSkillChange: (skill: string) => void
  skillsList: string[]
  selectedLevel: string
  onLevelChange: (level: string) => void
  levelsList: string[]
  selectedType: string
  onTypeChange: (type: string) => void
  typesList: string[]
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  totalCount: number
  filteredCount: number
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedSkill,
  onSkillChange,
  skillsList,
  selectedLevel,
  onLevelChange,
  levelsList,
  selectedType,
  onTypeChange,
  typesList,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
  hasActiveFilters,
  onResetFilters,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'COURSE':
        return <BookOpen className="w-3.5 h-3.5 inline mr-1" />
      case 'VIDEO':
        return <Video className="w-3.5 h-3.5 inline mr-1" />
      case 'ARTICLE':
        return <FileText className="w-3.5 h-3.5 inline mr-1" />
      case 'DOCUMENTATION':
        return <Code2 className="w-3.5 h-3.5 inline mr-1" />
      case 'PRACTICE':
      case 'PROJECT':
        return <Award className="w-3.5 h-3.5 inline mr-1" />
      default:
        return <Layers className="w-3.5 h-3.5 inline mr-1" />
    }
  }

  return (
    <Card className="p-5 sm:p-6 border-[#E5E5DF] bg-white shadow-xs space-y-4">
      {/* Search Bar */}
      <div className="space-y-1.5">
        <label htmlFor="resource-search" className="block text-xs font-bold uppercase tracking-wider text-[#626763]">
          Search Resources
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E948F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="resource-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search resources by title, topic, or provider..."
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

      {/* Resource Type Quick Pills */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#626763]">
          Filter by Type
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {typesList.map((t) => {
            const isSelected = selectedType === t
            const label = t === 'ALL' ? 'All Types' : t
            return (
              <button
                key={t}
                type="button"
                onClick={() => onTypeChange(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F6B4F] text-white shadow-xs'
                    : 'bg-[#F8F7F3] text-[#626763] hover:bg-[#E5E5DF] hover:text-[#171918] border border-[#E5E5DF]'
                }`}
              >
                {t !== 'ALL' && getTypeIcon(t)}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Advanced Filters Row: Skill | Level | Sort */}
      <div className="pt-3 border-t border-[#E5E5DF]/70 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#626763]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#1F6B4F]" />
          <span>Skill & Difficulty Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Skill Tag Dropdown */}
          <div className="space-y-1">
            <label htmlFor="filter-skill" className="text-[11px] font-semibold text-[#626763]">
              Skill Topic
            </label>
            <select
              id="filter-skill"
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

          {/* Level Dropdown */}
          <div className="space-y-1">
            <label htmlFor="filter-level" className="text-[11px] font-semibold text-[#626763]">
              Difficulty Level
            </label>
            <select
              id="filter-level"
              value={selectedLevel}
              onChange={(e) => onLevelChange(e.target.value)}
              className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg px-3 py-2 text-xs font-medium text-[#171918] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
            >
              <option value="ALL">All Levels</option>
              {levelsList
                .filter((l) => l !== 'ALL')
                .map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="space-y-1">
            <label htmlFor="filter-sort" className="text-[11px] font-semibold text-[#626763]">
              Sort Order
            </label>
            <select
              id="filter-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg px-3 py-2 text-xs font-medium text-[#171918] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
            >
              <option value="RECOMMENDED">Recommended (Career Match)</option>
              <option value="TITLE_ASC">Title (A - Z)</option>
              <option value="TITLE_DESC">Title (Z - A)</option>
              <option value="RATING_DESC">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info & Active Filter Tags Bar */}
      <div className="pt-2 border-t border-[#E5E5DF]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#171918]">
            Showing {filteredCount} of {totalCount} resources
          </span>

          {selectedSkill !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-semibold">
              Skill: {selectedSkill}
              <button type="button" onClick={() => onSkillChange('ALL')} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedLevel !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-semibold">
              Level: {selectedLevel}
              <button type="button" onClick={() => onLevelChange('ALL')} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedType !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-semibold">
              Type: {selectedType}
              <button type="button" onClick={() => onTypeChange('ALL')} className="hover:text-black">
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
