import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { LoadingState } from '@/components/common/LoadingState'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { AssessmentResult } from '@/types/assessment.types'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, AlertTriangle, RotateCcw, ArrowRight, Award } from 'lucide-react'

export const AssessmentResultsPage: React.FC = () => {
  const location = useLocation()
  const [result, setResult] = useState<AssessmentResult | null>(
    (location.state as { result?: AssessmentResult })?.result || null
  )
  const [isLoading, setIsLoading] = useState<boolean>(!result)

  useEffect(() => {
    if (result) return

    let isMounted = true
    const fetchResult = async () => {
      setIsLoading(true)
      try {
        const data = await assessmentApi.getLatestResult()
        if (isMounted) {
          setResult(data || null)
        }
      } catch (err) {
        console.error('Failed to load latest assessment result:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchResult()
    return () => {
      isMounted = false
    }
  }, [result])

  if (isLoading) {
    return <LoadingState message="Fetching your latest assessment report..." minHeight="min-h-[350px]" />
  }

  if (!result) {
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
            Take your first diagnostic skill assessment to receive calibrated score benchmarks and tailored roadmap recommendations.
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

  return (
    <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Assessment Skill Report"
        subtitle={`Completed on ${result.completedAt ? new Date(result.completedAt).toLocaleDateString() : 'Recent'} for ${result.category || 'General Assessment'}`}
        badge={<Badge variant="forest">Completed</Badge>}
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
              You answered {result.correctQuestions} out of {result.totalQuestions} questions correctly. Your skills inventory and gap matrix have been updated.
            </p>
          </div>
          <ProgressRing value={result.score} label="Score" variant="forest" size={130} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Evaluated Skills Delta */}
        <Card className="p-6 bg-white border-[#E5E5DF]">
          <h3 className="font-heading text-base font-bold text-[#171918] mb-4">Evaluated Skill Levels</h3>
          {result.evaluatedSkills && result.evaluatedSkills.length > 0 ? (
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
          {result.identifiedGaps && result.identifiedGaps.length > 0 ? (
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
            <p className="text-xs text-[#626763]">No critical gaps flagged. Solid performance across assessed areas.</p>
          )}
        </Card>
      </div>

      {/* Recommended Next Actions */}
      <Card className="p-6 bg-white border-[#E5E5DF]">
        <h3 className="font-heading text-base font-bold text-[#171918] mb-3">Recommended Roadmap Adjustments</h3>
        <p className="text-xs text-[#626763] mb-4">
          Based on your assessment results, the following next steps have been prioritized in your learning path:
        </p>
        {result.recommendedRoadmapSteps && result.recommendedRoadmapSteps.length > 0 ? (
          <div className="space-y-2 mb-6">
            {result.recommendedRoadmapSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-[#171918]">
                <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#626763] mb-6">Continue progressing on your active milestones.</p>
        )}

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
      </Card>
    </div>
  )
}
