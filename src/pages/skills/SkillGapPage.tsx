import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { skillsApi, ISkillGapPriorityReadout } from '@/api/endpoints/skills.api'
import { ROUTES } from '@/constants/routes'
import { ArrowRight, CheckCircle2, Target } from 'lucide-react'

export const SkillGapPage: React.FC = () => {
  const [readout, setReadout] = useState<ISkillGapPriorityReadout | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSkillGapData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await skillsApi.getSkillGapPriority()
        setReadout(data)
      } catch (err: unknown) {
        console.error('Failed to fetch skill gap analysis readout:', err)
        setError('Unable to load skill gap analysis data.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSkillGapData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Calculating objective skill gap matrix..." minHeight="min-h-[350px]" />
  }

  if (error || !readout) {
    return <ErrorState message={error || 'Skill gap data is temporarily unavailable.'} />
  }

  const snapshots = readout.snapshots || []
  const metSkills = snapshots.filter((s) => s.gap === 0)
  const gapSkills = snapshots.filter((s) => s.gap > 0).sort((a, b) => a.priorityRank - b.priorityRank)

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
              Target Role: {readout.targetCareerTitle}
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
              <AnimatedCounter value={readout.overallReadinessScore} suffix="%" />
            </p>
            <span className="text-[11px] font-medium text-[#1F6B4F] bg-[#D8E8DE]/80 px-2.5 py-0.5 rounded-full mt-1 inline-block border border-[#C2D8C9]">
              {readout.overallReadinessScore >= 70 ? 'Strong Trajectory' : readout.overallReadinessScore >= 40 ? 'Active Development' : 'Initial Calibration'}
            </span>
          </div>
        </div>

        {/* 2. SKILL COMPARISON VISUALIZATION */}
        <div className="pt-6 space-y-5">
          <div className="flex justify-between items-center text-xs font-semibold text-[#626763] uppercase tracking-wider">
            <span>Skill</span>
            <span>Current vs. Target Level</span>
          </div>

          <div className="space-y-3.5">
            {snapshots.map((item) => (
              <div
                key={item.skillId}
                className="p-4 rounded-xl glass-panel border-white/80 space-y-2.5 transition-all duration-200 hover:border-[#1F6B4F]/40 hover-lift group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-heading text-sm sm:text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
                      {item.skillName}
                    </span>
                    <span className="text-xs text-[#626763] ml-2">({item.category})</span>
                  </div>
                  <div className="text-xs font-semibold">
                    <span className="text-[#1F6B4F]">Current {item.currentLevel}%</span>
                    <span className="text-[#8E948F] mx-2">→</span>
                    <span className="text-[#171918]">Target {item.targetLevel}%</span>
                  </div>
                </div>

                {/* Overlaid Dual Bar */}
                <div className="relative w-full h-3 bg-[#EAE8E1] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-[#E5E5DF] rounded-full"
                    style={{ width: `${item.targetLevel}%` }}
                  />
                  <div
                    className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-1000 ${
                      item.currentLevel >= item.targetLevel
                        ? 'bg-[#1F6B4F]'
                        : item.currentLevel >= 50
                        ? 'bg-[#1F6B4F] progress-shimmer'
                        : 'bg-[#E7A84B] progress-shimmer'
                    }`}
                    style={{ width: `${item.currentLevel}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#626763]">
                  <span>Status: {item.gapStatus}</span>
                  <span className={item.gap > 0 ? 'text-[#A66E1D] font-semibold' : 'text-[#1F6B4F] font-semibold'}>
                    {item.gap > 0 ? `Gap: +${item.gap}% needed` : 'Benchmark Met ✓'}
                  </span>
                </div>
              </div>
            ))}
          </div>
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

          <ul className="space-y-3 pt-1">
            {metSkills.length === 0 ? (
              <li className="text-xs text-[#626763]">No verified target-met skills yet. Complete your roadmap modules to build mastery.</li>
            ) : (
              metSkills.map((str) => (
                <li key={str.skillId} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#171918]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B4F] mt-2 shrink-0" />
                  <span><strong>{str.skillName}</strong>: {str.currentLevel}% (Target: {str.targetLevel}%)</span>
                </li>
              ))
            )}
          </ul>
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

          <div className="space-y-2.5 pt-1">
            {gapSkills.length === 0 ? (
              <p className="text-xs text-[#626763]">All target skills are met! No active gaps.</p>
            ) : (
              gapSkills.slice(0, 3).map((focus, idx) => (
                <div key={focus.skillId} className="p-3 rounded-xl glass-panel border-white/70 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#171918]">{focus.skillName}</span>
                    <Badge variant="warning" size="sm">Priority #{idx + 1}</Badge>
                  </div>
                  <p className="text-[11px] text-[#626763]">
                    Current {focus.currentLevel}% $\to$ Target {focus.targetLevel}%. Importance: {focus.importance}.
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 4. NATURAL RECOMMENDATION CALLOUT */}
      <div className="p-6 sm:p-7 rounded-2xl glass-panel border-[#C2D8C9] space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
            Path Synthesis
          </span>
          <p className="font-heading text-base sm:text-lg font-semibold text-[#171918] leading-relaxed">
            {gapSkills.length > 0
              ? `“Your top priority focus is ${gapSkills[0].skillName}. Closing this ${gapSkills[0].gap}% gap will accelerate your progress toward becoming a ${readout.targetCareerTitle}.”`
              : `“You have met all required skill benchmarks for ${readout.targetCareerTitle}!”`}
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
