import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { FileText, ArrowRight, CheckCircle2, Award } from 'lucide-react'
import { AssessmentResult } from '@/types/assessment.types'

interface PassportAssessmentHistoryProps {
  assessments: AssessmentResult[]
}

export const PassportAssessmentHistory: React.FC<PassportAssessmentHistoryProps> = ({
  assessments,
}) => {
  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]/70">
        <div>
          <h2 className="font-heading text-base sm:text-lg font-bold text-[#171918] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1F6B4F]" />
            Verified Diagnostic Assessment History
          </h2>
          <p className="text-xs text-[#626763] mt-0.5">
            Evaluations conducted under anti-cheat proctored diagnostic controls
          </p>
        </div>
        <Link to={ROUTES.ASSESSMENT_RESULTS} className="print:hidden">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Detailed Analysis
          </Button>
        </Link>
      </div>

      {assessments.length > 0 ? (
        <div className="space-y-3">
          {assessments.map((ass) => (
            <div
              key={ass.id}
              className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#C2D8C9] transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] shrink-0 mt-0.5">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#171918]">{ass.title || 'Diagnostic Skill Assessment'}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#626763] mt-1">
                    <span>Category: <strong>{ass.category}</strong></span>
                    <span>•</span>
                    <span>Questions: <strong>{ass.correctQuestions}/{ass.totalQuestions} Correct</strong></span>
                    <span>•</span>
                    <span>Completed: <strong>{ass.completedAt ? new Date(ass.completedAt).toLocaleDateString() : 'Recent'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <div className="text-right">
                  <span className="text-base font-bold text-[#1F6B4F] font-heading block">
                    {ass.score}%
                  </span>
                  <Badge variant={ass.score >= 70 ? 'forest' : 'warning'} size="sm">
                    {ass.score >= 70 ? '✓ Proficient' : 'Needs Practice'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-[#626763] space-y-3">
          <p>No assessment history recorded yet. Take an assessment to evaluate your skills.</p>
          <Link to={ROUTES.ASSESSMENT} className="print:hidden">
            <Button variant="outline" size="sm">
              Take Assessment
            </Button>
          </Link>
        </div>
      )}
    </Card>
  )
}

export default PassportAssessmentHistory
