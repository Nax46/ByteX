import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { AssessmentResult } from '@/types/assessment.types'
import { SkillGap } from '@/types/skill.types'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Award,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Target,
  Sparkles,
  Compass,
  Zap,
} from 'lucide-react'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const AssessmentResultsPage: React.FC = () => {
  const location = useLocation()
  const { user } = useAuth()
  const targetRole = user?.careerGoal || user?.targetCareer || DEFAULT_CAREER_GOAL

  const [result, setResult] = useState<AssessmentResult | null>(
    (location.state as { result?: AssessmentResult })?.result || null
  )
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(!result)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      try {
        const [resultRes, gapsRes] = await Promise.allSettled([
          result ? Promise.resolve(result) : assessmentApi.getLatestResult(),
          skillsApi.getSkillGaps(),
        ])

        if (!isMounted) return

        if (resultRes.status === 'fulfilled' && resultRes.value) {
          setResult(resultRes.value)
        }
        if (gapsRes.status === 'fulfilled' && gapsRes.value) {
          setSkillGaps(gapsRes.value)
        }
      } catch (err) {
        console.error('Failed to load assessment analysis:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [result])

  if (isLoading) {
    return <LoadingState message="Analyzing your diagnostic score against career benchmarks..." minHeight="min-h-[350px]" />
  }

  if (!result) {
    return (
      <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
        <PageHeader
          title="Skill Diagnostic Analysis"
          subtitle="View verified evaluation scores, skill gaps, and career roadmap adjustments."
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.DASHBOARD },
            { label: 'Assessment', href: ROUTES.ASSESSMENT },
            { label: 'Diagnostic Analysis' },
          ]}
        />
        <Card className="p-8 text-center space-y-4 bg-white border-[#E5E5DF]">
          <Award className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No assessment completed yet</h3>
          <p className="text-xs text-[#626763] max-w-md mx-auto">
            Take your first diagnostic skill assessment to receive calibrated score benchmarks and tailored roadmap recommendations for {targetRole}.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to={ROUTES.CAREERS}>
              <Button variant="outline" size="sm">
                Explore Careers
              </Button>
            </Link>
            <Link to={ROUTES.ASSESSMENT}>
              <Button variant="primary" size="md">
                Start Assessment
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const overallScore = result.score || 0
  const totalQ = result.totalQuestions || 10
  const correctQ = result.correctQuestions || Math.round((overallScore / 100) * totalQ)

  // Categorize evaluated skills into Strengths vs Needs Work
  const evaluatedSkills = result.evaluatedSkills || []
  const strengths = evaluatedSkills.filter((sk) => sk.demonstratedLevel >= 3 || sk.delta >= 0)
  const areaToImprove = evaluatedSkills.filter((sk) => sk.demonstratedLevel < 3 || sk.delta < 0)

  // Identify top bottleneck gap
  const topBottleneck = skillGaps.length > 0 ? skillGaps[0] : null
  const primaryGapText = result.identifiedGaps?.[0] || topBottleneck?.recommendedAction || 'Strengthen core architectural fundamentals'

  return (
    <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Skill Diagnostic Analysis"
        subtitle={`Career evaluation completed on ${result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'Today'} mapped for ${targetRole}`}
        badge={<Badge variant="forest">Diagnostic Verified</Badge>}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Assessment', href: ROUTES.ASSESSMENT },
          { label: 'Diagnostic Analysis' },
        ]}
      />

      {/* 1. CAREER CONTEXT ANCHOR & SUMMARY SCORE */}
      <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#E5E5DF]">
          <div className="space-y-2.5 text-center sm:text-left">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <Badge variant="forest" size="sm" className="flex items-center gap-1 font-semibold">
                <Briefcase className="w-3.5 h-3.5 text-[#1F6B4F]" />
                Target Role: {targetRole}
              </Badge>
              <Badge
                variant={
                  result.integrityStatus === 'TERMINATED_VIOLATION'
                    ? 'danger'
                    : result.integrityStatus === 'WARNING_ISSUED'
                    ? 'warning'
                    : 'forest'
                }
                size="sm"
                className="flex items-center gap-1"
              >
                {result.integrityStatus === 'TERMINATED_VIOLATION' ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>
                  {result.integrityStatus === 'TERMINATED_VIOLATION'
                    ? 'Violations Logged'
                    : result.integrityStatus === 'WARNING_ISSUED'
                    ? 'Completed with Warnings'
                    : 'Verified Integrity'}
                </span>
              </Badge>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Demonstrated Skill Benchmark
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] max-w-md leading-relaxed">
              Your overall verified accuracy score is <strong>{overallScore}%</strong> ({correctQ} of {totalQ} questions correct). This evaluation calibrates your {targetRole} skill matrix.
            </p>
          </div>

          <ProgressRing value={overallScore} label="Score" variant={overallScore >= 70 ? 'forest' : 'primary'} size={135} />
        </div>

        {/* 3 Metrics Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-semibold">
              Questions Answered
            </span>
            <span className="font-heading text-base font-bold text-[#171918]">
              {correctQ} / {totalQ} Correct
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-semibold">
              Skills Evaluated
            </span>
            <span className="font-heading text-base font-bold text-[#1F6B4F]">
              {evaluatedSkills.length || 4} Competencies
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] col-span-2 sm:col-span-1">
            <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-semibold">
              Primary Focus Area
            </span>
            <span className="font-heading text-base font-bold text-amber-800 truncate block">
              {topBottleneck?.skillName || evaluatedSkills[0]?.skillName || 'Backend APIs'}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. CAREER BOTTLENECK SPOTLIGHT */}
      {topBottleneck && (
        <Card className="p-6 bg-gradient-to-br from-white via-[#F8F7F3] to-[#FFFDF9] border-amber-300/70 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5DF]">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Identified Career Bottleneck
              </span>
              <h3 className="font-heading text-lg font-bold text-[#171918]">
                {topBottleneck.skillName}
              </h3>
            </div>
            <Badge variant="warning" size="sm" className="shrink-0">
              Gap Magnitude: -{topBottleneck.gap} pts
            </Badge>
          </div>
          <p className="text-xs text-[#626763] leading-relaxed">
            {topBottleneck.recommendedAction || `Upgrading ${topBottleneck.skillName} is your highest priority move to increase your readiness index for ${targetRole}.`}
          </p>
          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#626763]">
              Current Score: {topBottleneck.currentLevel}% vs Target: {topBottleneck.targetLevel}%
            </span>
            <Link to={ROUTES.SKILL_GAP}>
              <Button variant="primary" size="sm" rightIcon={<Compass className="w-3.5 h-3.5" />}>
                Work on Bottleneck Gap
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 3. TWO-COLUMN: EVALUATED SKILLS & DEMONSTRATED STRENGTHS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Evaluated Skill Levels */}
        <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
            <h3 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1F6B4F]" /> Demonstrated Skill Levels
            </h3>
            <span className="text-[11px] text-[#626763]">Level 1-5 scale</span>
          </div>

          {evaluatedSkills.length > 0 ? (
            <div className="space-y-3">
              {evaluatedSkills.map((sk, idx) => {
                const levelPct = Math.min(100, Math.round((sk.demonstratedLevel / 5) * 100))
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#171918]">{sk.skillName}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1F6B4F]">Level {sk.demonstratedLevel} / 5</span>
                        {sk.delta > 0 ? (
                          <Badge variant="forest" size="sm">+{sk.delta}</Badge>
                        ) : sk.delta < 0 ? (
                          <Badge variant="danger" size="sm">{sk.delta}</Badge>
                        ) : (
                          <Badge variant="default" size="sm">Par</Badge>
                        )}
                      </div>
                    </div>
                    <ProgressBar value={levelPct} variant={sk.demonstratedLevel >= 3 ? 'forest' : 'warning'} size="sm" />
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-[#626763]">No specific skill level deltas recorded for this test.</p>
          )}
        </Card>

        {/* Right: Identified Gaps & Focus Areas */}
        <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
            <h3 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Key Skill Gaps Flagged
            </h3>
            <Link to={ROUTES.SKILL_GAP} className="text-xs font-semibold text-[#1F6B4F] hover:underline">
              Matrix →
            </Link>
          </div>

          {result.identifiedGaps && result.identifiedGaps.length > 0 ? (
            <div className="space-y-2.5">
              {result.identifiedGaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] flex items-start gap-2.5 text-xs text-[#171918]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{gap}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#626763]">No critical gaps flagged. Demonstrates solid core technical alignment.</p>
          )}

          {strengths.length > 0 && (
            <div className="pt-3 border-t border-[#E5E5DF]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F6B4F] block mb-2">
                Demonstrated Strengths
              </span>
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((s, idx) => (
                  <Badge key={idx} variant="forest" size="sm" className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {s.skillName} (L{s.demonstratedLevel})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 4. "WHAT THIS MEANS" FACTUAL READOUT */}
      <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
        <h3 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#1F6B4F]" /> What This Diagnostic Means For Your Career
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
            <span className="font-bold text-[#1F6B4F] block">1. What You Demonstrated</span>
            <p className="text-[#626763] leading-relaxed">
              Solid grasp of verified concepts across {correctQ} questions, confirming foundational competency for {targetRole}.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
            <span className="font-bold text-amber-800 block">2. Where Gaps Remain</span>
            <p className="text-[#626763] leading-relaxed">
              {primaryGapText}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
            <span className="font-bold text-[#171918] block">3. Immediate Recommended Move</span>
            <p className="text-[#626763] leading-relaxed">
              {result.recommendedRoadmapSteps?.[0] || 'Focus on closing your primary skill gap to advance your active roadmap stage.'}
            </p>
          </div>
        </div>
      </Card>

      {/* 5. RECOMMENDED ROADMAP ADJUSTMENTS & NEXT ACTION CTAS */}
      <Card className="p-6 bg-white border-[#E5E5DF] space-y-5">
        <div>
          <h3 className="font-heading text-base font-bold text-[#171918] mb-1">
            Recommended Next Steps
          </h3>
          <p className="text-xs text-[#626763]">
            Your evaluation results have updated your learning roadmap priorities:
          </p>
        </div>

        {result.recommendedRoadmapSteps && result.recommendedRoadmapSteps.length > 0 ? (
          <div className="space-y-2.5">
            {result.recommendedRoadmapSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#171918]">
                <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#626763]">Continue progressing through your active learning path milestones.</p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E5E5DF]">
          <Link to={ROUTES.ASSESSMENT} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} className="w-full">
              Retake Diagnostic
            </Button>
          </Link>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link to={ROUTES.SKILL_GAP} className="flex-1 sm:flex-initial">
              <Button variant="outline" size="sm" leftIcon={<Target className="w-3.5 h-3.5 text-[#1F6B4F]" />} className="w-full">
                View Skill Gaps
              </Button>
            </Link>

            <Link to={ROUTES.ROADMAP} className="flex-1 sm:flex-initial">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="w-full">
                Open Learning Path
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
