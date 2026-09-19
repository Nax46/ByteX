import React from 'react'
import { Card } from '@/components/ui/Card'
import { Search, X, SlidersHorizontal } from 'lucide-react'

interface ProjectFiltersBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSkill: string
  onSkillChange: (skill: string) => void
  skillsList: string[]
  selectedDifficulty: string
  onDifficultyChange: (difficulty: string) => void
  difficultiesList: string[]
  totalCount: number
  filteredCount: number
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export const ProjectFiltersBar: React.FC<ProjectFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSkill,
  onSkillChange,
  skillsList,
  selectedDifficulty,
  onDifficultyChange,
  difficultiesList,
  totalCount,
  filteredCount,
  hasActiveFilters,
  onResetFilters,
}) => {
  return (
    <Card className="p-5 sm:p-6 border-[#E5E5DF] bg-white shadow-xs space-y-4">
      {/* Search Input */}
      <div className="space-y-1.5">
        <label htmlFor="project-search" className="block text-xs font-bold uppercase tracking-wider text-[#626763]">
          Search Projects
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E948F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="project-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by title, technology, or reinforced skill..."
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

      {/* Difficulty Quick Pills & Skill Topic Filter */}
      <div className="pt-3 border-t border-[#E5E5DF]/70 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#626763]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#1F6B4F]" />
          <span>Filters & Categorization</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Difficulty Pills */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#626763]">
              Difficulty Level
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {difficultiesList.map((diff) => {
                const isSelected = selectedDifficulty === diff
                const label = diff === 'ALL' ? 'All Levels' : diff
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onDifficultyChange(diff)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F6B4F] text-white shadow-xs'
                        : 'bg-[#F8F7F3] text-[#626763] hover:bg-[#E5E5DF] hover:text-[#171918] border border-[#E5E5DF]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Skill Tag Selector Dropdown */}
          <div className="space-y-1">
            <label htmlFor="filter-project-skill" className="text-[11px] font-semibold text-[#626763]">
              Reinforced Skill Topic
            </label>
            <select
              id="filter-project-skill"
              value={selectedSkill}
              onChange={(e) => onSkillChange(e.target.value)}
              className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg px-3 py-2 text-xs font-medium text-[#171918] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
            >
              <option value="ALL">All Reinforced Skills</option>
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
      </div>

      {/* Results Info & Active Filter Badges */}
      <div className="pt-2 border-t border-[#E5E5DF]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#171918]">
            Showing {filteredCount} of {totalCount} recommended projects
          </span>

          {selectedSkill !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-semibold">
              Skill: {selectedSkill}
              <button type="button" onClick={() => onSkillChange('ALL')} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedDifficulty !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-semibold">
              Difficulty: {selectedDifficulty}
              <button type="button" onClick={() => onDifficultyChange('ALL')} className="hover:text-black">
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
