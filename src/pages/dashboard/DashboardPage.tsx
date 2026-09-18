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
import { MOCK_DASHBOARD_DATA, DashboardData } from '@/mocks/dashboard.mock'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { ArrowRight, Clock } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true)
      setError(null)
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))
        setData(MOCK_DASHBOARD_DATA)
      } catch (err: unknown) {
        setError('Unable to load dashboard data.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading your SkillPath dashboard..." minHeight="min-h-[350px]" />
  }

  if (error || !data) {
    return <ErrorState message={error || 'Dashboard data is temporarily unavailable.'} />
  }

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* 1. GREETING & CONTEXT */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#171918]">
            Good morning, Alex 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#626763] mt-1">
            Here's where you are in your learning journey.
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
          value={<AnimatedCounter value={72} suffix="%" />}
          subtitle="Target: Frontend Developer"
          trend={{ value: '+4%', isPositive: true }}
          className="animate-slideUp stagger-1"
        />
        <StatCard
          title="Learning Progress"
          value={<AnimatedCounter value={64} suffix="%" />}
          subtitle="Active Roadmap"
          trend={{ value: '+6%', isPositive: true }}
          className="animate-slideUp stagger-2"
        />
        <StatCard
          title="Skills Improved"
          value={<AnimatedCounter value={8} />}
          subtitle="Verified competencies"
          className="animate-slideUp stagger-3"
        />
        <StatCard
          title="Learning Streak"
          value={<AnimatedCounter value={12} suffix=" days" />}
          subtitle="Keep your habit going!"
          trend={{ value: 'Active', isPositive: true }}
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
              <span className="text-xs text-[#626763]">Active Course</span>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
              {data.currentCourse.title}
            </h2>

            <p className="text-xs sm:text-sm text-[#626763]">
              Current module: <strong className="text-[#171918]">{data.currentCourse.currentModule}</strong>
            </p>

            {/* Subtle progress indicator */}
            <div className="pt-2 max-w-md">
              <ProgressBar
                value={data.currentCourse.progressPercent}
                variant="forest"
                size="sm"
                label="Course completion"
                showPercentage
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0">
            <span className="text-xs text-[#626763] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
              Estimated: {data.currentCourse.estimatedTime}
            </span>

            <Link to={ROUTES.ROADMAP}>
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Continue Learning →
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 4. TWO-COLUMN: SKILL OVERVIEW & RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left: Skill Snapshot (Horizontal progress bars) */}
        <div className="lg:col-span-6 space-y-4">
          <Card glass="interactive" className="p-6 border-white/80 h-full flex flex-col justify-between animate-slideUp stagger-1">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#171918]">Your Skill Snapshot</h3>
                  <p className="text-xs text-[#626763] mt-0.5">Evaluated proficiency across core competencies</p>
                </div>
                <Link to={ROUTES.SKILLS} className="text-xs font-semibold text-[#1F6B4F] hover:underline">
                  View all 6 skills →
                </Link>
              </div>

              <div className="space-y-4">
                {data.skillSnapshot.slice(0, 5).map((skill) => (
                  <div key={skill.name} className="space-y-1.5">
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
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E5DF]/70 flex items-center justify-between text-xs">
              <span className="text-[#626763]">Frontend Target Alignment:</span>
              <span className="font-semibold text-[#1F6B4F] bg-[#D8E8DE]/80 px-2.5 py-0.5 rounded-full border border-[#C2D8C9]">
                Strong Foundation
              </span>
            </div>
          </Card>
        </div>

        {/* Right: Personalized Recommendations (With "Why" Explanations) */}
        <div className="lg:col-span-6 space-y-4">
          <Card glass="interactive" className="p-6 border-white/80 h-full flex flex-col justify-between animate-slideUp stagger-2">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#171918]">Recommended for you</h3>
                  <p className="text-xs text-[#626763] mt-0.5">Tailored to your current skills and target role</p>
                </div>
                <Badge variant="forest" size="sm">Context-Aware</Badge>
              </div>

              <div className="space-y-3.5">
                {/* Recommendation 1 */}
                <div className="p-3.5 rounded-xl glass-panel border-white/70 hover-lift transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-heading text-sm font-bold text-[#171918]">React Fundamentals</h4>
                    <span className="text-[11px] text-[#626763] font-medium">12 hrs</span>
                  </div>
                  <p className="text-xs text-[#626763] leading-relaxed">
                    “Your JavaScript foundation is strong enough to start React.”
                  </p>
                </div>

                {/* Recommendation 2 */}
                <div className="p-3.5 rounded-xl glass-panel border-white/70 hover-lift transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-heading text-sm font-bold text-[#171918]">Git & GitHub</h4>
                    <span className="text-[11px] text-[#A66E1D] font-semibold bg-[#FDF4E6] px-2 py-0.5 rounded-full border border-[#E7A84B]/30">Priority Gap</span>
                  </div>
                  <p className="text-xs text-[#626763] leading-relaxed">
                    “Git is currently one of the biggest gaps in your Frontend Developer path.”
                  </p>
                </div>

                {/* Recommendation 3 */}
                <div className="p-3.5 rounded-xl glass-panel border-white/70 hover-lift transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-heading text-sm font-bold text-[#171918]">API Integration</h4>
                    <span className="text-[11px] text-[#626763] font-medium">6 hrs</span>
                  </div>
                  <p className="text-xs text-[#626763] leading-relaxed">
                    “Recommended as your next step after React fundamentals.”
                  </p>
                </div>
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
            <h3 className="font-heading text-base font-bold text-[#171918]">Your Learning Roadmap Stages</h3>
            <p className="text-xs text-[#626763] mt-0.5">Frontend Developer preparation track</p>
          </div>
          <Link to={ROUTES.ROADMAP}>
            <Button variant="outline" size="sm">
              Open Interactive Roadmap →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {data.currentRoadmapMilestones.map((m) => (
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
                <span className="font-medium text-[#1F6B4F]">{m.skillsCovered.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
