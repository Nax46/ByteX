import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { assessmentApi, ReassessmentSummaryResponse } from '@/api/endpoints/assessment.api'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react'

export const AssessmentResultsPage: React.FC = () => {
  const [summaryData, setSummaryData] = useState<ReassessmentSummaryResponse['summary'] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await assessmentApi.getReassessmentSummary()
        if (res && res.summary) {
          setSummaryData(res.summary)
        }
      } catch (err: unknown) {
        console.error('Failed to load assessment report:', err)
        setError('Unable to load assessment report from backend.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading your verified assessment report..." minHeight="min-h-[350px]" />
  }

  if (error || !summaryData) {
    return <ErrorState message={error || 'Assessment report is temporarily unavailable.'} />
  }

  const { overallCurrentScore, overallChange, attemptCount, skillComparisons } = summaryData

  return (
    <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Assessment Skill Report"
        subtitle={`Evaluation Report (Attempt #${attemptCount})`}
        badge={<Badge variant="forest">Verified</Badge>}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Assessment', href: ROUTES.ASSESSMENT },
          { label: 'Skill Report' },
        ]}
      />

      {/* Summary Score Card */}
      <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Evaluation Benchmark
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Your Demonstrated Skill Score
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] max-w-md leading-relaxed">
              Overall verified score: {overallCurrentScore}%. {overallChange >= 0 ? `+${overallChange}% improvement from prior evaluation.` : `${overallChange}% change.`}
            </p>
          </div>
          <ProgressRing value={overallCurrentScore} label="Score" variant="forest" size={130} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Evaluated Skills Delta */}
        <Card className="p-6 bg-white border-[#E5E5DF]">
          <h3 className="font-heading text-base font-bold text-[#171918] mb-4">Evaluated Skill Levels</h3>
          <div className="space-y-3">
            {skillComparisons.map((sk) => (
              <div
                key={sk.skillId}
                className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-[#171918]">{sk.skillName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#626763]">{sk.currentScore}%</span>
                  {sk.change > 0 ? (
                    <Badge variant="forest" size="sm">+{sk.change}%</Badge>
                  ) : sk.change < 0 ? (
                    <Badge variant="danger" size="sm">{sk.change}%</Badge>
                  ) : (
                    <Badge variant="default" size="sm">{sk.trend}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Actions */}
        <Card className="p-6 bg-white border-[#E5E5DF]">
          <h3 className="font-heading text-base font-bold text-[#171918] mb-4">Recommended Next Steps</h3>
          <div className="space-y-3">
            {skillComparisons.filter((s) => s.change < 0 || s.currentScore < 80).map((gap) => (
              <div
                key={gap.skillId}
                className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex items-center gap-2.5 text-xs text-[#171918]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0" />
                <span>Focus on <strong>{gap.skillName}</strong> (Current score: {gap.currentScore}%)</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#E5E5DF]">
        <Link to={ROUTES.ASSESSMENT}>
          <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Retake Assessment
          </Button>
        </Link>
        <Link to={ROUTES.ROADMAP}>
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Go to Learning Path
          </Button>
        </Link>
      </div>
    </div>
  )
}
