import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { skillsApi } from '@/api/endpoints/skills.api'
import { roadmapApi } from '@/api/endpoints/roadmap.api'
import { profileApi } from '@/api/endpoints/profile.api'
import { SkillGap } from '@/types/skill.types'
import { Roadmap } from '@/types/roadmap.types'
import { UserStats } from '@/types/user.types'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'
import {
  Code,
  BookOpen,
  FolderGit2,
  Map,
  Award,
  ArrowRight,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Target,
} from 'lucide-react'

// Import Today's Action components
import { TodayActionHero } from '@/components/today/TodayActionHero'
import { ActionReasonCard } from '@/components/today/ActionReasonCard'
import { RecentActionHistoryList } from '@/components/today/RecentActionHistoryList'

export const TodayActionPage: React.FC = () => {
  const { user } = useAuth()
  const [gaps, setGaps] = useState<SkillGap[]>([])
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [actionCompleted, setActionCompleted] = useState<boolean>(false)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [gapsRes, roadmapRes, statsRes] = await Promise.allSettled([
        skillsApi.getSkillGaps(),
        roadmapApi.getCurrentRoadmap(),
        profileApi.getUserStats(),
      ])

      if (gapsRes.status === 'fulfilled') setGaps(gapsRes.value || [])
      if (roadmapRes.status === 'fulfilled') setRoadmap(roadmapRes.value)
      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
    } catch (err) {
      console.error('Failed to load Today Action data:', err)
      setError('Unable to fetch career intelligence for today. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Calculating today's high-impact career action..." minHeight="min-h-[400px]" />
  }

  const targetRole = user?.careerGoal || user?.targetCareer || DEFAULT_CAREER_GOAL
  const topGap = gaps.length > 0 ? gaps[0] : null
  const activeMilestone =
    roadmap?.milestones?.find((m) => m.status === 'IN_PROGRESS') ||
    roadmap?.milestones?.[0] ||
    null

  const handleMarkCompleted = () => {
    setActionCompleted(true)
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Today's Career Action"
        subtitle={`Your single highest-impact move today toward becoming a certified ${targetRole}.`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Career Mission', href: ROUTES.CAREER_MISSION },
          { label: "Today's Action" },
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

      {/* 3. TODAY ACTION HERO CARD */}
      <TodayActionHero
        targetRole={targetRole}
        topGap={topGap}
        activeMilestoneTitle={activeMilestone?.title}
        estimatedEffort="45 mins"
        isCompleted={actionCompleted}
        onMarkCompleted={handleMarkCompleted}
      />

      {/* 4. CAREER BOTTLENECK & ACTION ALIGNMENT */}
      <ActionReasonCard topGap={topGap} targetRole={targetRole} />

      {/* 5. EXPLORE ACTIVITY SOURCES GRID */}
      <Card glass="interactive" className="p-6 border-white/80 animate-slideUp space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]/70">
          <div>
            <h3 className="font-heading text-base font-bold text-[#171918]">
              Targeted Skill Building Activities
            </h3>
            <p className="text-xs text-[#626763] mt-0.5">
              Source activities connected to your active career mission bottleneck
            </p>
          </div>
          <Link to={ROUTES.SKILL_GAP}>
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Skill Gap Matrix
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={ROUTES.CHALLENGES} className="group">
            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] group-hover:border-[#C2D8C9] group-hover:shadow-xs transition-all space-y-2 h-full flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mb-2">
                  <Code className="w-5 h-5" />
                </div>
                <h4 className="font-heading text-sm font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
                  Practical Challenges
                </h4>
                <p className="text-xs text-[#626763] mt-1 line-clamp-2">
                  Demonstrate practical capability through real-world code tasks.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#1F6B4F] inline-flex items-center gap-1 pt-2">
                Open Challenges →
              </span>
            </div>
          </Link>

          <Link to={ROUTES.ROADMAP} className="group">
            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] group-hover:border-[#C2D8C9] group-hover:shadow-xs transition-all space-y-2 h-full flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mb-2">
                  <Map className="w-5 h-5" />
                </div>
                <h4 className="font-heading text-sm font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
                  Learning Roadmap
                </h4>
                <p className="text-xs text-[#626763] mt-1 line-clamp-2">
                  Follow structured milestone modules mapped to target skills.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#1F6B4F] inline-flex items-center gap-1 pt-2">
                View Roadmap →
              </span>
            </div>
          </Link>

          <Link to={ROUTES.PROJECTS} className="group">
            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] group-hover:border-[#C2D8C9] group-hover:shadow-xs transition-all space-y-2 h-full flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mb-2">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <h4 className="font-heading text-sm font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
                  Recommended Projects
                </h4>
                <p className="text-xs text-[#626763] mt-1 line-clamp-2">
                  Build full production applications for portfolio evidence.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#1F6B4F] inline-flex items-center gap-1 pt-2">
                Explore Projects →
              </span>
            </div>
          </Link>

          <Link to={ROUTES.RESOURCES} className="group">
            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] group-hover:border-[#C2D8C9] group-hover:shadow-xs transition-all space-y-2 h-full flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-heading text-sm font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
                  Learning Resources
                </h4>
                <p className="text-xs text-[#626763] mt-1 line-clamp-2">
                  Study curated tutorials, docs, and conceptual guides.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#1F6B4F] inline-flex items-center gap-1 pt-2">
                Browse Resources →
              </span>
            </div>
          </Link>
        </div>
      </Card>

      {/* 6. RECENT CAREER ACTIONS HISTORY */}
      <RecentActionHistoryList completedCount={stats?.completedMilestones || 3} />

      {/* 7. BOTTOM NAVIGATION / CAREER GOAL CHANGE */}
      <Card className="p-6 bg-white border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#D8E8DE] text-[#1F6B4F]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#171918]">Want to adjust your career destination?</h4>
            <p className="text-xs text-[#626763]">Explore other high-demand career tracks and re-align your daily actions.</p>
          </div>
        </div>
        <Link to={ROUTES.CAREERS}>
          <Button variant="outline" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
            Browse Career Catalog
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default TodayActionPage
