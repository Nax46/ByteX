import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { resourcesApi } from '@/api/endpoints/resources.api'
import { LearningResource } from '@/types/resource.types'
import { ROUTES } from '@/constants/routes'
import { Search, ExternalLink, Clock, BookOpen, X, SlidersHorizontal, AlertCircle } from 'lucide-react'

type SortOption = 'RECOMMENDED' | 'TITLE_ASC' | 'TITLE_DESC' | 'RATING_DESC'

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL')
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<SortOption>('RECOMMENDED')

  const loadResources = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data = await resourcesApi.getRecommendedResources()
      setResources(data || [])
    } catch (err: unknown) {
      console.error('Failed to load learning resources:', err)
      const message =
        err instanceof Error ? err.message : 'Failed to load recommended learning resources from server.'
      setErrorMsg(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const handleToggleCompleted = async (res: LearningResource) => {
    const nextCompleted = !res.isCompleted
    try {
      await resourcesApi.markCompleted(res.id, nextCompleted)
      setResources((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, isCompleted: nextCompleted } : r))
      )
    } catch (err) {
      console.error('Failed to update resource completion:', err)
    }
  }

  // Derived filter options
  const skillsList = useMemo(() => {
    const uniqueSkills = Array.from(new Set(resources.map((r) => r.skillTag).filter(Boolean)))
    return ['ALL', ...uniqueSkills]
  }, [resources])

  const typesList = useMemo(() => {
    const uniqueTypes = Array.from(new Set(resources.map((r) => r.type).filter(Boolean)))
    return ['ALL', ...uniqueTypes]
  }, [resources])

  const levelsList = ['ALL', 'Beginner', 'Intermediate', 'Advanced']

  // Filter & Sort computation
  const filteredAndSortedResources = useMemo(() => {
    return resources
      .filter((item) => {
        const query = searchQuery.trim().toLowerCase()
        const matchesSearch =
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.skillTag?.toLowerCase().includes(query) ||
          item.provider?.toLowerCase().includes(query)

        const matchesSkill = selectedSkill === 'ALL' || item.skillTag === selectedSkill
        const matchesLevel =
          selectedLevel === 'ALL' || item.level?.toLowerCase() === selectedLevel.toLowerCase()
        const matchesType = selectedType === 'ALL' || item.type === selectedType

        return matchesSearch && matchesSkill && matchesLevel && matchesType
      })
      .sort((a, b) => {
        if (sortBy === 'TITLE_ASC') {
          return a.title.localeCompare(b.title)
        }
        if (sortBy === 'TITLE_DESC') {
          return b.title.localeCompare(a.title)
        }
        if (sortBy === 'RATING_DESC') {
          return (b.rating || 0) - (a.rating || 0)
        }
        // RECOMMENDED: Sort by recommendation relevanceScore first, then rating
        if (a.relevanceScore != null && b.relevanceScore != null) {
          return b.relevanceScore - a.relevanceScore
        }
        return (b.rating || 3) - (a.rating || 3)
      })
  }, [resources, searchQuery, selectedSkill, selectedLevel, selectedType, sortBy])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSkill !== 'ALL' ||
    selectedLevel !== 'ALL' ||
    selectedType !== 'ALL' ||
    sortBy !== 'RECOMMENDED'

  const resetAllFilters = () => {
    setSearchQuery('')
    setSelectedSkill('ALL')
    setSelectedLevel('ALL')
    setSelectedType('ALL')
    setSortBy('RECOMMENDED')
  }

  if (isLoading) {
    return <LoadingState message="Curating verified learning resources..." minHeight="min-h-[350px]" />
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Learning Resources"
        subtitle="Handpicked official documentation, practical courses, articles, and reference manuals."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Resources' },
        ]}
      />

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-xs font-semibold text-[#9B1C1C] flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#C81E1E] shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadResources} className="text-xs h-7">
            Retry
          </Button>
        </div>
      )}

      {/* Structured Search & Filter Component (Task 10) */}
      <Card className="p-5 sm:p-6 border-[#E5E5DF] bg-white shadow-xs space-y-4">
        {/* Top: Search Area */}
        <div className="space-y-1.5">
          <label htmlFor="resource-search" className="block text-xs font-bold uppercase tracking-wider text-[#626763]">
            Search
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E948F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="resource-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources by title, topic, or provider..."
              className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg pl-10 pr-10 py-2.5 text-sm text-[#171918] placeholder-[#8E948F] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E948F] hover:text-[#171918] p-1 rounded-md"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Row: [ Skill ] [ Level ] [ Type ] [ Sort ] */}
        <div className="pt-2 border-t border-[#E5E5DF]/70 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#626763]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#1F6B4F]" />
            <span>Filters & Organization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Skill Filter */}
            <div className="space-y-1">
              <label htmlFor="filter-skill" className="text-[11px] font-semibold text-[#626763]">
                Skill Topic
              </label>
              <select
                id="filter-skill"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
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

            {/* 2. Level Filter */}
            <div className="space-y-1">
              <label htmlFor="filter-level" className="text-[11px] font-semibold text-[#626763]">
                Skill Level
              </label>
              <select
                id="filter-level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
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

            {/* 3. Type Filter */}
            <div className="space-y-1">
              <label htmlFor="filter-type" className="text-[11px] font-semibold text-[#626763]">
                Resource Type
              </label>
              <select
                id="filter-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg px-3 py-2 text-xs font-medium text-[#171918] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
              >
                <option value="ALL">All Types</option>
                {typesList
                  .filter((t) => t !== 'ALL')
                  .map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
              </select>
            </div>

            {/* 4. Sort Order */}
            <div className="space-y-1">
              <label htmlFor="filter-sort" className="text-[11px] font-semibold text-[#626763]">
                Sort By
              </label>
              <select
                id="filter-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg px-3 py-2 text-xs font-medium text-[#171918] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
              >
                <option value="RECOMMENDED">Recommended</option>
                <option value="TITLE_ASC">Title (A - Z)</option>
                <option value="TITLE_DESC">Title (Z - A)</option>
                <option value="RATING_DESC">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info & Active Filter Tags Bar */}
        <div className="pt-2 border-t border-[#E5E5DF]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#171918]">
              Showing {filteredAndSortedResources.length} of {resources.length} resources
            </span>

            {selectedSkill !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE]/60 text-[#1F6B4F] text-[11px] font-medium">
                Skill: {selectedSkill}
                <button type="button" onClick={() => setSelectedSkill('ALL')} className="hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedLevel !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE]/60 text-[#1F6B4F] text-[11px] font-medium">
                Level: {selectedLevel}
                <button type="button" onClick={() => setSelectedLevel('ALL')} className="hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D8E8DE]/60 text-[#1F6B4F] text-[11px] font-medium">
                Type: {selectedType}
                <button type="button" onClick={() => setSelectedType('ALL')} className="hover:text-black">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs text-[#1F6B4F] hover:underline font-semibold cursor-pointer shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Resource Cards Grid */}
      {filteredAndSortedResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredAndSortedResources.map((res, index) => {
            const staggerClass =
              index % 4 === 0 ? 'stagger-1' : index % 4 === 1 ? 'stagger-2' : index % 4 === 2 ? 'stagger-3' : 'stagger-4'

            return (
              <Card
                key={res.id}
                className={`p-5 sm:p-6 border-[#E5E5DF] bg-white flex flex-col justify-between space-y-4 hover-lift animate-slideUp ${staggerClass} group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="forest" size="sm">{res.skillTag || 'Curriculum'}</Badge>
                      {res.level && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#E5E5DF] bg-[#F8F7F3] text-[#626763]">
                          {res.level}
                        </span>
                      )}
                      {res.relevanceScore != null && (
                        <Badge variant="outline" size="sm" className="text-[10px] text-[#1F6B4F] border-[#1F6B4F]/30 bg-[#1F6B4F]/5 font-mono">
                          {Math.round(res.relevanceScore)}% Match
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#8E948F]">
                      <span className="font-semibold text-[#626763]">{res.type}</span>
                      <span>•</span>
                      <span>{res.provider}</span>
                    </div>
                  </div>

                  <h3 className="font-heading text-base font-bold text-[#171918] leading-snug group-hover:text-[#1F6B4F] transition-colors duration-200">
                    {res.title}
                  </h3>

                  <p className="text-xs text-[#626763] leading-relaxed line-clamp-2">
                    {res.description}
                  </p>

                  <div className="pt-1">
                    <ProgressBar
                      value={res.isCompleted ? 100 : 0}
                      size="sm"
                      variant="forest"
                      label={res.isCompleted ? 'Completed' : 'Not completed'}
                      showPercentage={res.isCompleted}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between text-xs gap-2">
                  <span className="text-[#626763] flex items-center gap-1.5 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                    {res.estimatedDuration || 'Self-paced'}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCompleted(res)}
                      className="text-xs"
                    >
                      {res.isCompleted ? 'Mark Incomplete' : 'Mark Done'}
                    </Button>
                    <a
                      href={res.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] rounded-lg"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        Open
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : resources.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center space-y-4 bg-white border-[#E5E5DF]">
          <BookOpen className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No recommended resources found</h3>
          <p className="text-xs sm:text-sm text-[#626763] max-w-md mx-auto">
            Complete your diagnostic assessment or explore curriculum modules to receive personalized learning materials.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadResources}
          >
            Refresh Recommendations
          </Button>
        </Card>
      ) : (
        <Card className="p-8 sm:p-12 text-center space-y-4 bg-white border-[#E5E5DF]">
          <BookOpen className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No resources match your filters</h3>
          <p className="text-xs sm:text-sm text-[#626763] max-w-md mx-auto">
            Try adjusting your search keywords, switching skill categories, or resetting filters to view all available materials.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllFilters}
          >
            Reset All Filters
          </Button>
        </Card>
      )}
    </div>
  )
}
