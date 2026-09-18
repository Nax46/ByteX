import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { skillsApi } from '@/api/endpoints/skills.api'
import { profileApi } from '@/api/endpoints/profile.api'
import { SkillGap } from '@/types/skill.types'
import { UserStats } from '@/types/user.types'
import { useAuth } from '@/hooks/useAuth'
import { ArrowRight, CheckCircle2, Target, Award } from 'lucide-react'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const SkillGapPage: React.FC = () => {
  const { user } = useAuth()
  const [gaps, setGaps] = useState<SkillGap[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [gapsRes, statsRes] = await Promise.allSettled([
          skillsApi.getSkillGaps(),
          profileApi.getUserStats(),
        ])

        if (!isMounted) return
        if (gapsRes.status === 'fulfilled') setGaps(gapsRes.value || [])
        if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      } catch (err) {
        console.error('Failed to load skill gaps:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <LoadingState message="Analyzing your skill gap matrix..." minHeight="min-h-[350px]" />
  }

  const readinessScore = stats?.careerReadiness ?? 0
  const strengths = gaps.filter((g) => g.gap <= 0 || g.currentLevel >= g.targetLevel)
  const focusAreas = gaps.filter((g) => g.gap > 0).sort((a, b) => b.gap - a.gap)

  const topGap = focusAreas[0]

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. HEADER & READINESS HERO */}
      <PageHeader
        title="Skill Gap Analysis"
        subtitle="Objective comparison of your demonstrated abilities against industry standards for your target role."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'My Skills', href: ROUTES.SKILLS },
          { label: 'Skill Gap' },
        ]}
      />

      {/* Hero Callout Banner */}
      <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E5E5DF]/70">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[#1F6B4F] text-xs font-semibold">
              <Target className="w-3.5 h-3.5" />
              Target Role: {user?.careerGoal || DEFAULT_CAREER_GOAL}
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Your skill gap is your roadmap.
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] max-w-xl leading-relaxed">
              Instead of learning everything from scratch, focus directly on the specific gaps separating your current abilities from engineering benchmarks.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border-white/80 text-center sm:text-right shrink-0 hover-lift">
            <p className="text-xs text-[#626763]">Current Career Readiness</p>
            <p className="font-heading text-3xl font-extrabold text-[#1F6B4F]">
              <AnimatedCounter value={readinessScore} suffix="%" />
            </p>
            <span className="text-[11px] font-medium text-[#1F6B4F] bg-[#D8E8DE]/80 px-2.5 py-0.5 rounded-full mt-1 inline-block border border-[#C2D8C9]">
              {readinessScore >= 70 ? 'Strong Trajectory' : readinessScore >= 40 ? 'Progressing Well' : 'Starting Out'}
            </span>
          </div>
        </div>

        {/* 2. SKILL COMPARISON VISUALIZATION */}
        <div className="pt-6 space-y-5">
          <div className="flex justify-between items-center text-xs font-semibold text-[#626763] uppercase tracking-wider">
            <span>Skill</span>
            <span>Current vs. Target Benchmark</span>
          </div>

          {gaps.length > 0 ? (
            <div className="space-y-3.5">
              {gaps.map((item) => {
                const currentPct = Math.min(100, Math.round(item.currentLevel <= 5 ? item.currentLevel * 20 : item.currentLevel))
                const targetPct = Math.min(100, Math.round(item.targetLevel <= 5 ? item.targetLevel * 20 : item.targetLevel))
                const gapPct = Math.max(0, targetPct - currentPct)

                return (
                  <div
                    key={item.skillId || item.skillName}
                    className="p-4 rounded-xl glass-panel border-white/80 space-y-2.5 transition-all duration-200 hover:border-[#1F6B4F]/40 hover-lift group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-heading text-sm sm:text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
                          {item.skillName}
                        </span>
                        <span className="text-xs text-[#626763] ml-2">({item.category || 'General'})</span>
                      </div>
                      <div className="text-xs font-semibold">
                        <span className="text-[#1F6B4F]">Current {currentPct}%</span>
                        <span className="text-[#8E948F] mx-2">→</span>
                        <span className="text-[#171918]">Target {targetPct}%</span>
                      </div>
                    </div>

                    {/* Overlaid Dual Bar */}
                    <div className="relative w-full h-3 bg-[#EAE8E1] rounded-full overflow-hidden">
                      {/* Target benchmark background fill */}
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-[#E5E5DF] rounded-full"
                        style={{ width: `${targetPct}%` }}
                      />
                      {/* Current progress fill with shimmer */}
                      <div
                        className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-1000 ${
                          currentPct >= targetPct
                            ? 'bg-[#1F6B4F]'
                            : currentPct >= 50
                            ? 'bg-[#1F6B4F] progress-shimmer'
                            : 'bg-[#E7A84B] progress-shimmer'
                        }`}
                        style={{ width: `${currentPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-[#626763]">
                      <span>{currentPct >= targetPct ? 'Benchmark Met' : `${item.priority} Priority Gap`}</span>
                      <span className={gapPct > 0 ? 'text-[#A66E1D] font-semibold' : 'text-[#1F6B4F] font-semibold'}>
                        {gapPct > 0 ? `Gap: +${gapPct}% needed` : 'Benchmark Met ✓'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#626763] space-y-3">
              <Award className="w-10 h-10 text-[#1F6B4F] mx-auto opacity-75" />
              <p>No skill gaps calculated yet. Complete an assessment to evaluate your role benchmarks.</p>
              <Link to={ROUTES.ASSESSMENT}>
                <Button variant="outline" size="sm">
                  Start Assessment
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* 3. TWO-COLUMN: YOUR STRENGTHS VS FOCUS NEXT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Strengths */}
        <Card glass="interactive" className="p-6 border-white/80 space-y-4 hover-lift">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5DF]/70">
            <CheckCircle2 className="w-5 h-5 text-[#1F6B4F]" />
            <h3 className="font-heading text-base font-bold text-[#171918]">Verified Strengths</h3>
          </div>
          <p className="text-xs text-[#626763]">
            Competencies where you already meet or exceed target expectations:
          </p>

          {strengths.length > 0 ? (
            <ul className="space-y-3 pt-1">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#171918]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B4F] mt-2 shrink-0" />
                  <span>{str.skillName} (Benchmark met)</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#626763] pt-2 italic">Complete assessments to showcase verified strengths.</p>
          )}
        </Card>

        {/* Focus Next */}
        <Card glass="interactive" className="p-6 border-white/80 space-y-4 hover-lift">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5DF]/70">
            <Target className="w-5 h-5 text-[#E7A84B]" />
            <h3 className="font-heading text-base font-bold text-[#171918]">Prioritized Focus Next</h3>
          </div>
          <p className="text-xs text-[#626763]">
            Highest-priority skills to study next to close your gap:
          </p>

          {focusAreas.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              {focusAreas.slice(0, 3).map((focus, idx) => (
                <div key={idx} className="p-3 rounded-xl glass-panel border-white/70 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#171918]">{focus.skillName}</span>
                    <Badge variant={focus.priority === 'HIGH' ? 'warning' : 'outline'} size="sm">
                      {focus.priority}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#626763]">
                    {focus.recommendedAction || `Focus on closing the ${focus.skillName} gap.`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#626763] pt-2 italic">No priority skill gaps identified.</p>
          )}
        </Card>
      </div>

      {/* 4. NATURAL RECOMMENDATION CALLOUT */}
      <div className="p-6 sm:p-7 rounded-2xl glass-panel border-[#C2D8C9] space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
            Path Synthesis
          </span>
          <p className="font-heading text-base sm:text-lg font-semibold text-[#171918] leading-relaxed">
            {topGap
              ? `“Closing your ${topGap.skillName} gap will yield the highest immediate momentum toward your goal.”`
              : '“Keep building hands-on projects and verifying your competencies with diagnostic assessments.”'}
          </p>
        </div>

        <div className="pt-2">
          <Link to={ROUTES.ROADMAP}>
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Build My Learning Path →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
