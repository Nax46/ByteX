import React from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Search, Filter, Bookmark, Briefcase, Sparkles, CheckCircle } from 'lucide-react'
import { OpportunityFilterOptions } from '@/types/opportunity.types'

interface OpportunityFiltersProps {
  filters: OpportunityFilterOptions
  onChangeFilters: (newFilters: OpportunityFilterOptions) => void
  totalCount: number
  recommendedCount: number
  savedCount: number
  appliedCount: number
}

export const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  filters,
  onChangeFilters,
  totalCount,
  recommendedCount,
  savedCount,
  appliedCount,
}) => {
  const activeTab = filters.onlyApplied
    ? 'APPLIED'
    : filters.onlySaved
    ? 'SAVED'
    : filters.onlyRecommended
    ? 'RECOMMENDED'
    : 'ALL'

  const handleTabChange = (tab: 'ALL' | 'RECOMMENDED' | 'SAVED' | 'APPLIED') => {
    onChangeFilters({
      ...filters,
      onlyRecommended: tab === 'RECOMMENDED',
      onlySaved: tab === 'SAVED',
      onlyApplied: tab === 'APPLIED',
    })
  }

  return (
    <div className="space-y-4">
      {/* Search and Dropdowns */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Input
            value={filters.searchQuery}
            onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by title, organization, or skill..."
            className="pl-9 text-xs sm:text-sm"
          />
          <Search className="w-4 h-4 text-[#626763] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Opportunity Type Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filters.type}
            onChange={(e) => onChangeFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#171918] focus:outline-none focus:border-[#1F6B4F] shadow-2xs cursor-pointer w-1/2 sm:w-auto"
          >
            <option value="ALL">All Types</option>
            <option value="INTERNSHIP">Internships</option>
            <option value="JOB">Entry-Level Jobs</option>
            <option value="FREELANCE">Freelance Gigs</option>
            <option value="HACKATHON">Hackathons</option>
            <option value="OPEN_SOURCE">Open Source</option>
          </select>

          {/* Work Mode Select */}
          <select
            value={filters.workMode}
            onChange={(e) => onChangeFilters({ ...filters, workMode: e.target.value })}
            className="px-3 py-2 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#171918] focus:outline-none focus:border-[#1F6B4F] shadow-2xs cursor-pointer w-1/2 sm:w-auto"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>

          {/* Reset Filters */}
          {(filters.searchQuery || filters.type !== 'ALL' || filters.workMode !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChangeFilters({
                  ...filters,
                  searchQuery: '',
                  type: 'ALL',
                  workMode: 'ALL',
                })
              }
              className="text-xs text-[#626763]"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E5E5DF] pb-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => handleTabChange('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-[#1F6B4F] text-white shadow-2xs'
              : 'text-[#626763] hover:text-[#171918] hover:bg-[#D8E8DE]/30'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>All Listings</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('RECOMMENDED')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'RECOMMENDED'
              ? 'bg-[#1F6B4F] text-white shadow-2xs'
              : 'text-[#626763] hover:text-[#171918] hover:bg-[#D8E8DE]/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Recommended for You</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20">
            {recommendedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('SAVED')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'SAVED'
              ? 'bg-[#1F6B4F] text-white shadow-2xs'
              : 'text-[#626763] hover:text-[#171918] hover:bg-[#D8E8DE]/30'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {savedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('APPLIED')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'APPLIED'
              ? 'bg-[#1F6B4F] text-white shadow-2xs'
              : 'text-[#626763] hover:text-[#171918] hover:bg-[#D8E8DE]/30'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>My Applications</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {appliedCount}
          </span>
        </button>
      </div>
    </div>
  )
}
