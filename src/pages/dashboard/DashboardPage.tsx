import React, { useState, useEffect, useCallback } from 'react'
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
import { dashboardApi, DashboardSummaryResponse } from '@/api/endpoints/dashboard.api'
import { opportunitiesApi } from '@/api/endpoints/opportunities.api'
import { evidenceApi } from '@/api/endpoints/evidence.api'
import { UserStats, UserProfile } from '@/types/user.types'
import { Skill, SkillGap } from '@/types/skill.types'
import { Roadmap } from '@/types/roadmap.types'
import { Opportunity } from '@/types/opportunity.types'
import { SkillEvidenceItem } from '@/types/evidence.types'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'
import {
  ArrowRight,
  Clock,
  Target,
  Sparkles,
  Zap,
  AlertTriangle,
  Flag,
  Dumbbell,
  BadgeCheck,
  Briefcase,
  Bot,
  RefreshCw,
  Award,
  BookOpen,
  FolderGit2,
  TrendingUp,
} from 'lucide-react'

// Import Dashboard widgets
import TodayActionWidget from '@/components/dashboard/TodayActionWidget'
import CareerMissionCard from '@/components/dashboard/CareerMissionCard'
import CareerBottleneckCard from '@/components/dashboard/CareerBottleneckCard'
import DashboardNextMove from '@/components/dashboard/DashboardNextMove'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [gaps, setGaps] = useState<SkillGap[]>([])
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryResponse | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [evidenceList, setEvidenceList] = useState<SkillEvidenceItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [
        profileRes,
        statsRes,
        skillsRes,
        roadmapRes,
        gapsRes,
        summaryRes,
        oppsRes,
        evidenceRes,
      ] = await Promise.allSettled([
        profileApi.getProfile(),
        profileApi.getUserStats(),
        skillsApi.getSkills(),
        roadmapApi.getCurrentRoadmap(),
        skillsApi.getSkillGaps(),
        dashboardApi.getSummary(),
        opportunitiesApi.getOpportunities(),
        evidenceApi.getSkillEvidence(),
      ])

      if (profileRes.status === 'fulfilled' && profileRes.value) setProfile(profileRes.value)
      if (statsRes.status === 'fulfilled' && statsRes.value) setStats(statsRes.value)
      if (skillsRes.status === 'fulfilled') setSkills(Array.isArray(skillsRes.value) ? skillsRes.value : [])
      if (roadmapRes.status === 'fulfilled' && roadmapRes.value) setRoadmap(roadmapRes.value)
      if (gapsRes.status === 'fulfilled') setGaps(Array.isArray(gapsRes.value) ? gapsRes.value : [])
      if (summaryRes.status === 'fulfilled' && summaryRes.value) setDashboardSummary(summaryRes.value)
      if (oppsRes.status === 'fulfilled') setOpportunities(Array.isArray(oppsRes.value) ? oppsRes.value : [])
      if (evidenceRes.status === 'fulfilled') setEvidenceList(Array.isArray(evidenceRes.value) ? evidenceRes.value : [])
    } catch (err: unknown) {
      console.error('Failed to load dashboard data:', err)
      setError('Unable to fetch live career metrics. Showing offline dashboard view.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  if (isLoading) {
    return <LoadingState message="Loading your personalized SkillPath dashboard..." minHeight="min-h-[400px]" />
  }

  // Safe guarded data derivation
  const safeSkills = Array.isArray(skills) ? skills : []
  const safeGaps = Array.isArray(gaps) ? gaps : []
  const safeMilestones = Array.isArray(roadmap?.milestones) ? roadmap.milestones : []
  const safeOpportunities = Array.isArray(opportunities) ? opportunities : []
  const safeEvidence = Array.isArray(evidenceList) ? evidenceList : []

  const activeMilestone =
    safeMilestones.find((m) => m.status === 'IN_PROGRESS') ||
    safeMilestones[0] ||
    null

  const readinessScore = typeof stats?.careerReadiness === 'number' ? stats.careerReadiness : 68
  const progressScore = typeof roadmap?.progressPercentage === 'number' ? roadmap.progressPercentage : typeof stats?.overallScore === 'number' ? stats.overallScore : 45
  const skillsCount = typeof stats?.skillsTracked === 'number' ? stats.skillsTracked : safeSkills.length || 6
  const streakDays = typeof stats?.learningStreakDays === 'number' ? stats.learningStreakDays : 3

  const displayName =
    (typeof user?.name === 'string' && user.name.trim()) ||
    (typeof user?.fullName === 'string' && user.fullName.trim()) ||
    (typeof profile?.name === 'string' && profile.name.trim()) ||
    (typeof profile?.fullName === 'string' && profile.fullName.trim()) ||
    (typeof dashboardSummary?.profile?.fullName === 'string' && dashboardSummary.profile.fullName.trim()) ||
    'Learner'

  const firstName = typeof displayName === 'string' && displayName.trim() ? displayName.trim().split(' ')[0] : 'Learner'
  const targetRole =
    (typeof user?.careerGoal === 'string' && user.careerGoal.trim()) ||
    (typeof user?.targetCareer === 'string' && user.targetCareer.trim()) ||
    (typeof profile?.careerGoal === 'string' && profile.careerGoal.trim()) ||
    (typeof profile?.targetCareer === 'string' && profile.targetCareer.trim()) ||
    (typeof dashboardSummary?.profile?.targetCareer === 'string' && dashboardSummary.profile.targetCareer.trim()) ||
    DEFAULT_CAREER_GOAL

  const topGap = safeGaps.length > 0 ? safeGaps[0] : null
  const completedMilestones = safeMilestones.filter((m) => m.status === 'COMPLETED').length
  const totalMilestones = safeMilestones.length > 0 ? safeMilestones.length : 5

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* ERROR NOTICE IF NON-CRITICAL LOAD FAILED */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadDashboardData} leftIcon={<RefreshCw className="w-3 h-3" />}>
            Retry
          </Button>
        </div>
      )}

      {/* 1. GREETING & CAREER DIRECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#D8E8DE] text-[#1F6B4F] border border-[#C2D8C9]">
              Live Operating Readout
            </span>
            <span className="text-xs text-[#626763]">Updated just now</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#171918]">
            Good day, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#626763] mt-1">
            Targeting: <strong className="text-[#171918]">{targetRole}</strong> • Here is your active skill intelligence summary.
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

      {/* 2. CAREER SNAPSHOT METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Career Readiness"
          value={<AnimatedCounter value={readinessScore} suffix="%" />}
          subtitle={`Target: ${targetRole}`}
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

      {/* 3. TODAY'S CAREER ACTION WIDGET */}
      <TodayActionWidget
        targetRole={targetRole}
        topGap={topGap}
        activeMilestoneTitle={activeMilestone?.title}
      />

      {/* 4. CAREER MISSION & BOTTLENECK LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        <div className="lg:col-span-6">
          <CareerMissionCard
            targetRole={targetRole}
            completedMilestones={completedMilestones}
            totalMilestones={totalMilestones}
            progressPercent={progressScore}
          />
        </div>
        <div className="lg:col-span-6">
          <CareerBottleneckCard
            topGap={topGap}
            targetRole={targetRole}
          />
        </div>
      </div>

      {/* 5. TWO-COLUMN: SKILL SNAPSHOT & RECOMMENDED NEXT STEPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left: Skill Snapshot */}
        <div className="lg:col-span-6 space-y-4">
          <Card glass="interactive" className="p-6 border-white/80 h-full flex flex-col justify-between animate-slideUp stagger-1">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#171918]">Your Skill Snapshot</h3>
                  <p className="text-xs text-[#626763] mt-0.5">Live proficiency evaluation</p>
                </div>
                <Link to={ROUTES.SKILLS} className="text-xs font-semibold text-[#1F6B4F] hover:underline">
                  View all skills →
                </Link>
              </div>

              {safeSkills.length > 0 ? (
                <div className="space-y-4">
                  {safeSkills.slice(0, 5).map((skill) => (
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
                {targetRole}
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

              {safeGaps.length > 0 ? (
                <div className="space-y-3.5">
                  {safeGaps.slice(0, 3).map((gap) => (
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

      {/* 6. ACTIVE LEARNING ROADMAP PREVIEW */}
      {safeMilestones.length > 0 && (
        <Card glass="interactive" className="p-6 border-white/80 animate-slideUp stagger-3">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E5DF]/70">
            <div>
              <h3 className="font-heading text-base font-bold text-[#171918]">Your Learning Roadmap Stages</h3>
              <p className="text-xs text-[#626763] mt-0.5">{roadmap?.careerGoal || targetRole} track</p>
            </div>
            <Link to={ROUTES.ROADMAP}>
              <Button variant="outline" size="sm">
                Open Interactive Roadmap →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {safeMilestones.map((m) => (
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

      {/* 7. SKILL EVIDENCE & PROOF OF WORK PREVIEW */}
      <Card glass="interactive" className="p-6 border-white/80 animate-slideUp">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5DF]/70">
          <div>
            <h3 className="font-heading text-base font-bold text-[#171918]">Verified Skill Evidence</h3>
            <p className="text-xs text-[#626763] mt-0.5">Proof of work aggregated from assessments, drills, and projects</p>
          </div>
          <Link to={ROUTES.SKILL_EVIDENCE}>
            <Button variant="outline" size="sm" rightIcon={<BadgeCheck className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
              View Skill Evidence
            </Button>
          </Link>
        </div>

        {safeEvidence.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {safeEvidence.slice(0, 3).map((item) => (
              <div key={item.id} className="p-4 rounded-xl glass-panel border-white/70 space-y-2 hover-lift">
                <div className="flex items-center justify-between">
                  <Badge variant="forest" size="sm">
                    {item.sourceType}
                  </Badge>
                  <span className="text-[11px] font-semibold text-[#1F6B4F] flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {item.verificationStatus}
                  </span>
                </div>
                <h4 className="font-heading text-sm font-bold text-[#171918]">{item.title}</h4>
                <p className="text-xs text-[#626763] line-clamp-2">{item.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 space-y-2">
            <p className="text-xs text-[#626763]">Complete assessments or projects to generate verified skill evidence artifacts.</p>
            <Link to={ROUTES.ASSESSMENT}>
              <Button variant="outline" size="sm">
                Take Assessment
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* 8. OPPORTUNITY DISCOVERY HIGHLIGHTS */}
      <Card glass="interactive" className="p-6 border-white/80 animate-slideUp">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5DF]/70">
          <div>
            <h3 className="font-heading text-base font-bold text-[#171918]">Matching Career Opportunities</h3>
            <p className="text-xs text-[#626763] mt-0.5">Direct placement matches based on your target career profile</p>
          </div>
          <Link to={ROUTES.OPPORTUNITIES}>
            <Button variant="outline" size="sm" rightIcon={<Briefcase className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
              Explore Opportunities
            </Button>
          </Link>
        </div>

        {safeOpportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeOpportunities.slice(0, 3).map((opp) => (
              <div key={opp.id} className="p-4 rounded-xl glass-panel border-white/70 flex flex-col justify-between hover-lift">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" size="sm">
                      {opp.typeLabel}
                    </Badge>
                    <span className="text-[11px] font-medium text-[#626763]">{opp.stipendOrSalary}</span>
                  </div>
                  <h4 className="font-heading text-sm font-bold text-[#171918]">{opp.title}</h4>
                  <p className="text-xs text-[#626763] font-medium">{opp.organization} • {opp.location}</p>
                </div>
                <div className="pt-3 mt-3 border-t border-[#E5E5DF]/60 flex items-center justify-between text-xs">
                  <span className="text-[#626763]">Deadline: {opp.deadline}</span>
                  <Link to={ROUTES.OPPORTUNITIES} className="text-[#1F6B4F] font-semibold hover:underline">
                    View Match →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-xs text-[#626763]">No active opportunity matches found at this moment.</p>
          </div>
        )}
      </Card>

      {/* 9. CAREER ACCELERATION CYCLE */}
      <DashboardNextMove />

      {/* 10. AI MENTOR COMPACT ENTRY BANNER */}
      <Card glass="elevated" sheen className="p-6 border-white/80 animate-slideUp bg-gradient-to-r from-[#F8F7F3] via-[#D8E8DE]/40 to-[#F8F7F3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="p-2.5 rounded-xl bg-[#1F6B4F] text-white shrink-0 shadow-sm">
              <Bot className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-heading text-base font-bold text-[#171918]">Need Personal Career Guidance?</h3>
              <p className="text-xs text-[#626763] mt-0.5 max-w-xl">
                Consult your context-aware AI Mentor to analyze bottlenecks, clarify roadmap milestones, or review project evidence.
              </p>
            </div>
          </div>
          <Link to={ROUTES.MENTOR} className="shrink-0">
            <Button variant="primary" size="sm" rightIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Open AI Mentor
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default DashboardPage
