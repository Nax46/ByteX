import React, { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/hooks/useAuth'
import { resourcesApi } from '@/api/endpoints/resources.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { LearningResource, ResourceRecommendation } from '@/types/resource.types'
import { SkillGap } from '@/types/skill.types'
import { ROUTES } from '@/constants/routes'
import { Link } from 'react-router-dom'
import { Sparkles, Compass, Map, Target, Calendar, AlertTriangle, RefreshCw } from 'lucide-react'

// Subcomponents
import { CareerContextBanner } from '@/components/resources/CareerContextBanner'
import { PrioritySkillSpotlight } from '@/components/resources/PrioritySkillSpotlight'
import { RecommendedResourceCard } from '@/components/resources/RecommendedResourceCard'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { ResourceFilters, SortOption } from '@/components/resources/ResourceFilters'
import { ResourceEmptyState } from '@/components/resources/ResourceEmptyState'

export const ResourcesPage: React.FC = () => {
  const { user } = useAuth()
  const careerGoal = user?.careerGoal || user?.targetCareer || 'Full Stack Developer'

  const [resources, setResources] = useState<LearningResource[]>([])
  const [recommendations, setRecommendations] = useState<ResourceRecommendation[]>([])
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL')
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<SortOption>('RECOMMENDED')

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [gapsData, catalogData] = await Promise.all([
        skillsApi.getSkillGaps().catch(() => []),
        resourcesApi.getResources().catch(() => []),
      ])

      setSkillGaps(gapsData || [])
      setResources(catalogData || [])

      // Identify top priority skill gap if available
      const topGap = gapsData && gapsData.length > 0
        ? [...gapsData].sort((a, b) => b.gap - a.gap || (a.priority === 'HIGH' ? -1 : 1))[0]
        : null

      const recs = await resourcesApi.getRecommendedResources(topGap?.skillName)
      setRecommendations(recs || [])
    } catch (err: unknown) {
      console.error('Failed to load learning resources intelligence:', err)
      setError('Failed to load learning resources. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Priority Focus Skill
  const prioritySkill = useMemo(() => {
    if (!skillGaps || skillGaps.length === 0) return null
    return [...skillGaps].sort((a, b) => b.gap - a.gap || (a.priority === 'HIGH' ? -1 : 1))[0]
  }, [skillGaps])

  // Handle Mark Done / Toggle Completion
  const handleToggleCompleted = async (resItem: LearningResource) => {
    const nextCompleted = !resItem.isCompleted
    try {
      await resourcesApi.markCompleted(resItem.id, nextCompleted)
      setResources((prev) =>
        prev.map((r) => (r.id === resItem.id ? { ...r, isCompleted: nextCompleted } : r))
      )
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.resource.id === resItem.id
            ? { ...rec, resource: { ...rec.resource, isCompleted: nextCompleted } }
            : rec
        )
      )
    } catch (err) {
      console.error('Failed to update resource completion:', err)
    }
  }

  // Filter options derived from data
  const skillsList = useMemo(() => {
    const uniqueSkills = Array.from(new Set(resources.map((r) => r.skillTag).filter(Boolean)))
    return ['ALL', ...uniqueSkills]
  }, [resources])

  const typesList = useMemo(() => {
    const uniqueTypes = Array.from(new Set(resources.map((r) => r.type).filter(Boolean)))
    return ['ALL', ...uniqueTypes]
  }, [resources])

  const levelsList = ['ALL', 'Beginner', 'Intermediate', 'Advanced']

  // Filter & Sort Computation
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

        const matchesSkill =
          selectedSkill === 'ALL' || item.skillTag.toLowerCase() === selectedSkill.toLowerCase()
        const matchesLevel = selectedLevel === 'ALL' || item.level === selectedLevel
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
        // RECOMMENDED: Rating / completion priority
        return (b.rating || 4) - (a.rating || 4)
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

  const handleFilterByFocusSkill = (skillName: string) => {
    if (selectedSkill.toLowerCase() === skillName.toLowerCase()) {
      setSelectedSkill('ALL')
    } else {
      setSelectedSkill(skillName)
    }
  }

  if (isLoading) {
    return <LoadingState message="Curating career & skill-gap aligned resources..." minHeight="min-h-[400px]" />
  }

  if (error) {
    return (
      <Card className="p-8 text-center space-y-4 max-w-lg mx-auto my-12 border-red-200 bg-red-50/50">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="font-heading text-base font-bold text-red-900">{error}</h3>
        <Button variant="primary" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Try Again
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Learning Resources Intelligence"
        subtitle="Targeted documentation, courses, articles, and practice modules selected for your active skill gaps and career roadmap."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Resources' },
        ]}
      />

      {/* 1. Career Context Banner */}
      <CareerContextBanner
        careerGoal={careerGoal}
        totalResourcesCount={resources.length}
        recommendedCount={recommendations.length}
        activeGapsCount={skillGaps.filter((g) => g.gap > 0).length}
      />

      {/* 2. Priority Skill Focus Spotlight */}
      <PrioritySkillSpotlight
        prioritySkill={prioritySkill}
        onFilterByFocusSkill={handleFilterByFocusSkill}
        isFilteredByFocusSkill={
          !!prioritySkill && selectedSkill.toLowerCase() === prioritySkill.skillName.toLowerCase()
        }
      />

      {/* 3. Recommended For You Section */}
      {recommendations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-0.5">
              <h2 className="font-heading text-lg font-bold text-[#171918] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1F6B4F]" />
                Recommended For You
              </h2>
              <p className="text-xs text-[#626763]">
                Handpicked based on your verified skill gap scores and priority ranking.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Link to={ROUTES.TODAY}>
                <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Calendar className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
                  Start Today&apos;s Focus
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recommendations.map((rec) => (
              <RecommendedResourceCard
                key={rec.resource.id}
                recommendation={rec}
                onToggleCompleted={handleToggleCompleted}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Navigation & Cross-Page Integration Bar */}
      <Card className="p-4 bg-[#F8F7F3] border-[#E5E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-[#626763]">
          <Compass className="w-4 h-4 text-[#1F6B4F] shrink-0" />
          <span>
            Connect resources to your <strong className="text-[#171918]">Learning Roadmap</strong> modules or inspect your <strong className="text-[#171918]">Skill Gap Report</strong>.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link to={ROUTES.SKILL_GAP} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full text-xs font-semibold" leftIcon={<Target className="w-3.5 h-3.5" />}>
              Skill Gap Report
            </Button>
          </Link>
          <Link to={ROUTES.ROADMAP} className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full text-xs font-bold" rightIcon={<Map className="w-3.5 h-3.5" />}>
              Roadmap Modules
            </Button>
          </Link>
        </div>
      </Card>

      {/* 5. Complete Resource Catalog with Structured Filters */}
      <section className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="font-heading text-lg font-bold text-[#171918]">
            Resource Catalog
          </h2>
          <p className="text-xs text-[#626763]">
            Browse all verified learning materials by topic, difficulty, or media type.
          </p>
        </div>

        <ResourceFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSkill={selectedSkill}
          onSkillChange={setSelectedSkill}
          skillsList={skillsList}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          levelsList={levelsList}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          typesList={typesList}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={resources.length}
          filteredCount={filteredAndSortedResources.length}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetAllFilters}
        />

        {/* Catalog Grid */}
        {filteredAndSortedResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredAndSortedResources.map((res, index) => {
              const staggerClass =
                index % 4 === 0
                  ? 'stagger-1'
                  : index % 4 === 1
                  ? 'stagger-2'
                  : index % 4 === 2
                  ? 'stagger-3'
                  : 'stagger-4'

              return (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  onToggleCompleted={handleToggleCompleted}
                  staggerClass={staggerClass}
                />
              )
            })}
          </div>
        ) : (
          <ResourceEmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={resetAllFilters}
          />
        )}
      </section>
    </div>
  )
}
