import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { useAuth } from '@/hooks/useAuth'
import { dashboardApi, DashboardSummaryResponse } from '@/api/endpoints/dashboard.api'
import { skillsApi, ISkillGapPriorityReadout } from '@/api/endpoints/skills.api'
import { roadmapApi, IRoadmapProgressSummary } from '@/api/endpoints/roadmap.api'
import { ArrowRight, Clock, Target, CheckCircle2 } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryResponse | null>(null)
  const [skillReadout, setSkillReadout] = useState<ISkillGapPriorityReadout | null>(null)
  const [roadmapProgress, setRoadmapProgress] = useState<IRoadmapProgressSummary | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [dashRes, skillRes, roadRes] = await Promise.allSettled([
          dashboardApi.getSummary(),
          skillsApi.getSkillGapPriority(),
          roadmapApi.getRoadmapProgress(),
        ])

        if (dashRes.status === 'fulfilled') {
          setDashboardSummary(dashRes.value)
        }
        if (skillRes.status === 'fulfilled') {
          setSkillReadout(skillRes.value)
        }
        if (roadRes.status === 'fulfilled') {
          setRoadmapProgress(roadRes.value.progress)
        }
      } catch (err: unknown) {
        console.error('Error fetching live dashboard data:', err)
        setError('Unable to load real-time dashboard data. Please ensure you are logged in.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading your SkillPath dashboard..." minHeight="min-h-[350px]" />
  }

  if (error && !skillReadout && !dashboardSummary) {
    return <ErrorState message={error || 'Dashboard data is temporarily unavailable.'} />
  }

  const displayName = user?.name || dashboardSummary?.profile.fullName || 'Student'
  const targetRole = skillReadout?.targetCareerTitle || dashboardSummary?.profile.targetCareer || 'Full Stack Developer'
  const readinessScore = skillReadout?.overallReadinessScore ?? 0
  const overallProgress = roadmapProgress?.overallProgress ?? 0
  const snapshots = skillReadout?.snapshots || []
  const metSkillsCount = skillReadout?.metSkillsCount ?? snapshots.filter((s) => s.gap === 0).length
  const totalSkillsCount = skillReadout?.totalRequiredSkills ?? snapshots.length

  // Find active module in roadmap
  const activeModuleItem = roadmapProgress?.modules.find((m) => m.status === 'IN_PROGRESS') || roadmapProgress?.modules[0]
  const activeModuleDetail = roadmapProgress?.roadmapDetails?.modules.find((m) => m.moduleId === activeModuleItem?.moduleId)
  const currentCourseTitle = activeModuleDetail?.title || (snapshots.length > 0 ? `${snapshots[0].skillName} Fundamentals` : 'Skill Path Learning Track')
  const currentModuleOrder = activeModuleDetail?.order || 1
  const currentProgressPercent = activeModuleItem?.progressPercent ?? 0

  // Priority gap recommendations
  const priorityGaps = snapshots.filter((s) => s.gap > 0).sort((a, b) => a.priorityRank - b.priorityRank).slice(0, 3)

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* 1. GREETING & CONTEXT */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#171918]">
            Good day, {displayName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#626763] mt-1">
            Targeting: <strong className="text-[#171918]">{targetRole}</strong> • Here is your live skill intelligence readout.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={ROUTES.SKILL_GAP}>
            <Button variant="outline" size="sm">
              Skill Gap Matrix
            </Button>
          </Link>
          <Link to={ROUTES.ASSESSMENT}>
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Take Skill Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. TOP METRICS (4 compact, elegant cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Career Readiness"
          value={<AnimatedCounter value={readinessScore} suffix="%" />}
          subtitle={`Target: ${targetRole}`}
          trend={{ value: 'Verified', isPositive: true }}
          className="animate-slideUp stagger-1"
        />
        <StatCard
          title="Roadmap Progress"
          value={<AnimatedCounter value={overallProgress} suffix="%" />}
          subtitle={roadmapProgress ? `Version ${roadmapProgress.version}` : 'Active Roadmap'}
          trend={{ value: `${roadmapProgress?.completedModules ?? 0}/${roadmapProgress?.totalModules ?? 0} Done`, isPositive: true }}
          className="animate-slideUp stagger-2"
        />
        <StatCard
          title="Skills Verified"
          value={<AnimatedCounter value={metSkillsCount} />}
          subtitle={`Out of ${totalSkillsCount} required skills`}
          className="animate-slideUp stagger-3"
        />
        <StatCard
          title="Active Target Gaps"
          value={<AnimatedCounter value={skillReadout?.gapSkillsCount ?? snapshots.filter((s) => s.gap > 0).length} />}
          subtitle="Prioritized for action"
          trend={{ value: 'In Focus', isPositive: true }}
          className="animate-slideUp stagger-4"
        />
      </div>

      {/* 3. CURRENT LEARNING (Large Card) */}
      <Card glass="elevated" sheen className="p-6 sm:p-7 border-white/80 animate-slideUp">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">Continue Learning</span>
              <span className="text-xs text-[#8E948F]">•</span>
              <span className="text-xs text-[#626763]">Module #{currentModuleOrder}</span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
              {currentCourseTitle}
            </h2>

            <p className="text-xs sm:text-sm text-[#626763]">
              Target Level: <strong className="text-[#171918]">{activeModuleDetail?.targetLevel ?? 80}%</strong>
              {activeModuleDetail?.description ? ` — ${activeModuleDetail.description}` : ''}
            </p>

            {/* Subtle progress indicator */}
            <div className="pt-2 max-w-md">
              <ProgressBar
                value={currentProgressPercent}
                variant="forest"
                size="sm"
                label="Module progress"
                showPercentage
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0">
            <span className="text-xs text-[#626763] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
              Estimated: {activeModuleDetail?.estimatedHours ?? 12} hrs
            </span>

            <Link to={ROUTES.ROADMAP}>
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Roadmap →
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 4. TWO-COLUMN: SKILL OVERVIEW & RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left: Skill Snapshot */}
        <div className="lg:col-span-6 space-y-4">
          <Card glass="interactive" className="p-6 border-white/80 h-full flex flex-col justify-between animate-slideUp stagger-1">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#171918]">Your Skill Snapshot</h3>
                  <p className="text-xs text-[#626763] mt-0.5">Live proficiency evaluation from MongoDB</p>
                </div>
                <Link to={ROUTES.SKILLS} className="text-xs font-semibold text-[#1F6B4F] hover:underline">
                  View all ({snapshots.length}) →
                </Link>
              </div>

              <div className="space-y-4">
                {snapshots.length === 0 ? (
                  <p className="text-xs text-[#626763] py-4 text-center">No skill evaluation records found. Take an assessment to evaluate your skills.</p>
                ) : (
                  snapshots.slice(0, 5).map((skill) => (
                    <div key={skill.skillId} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[#171918]">{skill.skillName}</span>
                        <span className="font-bold text-[#1F6B4F]">{skill.currentLevel}% / {skill.targetLevel}%</span>
                      </div>
                      <ProgressBar
                        value={skill.currentLevel}
                        variant={skill.currentLevel >= skill.targetLevel ? 'forest' : skill.currentLevel >= 50 ? 'primary' : 'warning'}
                        size="sm"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E5DF]/70 flex items-center justify-between text-xs">
              <span className="text-[#626763]">{targetRole} Alignment:</span>
              <span className="font-semibold text-[#1F6B4F] bg-[#D8E8DE]/80 px-2.5 py-0.5 rounded-full border border-[#C2D8C9]">
                {readinessScore >= 70 ? 'Strong Foundation' : readinessScore >= 40 ? 'Active Progress' : 'Initial Calibration'}
              </span>
            </div>
          </Card>
        </div>

        {/* Right: Personalized Recommendations */}
        <div className="lg:col-span-6 space-y-4">
          <Card glass="interactive" className="p-6 border-white/80 h-full flex flex-col justify-between animate-slideUp stagger-2">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#171918]">Prioritized Gap Recommendations</h3>
                  <p className="text-xs text-[#626763] mt-0.5">Determined by backend priority engine</p>
                </div>
                <Badge variant="forest" size="sm">Deterministic</Badge>
              </div>

              <div className="space-y-3.5">
                {priorityGaps.length === 0 ? (
                  <p className="text-xs text-[#626763] py-4 text-center">All target skill benchmarks met! Great job.</p>
                ) : (
                  priorityGaps.map((gap, idx) => (
                    <div key={gap.skillId} className="p-3.5 rounded-xl glass-panel border-white/70 hover-lift transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-heading text-sm font-bold text-[#171918]">{gap.skillName}</h4>
                        <span className="text-[11px] text-[#A66E1D] font-semibold bg-[#FDF4E6] px-2 py-0.5 rounded-full border border-[#E7A84B]/30">
                          Priority #{idx + 1} (Score {gap.priorityScore})
                        </span>
                      </div>
                      <p className="text-xs text-[#626763] leading-relaxed">
                        “Current level {gap.currentLevel}%. Target level {gap.targetLevel}%. Active gap of {gap.gap} points.”
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E5E5DF]/70">
              <Link to={ROUTES.ROADMAP}>
                <Button variant="outline" size="sm" className="w-full">
                  View Full Learning Path →
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. ACTIVE LEARNING ROADMAP PREVIEW */}
      <Card glass="interactive" className="p-6 border-white/80 animate-slideUp stagger-3">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E5DF]/70">
          <div>
            <h3 className="font-heading text-base font-bold text-[#171918]">Your Learning Roadmap Modules</h3>
            <p className="text-xs text-[#626763] mt-0.5">{targetRole} active path</p>
          </div>
          <Link to={ROUTES.ROADMAP}>
            <Button variant="outline" size="sm">
              Open Interactive Roadmap →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(!roadmapProgress?.roadmapDetails?.modules || roadmapProgress.roadmapDetails.modules.length === 0) ? (
            <div className="col-span-full py-6 text-center text-xs text-[#626763]">
              No active roadmap generated yet. Complete an assessment to generate your personalized learning path.
            </div>
          ) : (
            roadmapProgress.roadmapDetails.modules.map((m) => {
              const prog = roadmapProgress.modules.find((item) => item.moduleId === m.moduleId)
              const status = prog?.status || 'LOCKED'
              return (
                <div
                  key={m.moduleId}
                  className={`p-4 rounded-xl flex flex-col justify-between hover-lift transition-all ${
                    status === 'COMPLETED'
                      ? 'glass-panel border-[#C2D8C9] bg-[#D8E8DE]/35'
                      : status === 'IN_PROGRESS'
                      ? 'glass-panel-elevated border-[#1F6B4F]/40 ring-1 ring-[#1F6B4F]/25'
                      : 'glass-panel border-white/60'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold text-[#626763]">Stage {m.order}</span>
                      <Badge
                        variant={
                          status === 'COMPLETED'
                            ? 'forest'
                            : status === 'IN_PROGRESS'
                            ? 'warning'
                            : 'outline'
                        }
                        size="sm"
                      >
                        {status === 'IN_PROGRESS' ? 'Current' : status}
                      </Badge>
                    </div>
                    <h4 className="font-heading text-sm font-bold text-[#171918] mb-1">{m.title}</h4>
                    <p className="text-xs text-[#626763] line-clamp-2">{m.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E5E5DF]/60 flex items-center justify-between text-[11px] text-[#626763]">
                    <span>{m.estimatedHours} hrs</span>
                    <span className="font-medium text-[#1F6B4F]">{m.skillName}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}
