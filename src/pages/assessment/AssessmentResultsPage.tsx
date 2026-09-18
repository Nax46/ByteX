import React from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { MOCK_LATEST_RESULT } from '@/mocks/assessment.mock'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, AlertTriangle, RotateCcw, ArrowRight } from 'lucide-react'

export const AssessmentResultsPage: React.FC = () => {
  const result = MOCK_LATEST_RESULT

  return (
    <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Assessment Skill Report"
        subtitle={`Completed on ${new Date(result.completedAt).toLocaleDateString()} for ${result.category}`}
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
        </Card>

        {/* Identified Gaps */}
        <Card className="p-6 bg-white border-[#E5E5DF]">
          <h3 className="font-heading text-base font-bold text-[#171918] mb-4">Identified Skill Gaps</h3>
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
        </Card>
      </div>

      {/* Recommended Next Actions */}
      <Card className="p-6 bg-white border-[#E5E5DF]">
        <h3 className="font-heading text-base font-bold text-[#171918] mb-3">Recommended Roadmap Adjustments</h3>
        <p className="text-xs text-[#626763] mb-4">
          Based on your assessment results, the following next steps have been prioritized in your learning path:
        </p>
        <div className="space-y-2 mb-6">
          {result.recommendedRoadmapSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-[#171918]">
              <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0" />
              <span>{step}</span>
            </div>
          ))}
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
      </Card>
    </div>
  )
}
