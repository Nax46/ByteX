import React, { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/hooks/useAuth'

import { profileApi } from '@/api/endpoints/profile.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { roadmapApi } from '@/api/endpoints/roadmap.api'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { resourcesApi } from '@/api/endpoints/resources.api'
import { projectsApi } from '@/api/endpoints/projects.api'

import { UserStats } from '@/types/user.types'
import { SkillGap } from '@/types/skill.types'
import { Roadmap, RoadmapMilestone } from '@/types/roadmap.types'
import { AssessmentResult } from '@/types/assessment.types'
import { LearningResource } from '@/types/resource.types'
import { RecommendedProject } from '@/types/project.types'

import { ROUTES } from '@/constants/routes'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// Subcomponents
import { ProgressHeaderBanner } from '@/components/progress/ProgressHeaderBanner'
import { ProgressDimensionsGrid } from '@/components/progress/ProgressDimensionsGrid'
import { SkillGrowthProgressCard } from '@/components/progress/SkillGrowthProgressCard'
import { AssessmentHistoryList } from '@/components/progress/AssessmentHistoryList'
import { RoadmapModuleProgress } from '@/components/progress/RoadmapModuleProgress'
import { ProgressNextMoveCard } from '@/components/progress/ProgressNextMoveCard'

export const ProgressPage: React.FC = () => {
  const { user } = useAuth()
  const careerGoal = user?.careerGoal || user?.targetCareer || 'Full Stack Developer'

  const [stats, setStats] = useState<UserStats | null>(null)
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([])
  const [resources, setResources] = useState<LearningResource[]>([])
  const [projects, setProjects] = useState<RecommendedProject[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadProgressData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [
        statsData,
        gapsData,
        roadmapData,
        assessmentsData,
        resourcesData,
        projectsData,
      ] = await Promise.all([
        profileApi.getUserStats().catch(() => null),
        skillsApi.getSkillGaps().catch(() => []),
        roadmapApi.getCurrentRoadmap().catch(() => null),
        assessmentApi.getAllResults().catch(() => []),
        resourcesApi.getResources().catch(() => []),
        projectsApi.getRecommendedProjects().catch(() => []),
      ])

      setStats(statsData)
      setSkillGaps(gapsData || [])
      setRoadmap(roadmapData)
      setAssessmentResults(assessmentsData || [])
      setResources(resourcesData || [])
      setProjects(projectsData || [])
    } catch (err: unknown) {
      console.error('Failed to load progress intelligence data:', err)
      setError('Failed to load progress intelligence. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProgressData()
  }, [])

  // Derived Calculations
  const prioritySkill = useMemo(() => {
    if (!skillGaps || skillGaps.length === 0) return null
    return [...skillGaps].sort((a, b) => b.gap - a.gap || (a.priority === 'HIGH' ? -1 : 1))[0]
  }, [skillGaps])

  const skillsMeetingTarget = useMemo(() => {
    return skillGaps.filter((s) => s.currentLevel >= s.targetLevel).length
  }, [skillGaps])

  const roadmapMilestones: RoadmapMilestone[] = useMemo(() => {
    if (!roadmap || !roadmap.milestones) return []
    return roadmap.milestones
  }, [roadmap])

  const completedModulesCount = useMemo(() => {
    return roadmapMilestones.filter((m) => m.status === 'COMPLETED').length
  }, [roadmapMilestones])

  const completedProjectsCount = useMemo(() => {
    return projects.filter((p) => p.status === 'SUBMITTED').length
  }, [projects])

  const inProgressProjectsCount = useMemo(() => {
    return projects.filter((p) => p.status === 'IN_PROGRESS').length
  }, [projects])

  const avgAssessmentScore = useMemo(() => {
    if (!assessmentResults || assessmentResults.length === 0) return 0
    const sum = assessmentResults.reduce((acc, curr) => acc + (curr.score || 0), 0)
    return Math.round(sum / assessmentResults.length)
  }, [assessmentResults])

  const careerReadinessScore = stats?.careerReadiness || stats?.overallScore || 72

  if (isLoading) {
    return <LoadingState message="Aggregating your career progress & skill intelligence..." minHeight="min-h-[400px]" />
  }

  if (error) {
    return (
      <Card className="p-8 text-center space-y-4 max-w-lg mx-auto my-12 border-red-200 bg-red-50/50">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="font-heading text-base font-bold text-red-900">{error}</h3>
        <Button variant="primary" size="sm" onClick={loadProgressData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Try Again
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Career Progress Intelligence"
        subtitle="Unified timeline of your verified skill level increases, assessment performance, and roadmap milestones."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Progress' },
        ]}
      />

      {/* 1. Career Context Header Banner */}
      <ProgressHeaderBanner
        careerGoal={careerGoal}
        overallReadiness={careerReadinessScore}
        activeGapsCount={skillGaps.filter((g) => g.gap > 0).length}
        completedModulesCount={completedModulesCount}
        totalModulesCount={roadmapMilestones.length || 6}
      />

      {/* 2. Core Progress Dimensions Grid */}
      <ProgressDimensionsGrid
        careerReadiness={careerReadinessScore}
        skillsMeetingTarget={skillsMeetingTarget}
        totalSkillsTracked={skillGaps.length || 6}
        completedModules={completedModulesCount}
        totalModules={roadmapMilestones.length || 6}
        completedProjects={completedProjectsCount}
        inProgressProjects={inProgressProjectsCount}
        assessmentCount={assessmentResults.length}
        avgAssessmentScore={avgAssessmentScore}
      />

      {/* 3. Skill Level Growth & Diagnostic History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <SkillGrowthProgressCard skillGaps={skillGaps} />
        </div>

        <div className="lg:col-span-6">
          <AssessmentHistoryList results={assessmentResults} />
        </div>
      </div>

      {/* 4. Roadmap Module Progression */}
      <section className="space-y-4">
        <RoadmapModuleProgress milestones={roadmapMilestones} />
      </section>

      {/* 5. Priority Bottleneck & Next Move Action */}
      <ProgressNextMoveCard prioritySkill={prioritySkill} />
    </div>
  )
}
