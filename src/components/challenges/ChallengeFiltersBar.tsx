import React from 'react'
import { Card } from '@/components/ui/Card'
import { Search, X, SlidersHorizontal, Code2, Bug, Database, Layers, Terminal } from 'lucide-react'

interface ChallengeFiltersBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSkill: string
  onSkillChange: (skill: string) => void
  skillsList: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categoriesList: string[]
  selectedDifficulty: string
  onDifficultyChange: (difficulty: string) => void
  difficultiesList: string[]
  totalCount: number
  filteredCount: number
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export const ChallengeFiltersBar: React.FC<ChallengeFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSkill,
  onSkillChange,
  skillsList,
  selectedCategory,
  onCategoryChange,
  categoriesList,
  selectedDifficulty,
  onDifficultyChange,
  difficultiesList,
  totalCount,
  filteredCount,
  hasActiveFilters,
  onResetFilters,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toUpperCase()) {
      case 'CODING':
        return <Code2 className="w-3.5 h-3.5 inline mr-1" />
      case 'DEBUGGING':
        return <Bug className="w-3.5 h-3.5 inline mr-1" />
      case 'DATABASE':
        return <Database className="w-3.5 h-3.5 inline mr-1" />
      case 'API':
      case 'FRONTEND':
        return <Terminal className="w-3.5 h-3.5 inline mr-1" />
      default:
        return <Layers className="w-3.5 h-3.5 inline mr-1" />
    }
  }

  return (
    <Card className="p-5 sm:p-6 border-[#E5E5DF] bg-white shadow-xs space-y-4">
      {/* Search Input */}
      <div className="space-y-1.5">
        <label htmlFor="challenge-search" className="block text-xs font-bold uppercase tracking-wider text-[#626763]">
          Search Practical Drills
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E948F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="challenge-search"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search challenges by title, problem statement, or skill topic..."
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

      {/* Category Pills */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#626763]">
          Filter by Category
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat
            const label = cat === 'ALL' ? 'All Categories' : cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F6B4F] text-white shadow-xs'
                    : 'bg-[#F8F7F3] text-[#626763] hover:bg-[#E5E5DF] hover:text-[#171918] border border-[#E5E5DF]'
                }`}
              >
                {cat !== 'ALL' && getCategoryIcon(cat)}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Skill & Difficulty Row */}
      <div className="pt-3 border-t border-[#E5E5DF]/70 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#626763]">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#1F6B4F]" />
          <span>Skill & Difficulty Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Skill Tag Dropdown */}
          <div className="space-y-1">
            <label htmlFor="filter-challenge-skill" className="text-[11px] font-semibold text-[#626763]">
              Skill Topic
            </label>
            <select
              id="filter-challenge-skill"
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

          {/* Difficulty Level Selector */}
          <div className="space-y-1">
            <label htmlFor="filter-challenge-difficulty" className="text-[11px] font-semibold text-[#626763]">
              Difficulty Level
            </label>
            <select
              id="filter-challenge-difficulty"
              value={selectedDifficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg px-3 py-2 text-xs font-medium text-[#171918] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
            >
              <option value="ALL">All Difficulties</option>
              {difficultiesList
                .filter((d) => d !== 'ALL')
                .map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
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
            Showing {filteredCount} of {totalCount} practical drills
          </span>

          {selectedSkill !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-semibold">
              Skill: {selectedSkill}
              <button type="button" onClick={() => onSkillChange('ALL')} className="hover:text-black">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCategory !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-semibold">
              Category: {selectedCategory}
              <button type="button" onClick={() => onCategoryChange('ALL')} className="hover:text-black">
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
