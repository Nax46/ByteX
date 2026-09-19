import React, { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/hooks/useAuth'
import { projectsApi } from '@/api/endpoints/projects.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { RecommendedProject, ProjectRecommendation } from '@/types/project.types'
import { SkillGap } from '@/types/skill.types'
import { ROUTES } from '@/constants/routes'
import { Link } from 'react-router-dom'
import { Rocket, Compass, Map, Target, Calendar, AlertTriangle, RefreshCw, BookOpen } from 'lucide-react'

// Subcomponents
import { ProjectHeaderBanner } from '@/components/projects/ProjectHeaderBanner'
import { BuildThisNextCard } from '@/components/projects/BuildThisNextCard'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFiltersBar } from '@/components/projects/ProjectFiltersBar'
import { ProjectEmptyState } from '@/components/projects/ProjectEmptyState'

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth()
  const careerGoal = user?.careerGoal || user?.targetCareer || 'Full Stack Developer'

  const [projects, setProjects] = useState<RecommendedProject[]>([])
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([])
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [gapsData, catalogData] = await Promise.all([
        skillsApi.getSkillGaps().catch(() => []),
        projectsApi.getRecommendedProjects().catch(() => []),
      ])

      setSkillGaps(gapsData || [])
      setProjects(catalogData || [])

      // Identify top priority skill gap if available
      const topGap = gapsData && gapsData.length > 0
        ? [...gapsData].sort((a, b) => b.gap - a.gap || (a.priority === 'HIGH' ? -1 : 1))[0]
        : null

      const recs = await projectsApi.getProjectRecommendations(topGap?.skillName)
      setRecommendations(recs || [])
    } catch (err: unknown) {
      console.error('Failed to load project intelligence recommendations:', err)
      setError('Failed to load recommended projects. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Featured Build recommendation (#1 recommendation)
  const topRecommendation = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return null
    return recommendations[0]
  }, [recommendations])

  // Handle Project Status Update
  const handleUpdateStatus = async (
    projectId: string,
    nextStatus: RecommendedProject['status']
  ) => {
    try {
      await projectsApi.updateProjectStatus(projectId, nextStatus)
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: nextStatus } : p))
      )
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.project.id === projectId
            ? { ...rec, project: { ...rec.project, status: nextStatus } }
            : rec
        )
      )
    } catch (err) {
      console.error('Failed to update project status:', err)
    }
  }

  // Derived Filter Lists
  const skillsList = useMemo(() => {
    const allReinforced = projects.flatMap((p) => p.skillsReinforced || [])
    const uniqueSkills = Array.from(new Set(allReinforced.filter(Boolean)))
    return ['ALL', ...uniqueSkills]
  }, [projects])

  const difficultiesList = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']

  // Filter Computation
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.technologies?.some((t) => t.toLowerCase().includes(query)) ||
        item.skillsReinforced?.some((s) => s.toLowerCase().includes(query))

      const matchesSkill =
        selectedSkill === 'ALL' ||
        item.skillsReinforced?.some((s) => s.toLowerCase() === selectedSkill.toLowerCase())

      const matchesDifficulty =
        selectedDifficulty === 'ALL' || item.difficulty === selectedDifficulty

      return matchesSearch && matchesSkill && matchesDifficulty
    })
  }, [projects, searchQuery, selectedSkill, selectedDifficulty])

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedSkill !== 'ALL' || selectedDifficulty !== 'ALL'

  const resetAllFilters = () => {
    setSearchQuery('')
    setSelectedSkill('ALL')
    setSelectedDifficulty('ALL')
  }

  const inProgressCount = useMemo(() => {
    return projects.filter((p) => p.status === 'IN_PROGRESS').length
  }, [projects])

  if (isLoading) {
    return <LoadingState message="Calculating practical engineering project recommendations..." minHeight="min-h-[400px]" />
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
        title="Recommended Projects Intelligence"
        subtitle="Practical engineering builds tailored to your target career path, active skill gaps, and roadmap milestones."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Projects' },
        ]}
      />

      {/* 1. Career Context Header Banner */}
      <ProjectHeaderBanner
        careerGoal={careerGoal}
        totalProjectsCount={projects.length}
        inProgressCount={inProgressCount}
        activeGapsCount={skillGaps.filter((g) => g.gap > 0).length}
      />

      {/* 2. "Build This Next" Featured Recommendation */}
      {topRecommendation && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-heading text-lg font-bold text-[#171918] flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#1F6B4F]" />
              Your Next Build
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <Link to={ROUTES.TODAY}>
                <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Calendar className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
                  Today&apos;s Focus
                </Button>
              </Link>
            </div>
          </div>

          <BuildThisNextCard
            recommendation={topRecommendation}
            onUpdateStatus={handleUpdateStatus}
          />
        </section>
      )}

      {/* 3. Navigation & Cross-Page Integration Bar */}
      <Card className="p-4 bg-[#F8F7F3] border-[#E5E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-[#626763]">
          <Compass className="w-4 h-4 text-[#1F6B4F] shrink-0" />
          <span>
            Need help before building? View <strong className="text-[#171918]">Learning Resources</strong> or review your <strong className="text-[#171918]">Roadmap Modules</strong>.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <Link to={ROUTES.RESOURCES} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full text-xs font-semibold" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
              Learning Resources
            </Button>
          </Link>
          <Link to={ROUTES.SKILL_GAP} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full text-xs font-semibold" leftIcon={<Target className="w-3.5 h-3.5" />}>
              Skill Gap Report
            </Button>
          </Link>
          <Link to={ROUTES.ROADMAP} className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full text-xs font-bold" rightIcon={<Map className="w-3.5 h-3.5" />}>
              Learning Roadmap
            </Button>
          </Link>
        </div>
      </Card>

      {/* 4. Complete Project Catalog & Filters */}
      <section className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="font-heading text-lg font-bold text-[#171918]">
            Practical Project Catalog
          </h2>
          <p className="text-xs text-[#626763]">
            Explore all recommended builds reinforcing your target career skills.
          </p>
        </div>

        <ProjectFiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSkill={selectedSkill}
          onSkillChange={setSelectedSkill}
          skillsList={skillsList}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          difficultiesList={difficultiesList}
          totalCount={projects.length}
          filteredCount={filteredProjects.length}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetAllFilters}
        />

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredProjects.map((proj, index) => {
              const staggerClass =
                index % 4 === 0
                  ? 'stagger-1'
                  : index % 4 === 1
                  ? 'stagger-2'
                  : index % 4 === 2
                  ? 'stagger-3'
                  : 'stagger-4'

              return (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  onUpdateStatus={handleUpdateStatus}
                  staggerClass={staggerClass}
                />
              )
            })}
          </div>
        ) : (
          <ProjectEmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={resetAllFilters}
          />
        )}
      </section>
    </div>
  )
}
