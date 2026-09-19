import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { roadmapApi } from '@/api/endpoints/roadmap.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { profileApi } from '@/api/endpoints/profile.api'
import { Roadmap, RoadmapMilestone } from '@/types/roadmap.types'
import { SkillGap } from '@/types/skill.types'
import { UserStats } from '@/types/user.types'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'
import {
  Flag,
  Zap,
  Target,
  Award,
  ArrowRight,
  Briefcase,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

// Import Career Mission components
import { CareerMissionHeaderBanner } from '@/components/career/CareerMissionHeaderBanner'
import { MissionStageTimeline } from '@/components/career/MissionStageTimeline'

export const CareerMissionPage: React.FC = () => {
  const { user } = useAuth()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [gaps, setGaps] = useState<SkillGap[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [roadmapRes, gapsRes, statsRes] = await Promise.allSettled([
        roadmapApi.getCurrentRoadmap(),
        skillsApi.getSkillGaps(),
        profileApi.getUserStats(),
      ])

      if (roadmapRes.status === 'fulfilled') setRoadmap(roadmapRes.value)
      if (gapsRes.status === 'fulfilled') setGaps(gapsRes.value || [])
      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
    } catch (err) {
      console.error('Failed to load Career Mission data:', err)
      setError('Unable to load career mission data. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading your Career Mission roadmap..." minHeight="min-h-[400px]" />
  }

  const targetRole = user?.careerGoal || user?.targetCareer || DEFAULT_CAREER_GOAL
  const topGap = gaps.length > 0 ? gaps[0] : null
  const progressPercent = roadmap?.progressPercentage ?? stats?.overallScore ?? 60

  const milestones: RoadmapMilestone[] = roadmap?.milestones && roadmap.milestones.length > 0
    ? roadmap.milestones
    : [
        {
          id: 'm-1',
          title: 'Foundational Web Architecture & CS Fundamentals',
          description: 'Master core internet protocols, data structures, and foundational programming logic.',
          estimatedHours: 20,
          status: 'COMPLETED',
          skillsCovered: ['HTML5', 'CSS3', 'Git', 'Data Structures'],
          order: 1,
          resourcesCount: 4,
          projectsCount: 1,
        },
        {
          id: 'm-2',
          title: 'Core JavaScript & Asynchronous Programming',
          description: 'Deep dive into ES6+, Promises, Async/Await, Closures, and DOM API mechanics.',
          estimatedHours: 25,
          status: 'COMPLETED',
          skillsCovered: ['JavaScript', 'ES6+', 'Async/Await', 'REST APIs'],
          order: 2,
          resourcesCount: 5,
          projectsCount: 2,
        },
        {
          id: 'm-3',
          title: 'Backend API Engineering & Node.js Architecture',
          description: 'Design and build secure, scalable backend microservices, REST APIs, and DB schemas.',
          estimatedHours: 35,
          status: 'IN_PROGRESS',
          skillsCovered: ['Node.js', 'Express.js', 'MongoDB', 'JWT Auth'],
          order: 3,
          resourcesCount: 6,
          projectsCount: 2,
        },
        {
          id: 'm-4',
          title: 'Full Stack Integration & Production Deployment',
          description: 'Integrate frontend Single Page Applications with backend APIs, CI/CD, and Cloud hosting.',
          estimatedHours: 40,
          status: 'NOT_STARTED',
          skillsCovered: ['React', 'Docker', 'CI/CD', 'System Design'],
          order: 4,
          resourcesCount: 5,
          projectsCount: 3,
        },
        {
          id: 'm-5',
          title: 'Career Readiness & Technical Interview Clearance',
          description: 'Pass mock system design interviews, polish GitHub portfolio, and complete career passport verification.',
          estimatedHours: 20,
          status: 'NOT_STARTED',
          skillsCovered: ['System Design', 'Code Reviews', 'Portfolio', 'Interview Prep'],
          order: 5,
          resourcesCount: 3,
          projectsCount: 1,
        },
      ]

  const activeMilestone =
    milestones.find((m) => m.status === 'IN_PROGRESS') || milestones[0]

  const completedCount = milestones.filter((m) => m.status === 'COMPLETED').length

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Career Mission"
        subtitle={`Your structured multi-stage path toward ${targetRole} placement.`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: "Today's Action", href: ROUTES.TODAY },
          { label: 'Career Mission' },
        ]}
      />

      {/* 2. ERROR STATE HANDLER */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200 text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </Card>
      )}

      {/* 3. CAREER MISSION HEADER BANNER */}
      <CareerMissionHeaderBanner
        targetRole={targetRole}
        completedMilestones={completedCount}
        totalMilestones={milestones.length}
        progressPercent={progressPercent}
        activeStageTitle={activeMilestone?.title}
      />

      {/* 4. CURRENT BOTTLENECK FOCUS CARD */}
      <Card glass="interactive" className="p-6 border-white/80 animate-slideUp">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#D8E8DE] text-[#1F6B4F]">
                <Target className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
                Current Stage Bottleneck
              </span>
            </div>
            <h3 className="font-heading text-lg font-bold text-[#171918]">
              Stage Goal: {activeMilestone?.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
              {topGap
                ? `Your top identified career gap is ${topGap.skillName} (-${topGap.gap} pts). Completing today's focus task directly resolves this bottleneck for Stage ${activeMilestone?.order || 3}.`
                : `Focus on completing all required projects and practical challenges in this active stage to advance.`}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link to={ROUTES.TODAY}>
              <Button variant="primary" size="md" leftIcon={<Zap className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Execute Today's Action
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 5. MISSION STAGE TIMELINE */}
      <MissionStageTimeline
        milestones={milestones}
        targetRole={targetRole}
        topBottleneckSkill={topGap?.skillName}
      />

      {/* 6. CONNECTED CAREER MODULES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card glass="interactive" className="p-5 border-white/80 animate-slideUp space-y-3">
          <div className="p-2 rounded-xl bg-[#D8E8DE] text-[#1F6B4F] w-fit">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-[#171918]">Career Readiness</h4>
            <p className="text-xs text-[#626763] mt-1 leading-relaxed">
              Check your current evidence-based hiring readiness score for {targetRole}.
            </p>
          </div>
          <Link to={ROUTES.CAREER_READINESS} className="block pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Readiness Report →
            </Button>
          </Link>
        </Card>

        <Card glass="interactive" className="p-5 border-white/80 animate-slideUp space-y-3">
          <div className="p-2 rounded-xl bg-[#D8E8DE] text-[#1F6B4F] w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-[#171918]">Skill Evidence</h4>
            <p className="text-xs text-[#626763] mt-1 leading-relaxed">
              Review your verified proof points recorded from completed challenges & projects.
            </p>
          </div>
          <Link to={ROUTES.SKILL_EVIDENCE} className="block pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Open Skill Evidence →
            </Button>
          </Link>
        </Card>

        <Card glass="interactive" className="p-5 border-white/80 animate-slideUp space-y-3">
          <div className="p-2 rounded-xl bg-[#D8E8DE] text-[#1F6B4F] w-fit">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-[#171918]">Career Passport</h4>
            <p className="text-xs text-[#626763] mt-1 leading-relaxed">
              Export your employer-ready verified skill passport and portfolio links.
            </p>
          </div>
          <Link to={ROUTES.CAREER_PASSPORT} className="block pt-2">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Career Passport →
            </Button>
          </Link>
        </Card>
      </div>

      {/* 7. BOTTOM CAREER CHANGE BAR */}
      <Card className="p-6 bg-white border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#D8E8DE] text-[#1F6B4F]">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#171918]">Targeting a different engineering specialization?</h4>
            <p className="text-xs text-[#626763]">Switch your career goal to dynamically generate a new Career Mission path.</p>
          </div>
        </div>
        <Link to={ROUTES.CAREERS}>
          <Button variant="outline" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
            Explore Careers Catalog
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default CareerMissionPage
