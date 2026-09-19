import React, { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/hooks/useAuth'

import { challengesApi } from '@/api/endpoints/challenges.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { PracticalChallenge } from '@/types/challenge.types'
import { SkillGap } from '@/types/skill.types'
import { ROUTES } from '@/constants/routes'
import { Link } from 'react-router-dom'
import { Dumbbell, Compass, Map, Target, Calendar, AlertTriangle, RefreshCw, Award, FolderGit2 } from 'lucide-react'

// Subcomponents
import { ChallengeHeaderBanner } from '@/components/challenges/ChallengeHeaderBanner'
import { RecommendedChallengeSpotlight } from '@/components/challenges/RecommendedChallengeSpotlight'
import { ChallengeCard } from '@/components/challenges/ChallengeCard'
import { ChallengeFiltersBar } from '@/components/challenges/ChallengeFiltersBar'
import { ChallengeWorkspaceModal } from '@/components/challenges/ChallengeWorkspaceModal'

export const ChallengesPage: React.FC = () => {
  const { user } = useAuth()
  const careerGoal = user?.careerGoal || user?.targetCareer || 'Full Stack Developer'

  const [challenges, setChallenges] = useState<PracticalChallenge[]>([])
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Active Challenge Modal State
  const [activeChallenge, setActiveChallenge] = useState<PracticalChallenge | null>(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [gapsData, challengesData] = await Promise.all([
        skillsApi.getSkillGaps().catch(() => []),
        challengesApi.getChallenges().catch(() => []),
      ])

      setSkillGaps(gapsData || [])
      setChallenges(challengesData || [])
    } catch (err: unknown) {
      console.error('Failed to load practical challenges:', err)
      setError('Failed to load practical challenges. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Priority Focus Skill & Spotlight Challenge
  const prioritySkill = useMemo(() => {
    if (!skillGaps || skillGaps.length === 0) return null
    return [...skillGaps].sort((a, b) => b.gap - a.gap || (a.priority === 'HIGH' ? -1 : 1))[0]
  }, [skillGaps])

  const topChallenge = useMemo(() => {
    if (!challenges || challenges.length === 0) return null
    if (prioritySkill) {
      const matched = challenges.find(
        (c) => c.skillTag.toLowerCase() === prioritySkill.skillName.toLowerCase()
      )
      if (matched) return matched
    }
    return challenges[0]
  }, [challenges, prioritySkill])

  const handleChallengeCompleted = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, status: 'COMPLETED' } : c))
    )
  }

  // Derived Filter Options
  const skillsList = useMemo(() => {
    const uniqueSkills = Array.from(new Set(challenges.map((c) => c.skillTag).filter(Boolean)))
    return ['ALL', ...uniqueSkills]
  }, [challenges])

  const categoriesList = useMemo(() => {
    const uniqueCategories = Array.from(new Set(challenges.map((c) => c.category).filter(Boolean)))
    return ['ALL', ...uniqueCategories]
  }, [challenges])

  const difficultiesList = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']

  // Filter Computation
  const filteredChallenges = useMemo(() => {
    return challenges.filter((item) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.problemStatement.toLowerCase().includes(query) ||
        item.skillTag.toLowerCase().includes(query)

      const matchesSkill =
        selectedSkill === 'ALL' || item.skillTag.toLowerCase() === selectedSkill.toLowerCase()

      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory

      const matchesDifficulty =
        selectedDifficulty === 'ALL' || item.difficulty === selectedDifficulty

      return matchesSearch && matchesSkill && matchesCategory && matchesDifficulty
    })
  }, [challenges, searchQuery, selectedSkill, selectedCategory, selectedDifficulty])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSkill !== 'ALL' ||
    selectedCategory !== 'ALL' ||
    selectedDifficulty !== 'ALL'

  const resetAllFilters = () => {
    setSearchQuery('')
    setSelectedSkill('ALL')
    setSelectedCategory('ALL')
    setSelectedDifficulty('ALL')
  }

  const completedCount = useMemo(() => {
    return challenges.filter((c) => c.status === 'COMPLETED').length
  }, [challenges])

  if (isLoading) {
    return <LoadingState message="Loading career-aligned practical challenges & micro-drills..." minHeight="min-h-[400px]" />
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
        title="Practical Challenge Engine"
        subtitle="Timed micro-drills and hands-on scenario challenges to prove your capability on active skill gaps."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Challenges' },
        ]}
      />

      {/* 1. Header Banner */}
      <ChallengeHeaderBanner
        careerGoal={careerGoal}
        totalChallengesCount={challenges.length}
        completedCount={completedCount}
        activeGapsCount={skillGaps.filter((g) => g.gap > 0).length}
      />

      {/* 2. Priority Practical Challenge Spotlight */}
      {topChallenge && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-heading text-lg font-bold text-[#171918] flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#1F6B4F]" />
              Priority Practical Challenge
            </h2>

            <div className="flex items-center gap-2 text-xs">
              <Link to={ROUTES.TODAY}>
                <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Calendar className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
                  Today&apos;s Focus
                </Button>
              </Link>
            </div>
          </div>

          <RecommendedChallengeSpotlight
            challenge={topChallenge}
            prioritySkill={prioritySkill}
            onAttempt={(c) => setActiveChallenge(c)}
          />
        </section>
      )}

      {/* 3. Cross-Page Navigation Integration Bar */}
      <Card className="p-4 bg-[#F8F7F3] border-[#E5E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-[#626763]">
          <Compass className="w-4 h-4 text-[#1F6B4F] shrink-0" />
          <span>
            Demonstrated challenge results feed directly into your <strong className="text-[#171918]">Skill Evidence</strong> and <strong className="text-[#171918]">Career Readiness</strong>.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
          <Link to={ROUTES.SKILL_EVIDENCE}>
            <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Award className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
              Skill Evidence
            </Button>
          </Link>
          <Link to={ROUTES.PROJECTS}>
            <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<FolderGit2 className="w-3.5 h-3.5" />}>
              Projects
            </Button>
          </Link>
          <Link to={ROUTES.ROADMAP}>
            <Button variant="primary" size="sm" className="text-xs font-bold" rightIcon={<Map className="w-3.5 h-3.5" />}>
              Roadmap
            </Button>
          </Link>
        </div>
      </Card>

      {/* 4. Complete Drills Catalog & Filters */}
      <section className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="font-heading text-lg font-bold text-[#171918]">
            Practical Micro-Drill Catalog
          </h2>
          <p className="text-xs text-[#626763]">
            Browse interactive drills by category, difficulty, or skill topic.
          </p>
        </div>

        <ChallengeFiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSkill={selectedSkill}
          onSkillChange={setSelectedSkill}
          skillsList={skillsList}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categoriesList={categoriesList}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          difficultiesList={difficultiesList}
          totalCount={challenges.length}
          filteredCount={filteredChallenges.length}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetAllFilters}
        />

        {/* Catalog Grid */}
        {filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChallenges.map((item, index) => {
              const staggerClass =
                index % 3 === 0 ? 'stagger-1' : index % 3 === 1 ? 'stagger-2' : 'stagger-3'

              return (
                <ChallengeCard
                  key={item.id}
                  challenge={item}
                  onAttempt={(c) => setActiveChallenge(c)}
                  staggerClass={staggerClass}
                />
              )
            })}
          </div>
        ) : (
          <Card className="p-8 sm:p-12 text-center space-y-4 bg-white border-[#E5E5DF]">
            <Dumbbell className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
            <h3 className="font-heading text-lg font-bold text-[#171918]">
              No practical drills match your active filters
            </h3>
            <p className="text-xs sm:text-sm text-[#626763] max-w-md mx-auto">
              Try adjusting your search keywords, switching categories, or resetting filters to view all available micro-drills.
            </p>
            <Button variant="outline" size="sm" onClick={resetAllFilters}>
              Reset All Filters
            </Button>
          </Card>
        )}
      </section>

      {/* 5. Interactive Challenge Workspace Modal */}
      <ChallengeWorkspaceModal
        challenge={activeChallenge}
        onClose={() => setActiveChallenge(null)}
        onCompleted={handleChallengeCompleted}
      />
    </div>
  )
}

export default ChallengesPage
