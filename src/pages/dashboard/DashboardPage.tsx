import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { useAuth } from '@/hooks/useAuth'
import { profileApi } from '@/api/endpoints/profile.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { roadmapApi } from '@/api/endpoints/roadmap.api'
import { UserStats } from '@/types/user.types'
import { Skill, SkillGap } from '@/types/skill.types'
import { Roadmap } from '@/types/roadmap.types'
import { ArrowRight, Clock, Target, Sparkles } from 'lucide-react'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [gaps, setGaps] = useState<SkillGap[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        const [statsRes, skillsRes, roadmapRes, gapsRes] = await Promise.allSettled([
          profileApi.getUserStats(),
          skillsApi.getSkills(),
          roadmapApi.getCurrentRoadmap(),
          skillsApi.getSkillGaps(),
        ])

        if (!isMounted) return

        if (statsRes.status === 'fulfilled') setStats(statsRes.value)
        if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value || [])
        if (roadmapRes.status === 'fulfilled') setRoadmap(roadmapRes.value)
        if (gapsRes.status === 'fulfilled') setGaps(gapsRes.value || [])
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadDashboardData()
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading your SkillPath dashboard..." minHeight="min-h-[350px]" />
  }

  const activeMilestone =
    roadmap?.milestones?.find((m) => m.status === 'IN_PROGRESS') ||
    roadmap?.milestones?.[0] ||
    null

  const readinessScore = stats?.careerReadiness ?? 0
  const progressScore = roadmap?.progressPercentage ?? stats?.overallScore ?? 0
  const skillsCount = stats?.skillsTracked ?? skills.length
  const streakDays = stats?.learningStreakDays ?? 1

  const firstName = user?.name ? user.name.split(' ')[0] : 'Learner'

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
            Good day, {firstName} 👋
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

      {/* 2. TOP METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Career Readiness"
          value={<AnimatedCounter value={readinessScore} suffix="%" />}
          subtitle={`Target: ${user?.careerGoal || DEFAULT_CAREER_GOAL}`}
          trend={{ value: readinessScore > 0 ? `+${readinessScore}%` : 'Pending', isPositive: true }}
          className="animate-slideUp stagger-1"
        />
        <StatCard
          title="Learning Progress"
          value={<AnimatedCounter value={progressScore} suffix="%" />}
          subtitle={roadmap ? 'Active Roadmap' : 'Get Started'}
          trend={{ value: `${progressScore}%`, isPositive: true }}
          className="animate-slideUp stagger-2"
        />
        <StatCard
          title="Skills Tracked"
          value={<AnimatedCounter value={skillsCount} />}
          subtitle="Verified competencies"
          className="animate-slideUp stagger-3"
        />
        <StatCard
          title="Learning Streak"
          value={<AnimatedCounter value={streakDays} suffix=" days" />}
          subtitle="Keep your habit going!"
          trend={{ value: 'Active', isPositive: true }}
          className="animate-slideUp stagger-4"
        />
      </div>

      {/* 3. CURRENT LEARNING / ROADMAP STATUS */}
      {activeMilestone ? (
        <Card glass="elevated" sheen className="p-6 sm:p-7 border-white/80 animate-slideUp">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">Continue Learning</span>
                <span className="text-xs text-[#8E948F]">•</span>
                <span className="text-xs text-[#626763]">Active Milestone</span>
              </div>

              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
                {activeMilestone.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#626763]">
                Focus area: <strong className="text-[#171918]">{activeMilestone.description}</strong>
              </p>

              <div className="pt-2 max-w-md">
                <ProgressBar
                  value={activeMilestone.status === 'COMPLETED' ? 100 : activeMilestone.status === 'IN_PROGRESS' ? 50 : 10}
                  variant="forest"
                  size="sm"
                  label="Milestone completion"
                  showPercentage
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0">
              <span className="text-xs text-[#626763] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                Estimated: {activeMilestone.estimatedHours} hrs
              </span>

              <Link to={ROUTES.ROADMAP}>
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue Learning →
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card glass="elevated" sheen className="p-6 sm:p-7 border-white/80 animate-slideUp">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
                <Sparkles className="w-4 h-4" />
                Personalized Learning Roadmap
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
                Generate your personalized career roadmap
              </h2>
              <p className="text-xs sm:text-sm text-[#626763] max-w-xl">
                Take an assessment or configure your target role to receive an AI-tailored study progression.
              </p>
            </div>

            <Link to={ROUTES.ROADMAP}>
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Build My Roadmap →
              </Button>
            </Link>
          </div>
        </Card>
      )}

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
                  View all skills →
                </Link>
              </div>

              {skills.length > 0 ? (
                <div className="space-y-4">
                  {skills.slice(0, 5).map((skill) => (
                    <div key={skill.id || skill.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-[#171918]">{skill.name}</span>
                        <span className="font-bold text-[#1F6B4F]">{skill.progress}%</span>
                      </div>
                      <ProgressBar
                        value={skill.progress}
                        variant={skill.progress >= 70 ? 'forest' : skill.progress >= 50 ? 'primary' : 'warning'}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-[#626763]">No skill evaluations recorded yet.</p>
                  <Link to={ROUTES.ASSESSMENT}>
                    <Button variant="outline" size="sm">
                      Take Diagnostic Assessment
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E5DF]/70 flex items-center justify-between text-xs">
              <span className="text-[#626763]">Target Role Alignment:</span>
              <span className="font-semibold text-[#1F6B4F] bg-[#D8E8DE]/80 px-2.5 py-0.5 rounded-full border border-[#C2D8C9]">
                {user?.careerGoal || DEFAULT_CAREER_GOAL}
              </span>
            </div>
          </Card>
        </div>

        {/* Right: Recommendations based on gaps */}
        <div className="lg:col-span-6 space-y-4">
          <Card glass="interactive" className="p-6 border-white/80 h-full flex flex-col justify-between animate-slideUp stagger-2">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#171918]">Recommended Next Steps</h3>
                  <p className="text-xs text-[#626763] mt-0.5">Tailored to your current skills and target role</p>
                </div>
                <Badge variant="forest" size="sm">Dynamic</Badge>
              </div>

              {gaps.length > 0 ? (
                <div className="space-y-3.5">
                  {gaps.slice(0, 3).map((gap) => (
                    <div key={gap.skillId || gap.skillName} className="p-3.5 rounded-xl glass-panel border-white/70 hover-lift transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-heading text-sm font-bold text-[#171918]">{gap.skillName}</h4>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            gap.priority === 'HIGH'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {gap.priority} Gap ({gap.gap} pts)
                        </span>
                      </div>
                      <p className="text-xs text-[#626763] leading-relaxed">
                        {gap.recommendedAction || `Focus on closing the ${gap.skillName} gap to meet standard benchmarks.`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl glass-panel text-center space-y-3 py-8">
                  <Target className="w-8 h-8 text-[#1F6B4F] mx-auto opacity-70" />
                  <p className="text-xs text-[#626763]">Complete assessments to discover your personalized high-priority learning gaps.</p>
                  <Link to={ROUTES.ASSESSMENT}>
                    <Button variant="outline" size="sm">
                      Start Assessment
                    </Button>
                  </Link>
                </div>
              )}
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
      {roadmap && roadmap.milestones && roadmap.milestones.length > 0 && (
        <Card glass="interactive" className="p-6 border-white/80 animate-slideUp stagger-3">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E5DF]/70">
            <div>
              <h3 className="font-heading text-base font-bold text-[#171918]">Your Learning Roadmap Stages</h3>
              <p className="text-xs text-[#626763] mt-0.5">{roadmap.careerGoal} track</p>
            </div>
            <Link to={ROUTES.ROADMAP}>
              <Button variant="outline" size="sm">
                Open Interactive Roadmap →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {roadmap.milestones.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl flex flex-col justify-between hover-lift transition-all ${
                  m.status === 'COMPLETED'
                    ? 'glass-panel border-[#C2D8C9] bg-[#D8E8DE]/35'
                    : m.status === 'IN_PROGRESS'
                    ? 'glass-panel-elevated border-[#1F6B4F]/40 ring-1 ring-[#1F6B4F]/25'
                    : 'glass-panel border-white/60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-bold text-[#626763]">Stage {m.order}</span>
                    <Badge
                      variant={
                        m.status === 'COMPLETED'
                          ? 'forest'
                          : m.status === 'IN_PROGRESS'
                          ? 'warning'
                          : 'outline'
                      }
                      size="sm"
                    >
                      {m.status === 'IN_PROGRESS' ? 'Current' : m.status}
                    </Badge>
                  </div>
                  <h4 className="font-heading text-sm font-bold text-[#171918] mb-1">{m.title}</h4>
                  <p className="text-xs text-[#626763] line-clamp-2">{m.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E5E5DF]/60 flex items-center justify-between text-[11px] text-[#626763]">
                  <span>{m.estimatedHours} hrs</span>
                  <span className="font-medium text-[#1F6B4F] truncate max-w-[120px]">
                    {m.skillsCovered?.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
