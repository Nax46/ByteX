import React, { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/hooks/useAuth'

import { careersApi, BackendCareerReadiness } from '@/api/endpoints/careers.api'
import { profileApi } from '@/api/endpoints/profile.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { roadmapApi } from '@/api/endpoints/roadmap.api'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { projectsApi } from '@/api/endpoints/projects.api'

import { UserStats } from '@/types/user.types'
import { SkillGap } from '@/types/skill.types'
import { Roadmap } from '@/types/roadmap.types'
import { AssessmentResult } from '@/types/assessment.types'
import { RecommendedProject } from '@/types/project.types'

import { ROUTES } from '@/constants/routes'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// Subcomponents
import { ReadinessHeaderBanner } from '@/components/career-readiness/ReadinessHeaderBanner'
import { ReadinessMetricsCard } from '@/components/career-readiness/ReadinessMetricsCard'
import { CareerSkillRequirementsTable } from '@/components/career-readiness/CareerSkillRequirementsTable'
import { StrongAndGapSpotlight } from '@/components/career-readiness/StrongAndGapSpotlight'
import { ReadinessSupportingSignals } from '@/components/career-readiness/ReadinessSupportingSignals'
import { ReadinessNextMoveCard } from '@/components/career-readiness/ReadinessNextMoveCard'

export const CareerReadinessPage: React.FC = () => {
  const { user } = useAuth()
  const careerGoal = user?.careerGoal || user?.targetCareer || 'Full Stack Developer'
  const careerSlug = careerGoal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'full-stack-developer'

  const [readinessData, setReadinessData] = useState<BackendCareerReadiness | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [latestAssessment, setLatestAssessment] = useState<AssessmentResult | null>(null)
  const [projects, setProjects] = useState<RecommendedProject[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [
        readinessRes,
        statsRes,
        gapsRes,
        roadmapRes,
        assessmentRes,
        projectsRes,
      ] = await Promise.allSettled([
        careersApi.getCareerReadiness(careerSlug),
        profileApi.getUserStats(),
        skillsApi.getSkillGaps(),
        roadmapApi.getCurrentRoadmap(),
        assessmentApi.getLatestResult(),
        projectsApi.getRecommendedProjects(),
      ])

      if (readinessRes.status === 'fulfilled') setReadinessData(readinessRes.value)
      if (statsRes.status === 'fulfilled') setUserStats(statsRes.value)
      if (gapsRes.status === 'fulfilled') setSkillGaps(gapsRes.value || [])
      if (roadmapRes.status === 'fulfilled') setRoadmap(roadmapRes.value)
      if (assessmentRes.status === 'fulfilled') setLatestAssessment(assessmentRes.value)
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value || [])
    } catch (err: unknown) {
      console.error('Failed to load career readiness data:', err)
      setError('Failed to load career readiness intelligence. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [careerSlug])

  // Fallback / Derived Skill Breakdown if readiness endpoint is loading or offline
  const skillBreakdown = useMemo(() => {
    if (readinessData && readinessData.skillBreakdown && readinessData.skillBreakdown.length > 0) {
      return readinessData.skillBreakdown
    }

    // Construct derived breakdown from skillGaps
    return skillGaps.map((sg) => {
      const isMet = sg.currentLevel >= sg.targetLevel
      const isDeveloping = sg.currentLevel > 0 && sg.currentLevel < sg.targetLevel
      return {
        skillId: sg.skillId,
        name: sg.skillName,
        slug: sg.skillName.toLowerCase().replace(/\s+/g, '-'),
        category: sg.category || 'Core Skill',
        currentLevel: sg.currentLevel,
        requiredLevel: sg.targetLevel,
        gap: Math.max(0, sg.targetLevel - sg.currentLevel),
        importance: sg.priority === 'HIGH' ? 'CRITICAL' : 'HIGH',
        priorityScore: sg.priority === 'HIGH' ? 90 : 60,
        status: (isMet ? 'MET' : isDeveloping ? 'DEVELOPING' : 'NEEDS_WORK') as 'MET' | 'DEVELOPING' | 'NEEDS_WORK',
        prerequisites: [],
      }
    })
  }, [readinessData, skillGaps])

  // Readiness Metrics
  const metSkillsCount = useMemo(() => {
    if (readinessData?.readinessMetrics?.metSkillsCount !== undefined) {
      return readinessData.readinessMetrics.metSkillsCount
    }
    return skillBreakdown.filter((s) => s.status === 'MET').length
  }, [readinessData, skillBreakdown])

  const developingSkillsCount = useMemo(() => {
    if (readinessData?.readinessMetrics?.developingSkillsCount !== undefined) {
      return readinessData.readinessMetrics.developingSkillsCount
    }
    return skillBreakdown.filter((s) => s.status === 'DEVELOPING').length
  }, [readinessData, skillBreakdown])

  const needsWorkSkillsCount = useMemo(() => {
    if (readinessData?.readinessMetrics?.needsWorkSkillsCount !== undefined) {
      return readinessData.readinessMetrics.needsWorkSkillsCount
    }
    return skillBreakdown.filter((s) => s.status === 'NEEDS_WORK').length
  }, [readinessData, skillBreakdown])

  const totalRequiredSkills = useMemo(() => {
    if (readinessData?.readinessMetrics?.totalRequiredSkills !== undefined) {
      return readinessData.readinessMetrics.totalRequiredSkills
    }
    return skillBreakdown.length || 6
  }, [readinessData, skillBreakdown])

  const readinessScore = useMemo(() => {
    if (userStats?.careerReadiness !== undefined) {
      return userStats.careerReadiness
    }
    if (totalRequiredSkills > 0) {
      return Math.round((metSkillsCount / totalRequiredSkills) * 100)
    }
    return 72
  }, [userStats, metSkillsCount, totalRequiredSkills])

  // Blocker Skill (#1 Gap)
  const blockerSkill = useMemo(() => {
    const sorted = [...skillBreakdown].sort((a, b) => b.gap - a.gap)
    return sorted.length > 0 && sorted[0].gap > 0 ? sorted[0] : null
  }, [skillBreakdown])

  // Roadmap & Projects summary counters
  const completedMilestonesCount = useMemo(() => {
    if (!roadmap || !roadmap.milestones) return 2
    return roadmap.milestones.filter((m) => m.status === 'COMPLETED').length
  }, [roadmap])

  const totalMilestonesCount = useMemo(() => {
    if (!roadmap || !roadmap.milestones) return 6
    return roadmap.milestones.length
  }, [roadmap])

  const completedProjectsCount = useMemo(() => {
    return projects.filter((p) => p.status === 'SUBMITTED').length
  }, [projects])

  const inProgressProjectsCount = useMemo(() => {
    return projects.filter((p) => p.status === 'IN_PROGRESS').length
  }, [projects])

  if (isLoading) {
    return <LoadingState message="Synthesizing career readiness index & competency benchmarks..." minHeight="min-h-[400px]" />
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
        title="Career Readiness Intelligence"
        subtitle="Quantitative evaluation of your technical capabilities mapped against real industry hiring rubrics."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Career Readiness' },
        ]}
      />

      {/* 1. Header Banner */}
      <ReadinessHeaderBanner
        careerGoal={careerGoal}
        readinessScore={readinessScore}
        metSkillsCount={metSkillsCount}
        totalRequiredSkills={totalRequiredSkills}
        activeGapsCount={needsWorkSkillsCount + developingSkillsCount}
      />

      {/* 2. Core Metrics Cards */}
      <ReadinessMetricsCard
        readinessScore={readinessScore}
        totalRequired={totalRequiredSkills}
        metCount={metSkillsCount}
        developingCount={developingSkillsCount}
        needsWorkCount={needsWorkSkillsCount}
      />

      {/* 3. Required Career Skills Table */}
      <section className="space-y-4">
        <CareerSkillRequirementsTable
          skillBreakdown={skillBreakdown}
          careerTitle={careerGoal}
        />
      </section>

      {/* 4. Strong Areas & Active Blockers Side-by-Side */}
      <section className="space-y-4">
        <StrongAndGapSpotlight skillBreakdown={skillBreakdown} />
      </section>

      {/* 5. Supporting Signals (Assessments, Roadmap, Projects) */}
      <section className="space-y-4">
        <div className="space-y-0.5">
          <h3 className="font-heading text-lg font-bold text-[#171918]">Supporting Capability Signals</h3>
          <p className="text-xs text-[#626763]">Verified evidence from your assessments, roadmap progress, and portfolio builds.</p>
        </div>

        <ReadinessSupportingSignals
          assessmentScore={latestAssessment?.score || 72}
          assessmentTitle={latestAssessment?.title || 'Frontend Engineering Diagnostic'}
          completedMilestones={completedMilestonesCount}
          totalMilestones={totalMilestonesCount}
          completedProjects={completedProjectsCount}
          inProgressProjects={inProgressProjectsCount}
        />
      </section>

      {/* 6. Career Blocker & Next Readiness Move */}
      <ReadinessNextMoveCard
        blockerSkillName={blockerSkill?.name}
        blockerGap={blockerSkill?.gap}
        blockerImportance={blockerSkill?.importance}
      />
    </div>
  )
}
