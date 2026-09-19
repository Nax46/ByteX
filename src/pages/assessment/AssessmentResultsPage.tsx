import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { LoadingState } from '@/components/common/LoadingState'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { reassessmentApi } from '@/api/endpoints/reassessment.api'
import { roadmapApi } from '@/api/endpoints/roadmap.api'
import { AssessmentResult, IReassessmentSummary } from '@/types/assessment.types'
import { ROUTES } from '@/constants/routes'
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

export const AssessmentResultsPage: React.FC = () => {
  const location = useLocation()
  const stateResult = (location.state as { result?: AssessmentResult })?.result || null
  const stateSummary = (location.state as { summary?: IReassessmentSummary })?.summary || null

  const [result, setResult] = useState<AssessmentResult | null>(stateResult)
  const [summary, setSummary] = useState<IReassessmentSummary | null>(stateSummary)
  const [isLoading, setIsLoading] = useState<boolean>(!result && !summary)
  const [isAdapting, setIsAdapting] = useState<boolean>(false)
  const [adaptFeedback, setAdaptFeedback] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchReports = async () => {
      setIsLoading(true)
      try {
        // 1. Fetch real Person 2 reassessment summary
        const sumRes = await reassessmentApi.getSummary()
        if (isMounted && sumRes?.summary) {
          setSummary(sumRes.summary)
        }
      } catch {
        // Reassessment summary not available or first attempt
      }

      try {
        // 2. Fetch latest assessment result fallback
        const data = await assessmentApi.getLatestResult()
        if (isMounted && data) {
          setResult((prev) => prev || data)
        }
      } catch {
        // Latest result fallback
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    if (!summary || !result) {
      fetchReports()
    } else {
      setIsLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [summary, result])

  const handleAdaptRoadmap = async () => {
    setIsAdapting(true)
    setAdaptFeedback(null)
    try {
      const res = await roadmapApi.generateAdaptiveRoadmap(true)
      setAdaptFeedback(
        `Adaptive roadmap V${res.roadmap?.version || 2} generated successfully from your latest evaluation!`
      )
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to adapt roadmap. Please ensure target career is configured.'
      setAdaptFeedback(msg)
    } finally {
      setIsAdapting(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Fetching your latest assessment report..." minHeight="min-h-[350px]" />
  }

  if (!result && !summary) {
    return (
      <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
        <PageHeader
          title="Assessment Skill Report"
          subtitle="View verified evaluation scores and milestone adjustments."
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.DASHBOARD },
            { label: 'Assessment', href: ROUTES.ASSESSMENT },
            { label: 'Skill Report' },
          ]}
        />
        <Card className="p-8 text-center space-y-4 bg-white border-[#E5E5DF]">
          <Award className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No assessment completed yet</h3>
          <p className="text-xs text-[#626763] max-w-md mx-auto">
            Take your diagnostic skill assessment to receive calibrated score benchmarks and tailored roadmap recommendations.
          </p>
          <Link to={ROUTES.ASSESSMENT}>
            <Button variant="primary" size="md">
              Start Assessment
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const overallCurrentScore = summary ? summary.overallCurrentScore : result?.score ?? 0
  const overallPreviousScore = summary?.overallPreviousScore ?? null
  const overallChange = summary?.overallChange ?? (result as any)?.overallChange ?? null
  const attemptCount = summary?.attemptCount ?? 1
  const isReassessment = attemptCount >= 2
  const completedDate = summary?.latestCompletedAt || result?.completedAt

  return (
    <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title={isReassessment ? 'Reassessment Skill Report' : 'Assessment Skill Report'}
        subtitle={`Completed on ${completedDate ? new Date(completedDate).toLocaleDateString() : 'Recent'} ${
          isReassessment ? `• Reassessment #${attemptCount} Verified` : '• Baseline Diagnostic Evaluation'
        }`}
        badge={
          <Badge variant="forest">
            {isReassessment ? `Attempt #${attemptCount} Verified` : 'Completed'}
          </Badge>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Assessment', href: ROUTES.ASSESSMENT },
          { label: 'Skill Report' },
        ]}
      />

      {/* Summary Score Card */}
      <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF] shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Evaluation Benchmark
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              {isReassessment ? 'Reassessment Demonstrated Score' : 'Your Demonstrated Skill Score'}
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] max-w-md leading-relaxed">
              Overall verified score: <strong>{overallCurrentScore}%</strong>.
              {overallChange !== null ? (
                <span className={overallChange >= 0 ? ' text-emerald-700 font-semibold' : ' text-rose-700 font-semibold'}>
                  {' '}{overallChange >= 0 ? `+${overallChange}% improvement` : `${overallChange}% change`} from prior evaluation.
                </span>
              ) : (
                ' Baseline calibrated score recorded across assessed competencies.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {overallChange !== null && isReassessment && (
                <Badge
                  variant={overallChange > 0 ? 'forest' : overallChange < 0 ? 'danger' : 'outline'}
                  size="sm"
                  className="flex items-center gap-1 font-semibold"
                >
                  {overallChange > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : overallChange < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                  <span>{overallChange > 0 ? 'IMPROVED' : overallChange < 0 ? 'DECLINED' : 'UNCHANGED'}</span>
                </Badge>
              )}

              {overallPreviousScore !== null && (
                <span className="text-[11px] text-[#626763]">
                  Prior Attempt: {overallPreviousScore}%
                </span>
              )}

              <Badge
                variant={
                  result?.integrityStatus === 'TERMINATED_VIOLATION'
                    ? 'danger'
                    : result?.integrityStatus === 'WARNING_ISSUED'
                    ? 'warning'
                    : 'forest'
                }
                size="sm"
              >
                {result?.integrityStatus === 'TERMINATED_VIOLATION'
                  ? 'Violations Exceeded'
                  : result?.integrityStatus === 'WARNING_ISSUED'
                  ? 'Completed with Warnings'
                  : 'Verified Integrity'}
              </Badge>
            </div>
          </div>
          <ProgressRing value={overallCurrentScore} label="Score" variant="forest" size={130} />
        </div>
      </Card>

      {/* Evaluated Skills Delta / Comparison Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Evaluated Skills or Reassessment Skill Comparisons */}
        <Card className="p-6 bg-white border-[#E5E5DF]">
          <h3 className="font-heading text-base font-bold text-[#171918] mb-4">
            {summary && summary.skillComparisons?.length > 0
              ? 'Skill Competency Comparisons'
              : 'Evaluated Skill Levels'}
          </h3>

          {summary && summary.skillComparisons && summary.skillComparisons.length > 0 ? (
            <div className="space-y-3">
              {summary.skillComparisons.map((sc, idx) => (
                <div
                  key={sc.skillId || idx}
                  className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#171918] block">
                      {sc.skillName || sc.skillSlug || `Skill ${idx + 1}`}
                    </span>
                    <span className="text-[11px] text-[#626763]">
                      {sc.previousScore !== null ? `Prior: ${sc.previousScore}% → ` : ''}
                      Now: {sc.currentScore}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {sc.change !== null && sc.change !== 0 ? (
                      <Badge
                        variant={sc.change > 0 ? 'forest' : 'danger'}
                        size="sm"
                        className="font-mono text-[10px]"
                      >
                        {sc.change > 0 ? `+${sc.change}%` : `${sc.change}%`}
                      </Badge>
                    ) : null}

                    <Badge
                      variant={
                        sc.trend === 'IMPROVED'
                          ? 'forest'
                          : sc.trend === 'DECLINED'
                          ? 'danger'
                          : 'outline'
                      }
                      size="sm"
                      className="text-[10px]"
                    >
                      {sc.trend === 'NEW_EVIDENCE' ? 'NEW' : sc.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : result?.evaluatedSkills && result.evaluatedSkills.length > 0 ? (
            <div className="space-y-3">
              {result.evaluatedSkills.map((sk, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-[#171918]">{sk.skillName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#626763]">Level {sk.demonstratedLevel}</span>
                    {sk.delta > 0 ? (
                      <Badge variant="forest" size="sm">+{sk.delta}</Badge>
                    ) : sk.delta < 0 ? (
                      <Badge variant="danger" size="sm">{sk.delta}</Badge>
                    ) : (
                      <Badge variant="default" size="sm">Par</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#626763]">No specific skill deltas recorded for this test.</p>
          )}
        </Card>

        {/* Identified Gaps */}
        <Card className="p-6 bg-white border-[#E5E5DF]">
          <h3 className="font-heading text-base font-bold text-[#171918] mb-4">Identified Skill Gaps</h3>
          {result?.identifiedGaps && result.identifiedGaps.length > 0 ? (
            <div className="space-y-3">
              {result.identifiedGaps.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex items-center gap-2.5 text-xs text-[#171918]"
                >
                  <AlertTriangle className="w-4 h-4 text-[#E7A84B] shrink-0" />
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#D8E8DE]/40 border border-[#C2D8C9] space-y-2 text-xs text-[#1F6B4F]">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Assessment Completed</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#626763]">
                Your demonstrated proficiency levels have been calibrated. Gaps can be reviewed in detail on the Skill Gap Matrix.
              </p>
              <Link to={ROUTES.SKILL_GAP}>
                <Button variant="outline" size="sm" className="mt-1">
                  View Skill Gap Matrix →
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Adaptive Roadmap Integration Banner */}
      <Card className="p-6 bg-white border-[#E5E5DF]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E7A84B]" />
              Adaptive Learning Roadmap
            </h3>
            <p className="text-xs text-[#626763] max-w-lg leading-relaxed">
              Recalibrate your personal learning journey using your latest evaluation evidence. Closed gaps are automatically retired and active stages are re-ordered.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            isLoading={isAdapting}
            onClick={handleAdaptRoadmap}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Adapt Roadmap
          </Button>
        </div>

        {adaptFeedback && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#D8E8DE]/60 border border-[#C2D8C9] text-xs font-semibold text-[#1F6B4F] flex items-center gap-2 animate-slideUp">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{adaptFeedback}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 mt-6 border-t border-[#E5E5DF]">
          <Link to={ROUTES.ASSESSMENT}>
            <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Retake Assessment
            </Button>
          </Link>
          <Link to={ROUTES.ROADMAP}>
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Go to Learning Path
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
