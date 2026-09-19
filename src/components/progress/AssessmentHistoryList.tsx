import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AssessmentResult } from '@/types/assessment.types'
import { ClipboardCheck, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface AssessmentHistoryListProps {
  results: AssessmentResult[]
}

export const AssessmentHistoryList: React.FC<AssessmentHistoryListProps> = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <Card className="p-6 border-[#E5E5DF] bg-white space-y-4">
        <h3 className="font-heading text-base font-bold text-[#171918]">Diagnostic Assessment History</h3>
        <p className="text-xs text-[#626763]">No assessment history available yet. Complete a diagnostic assessment to see verified performance records.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-[#E5E5DF] bg-white space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E5E5DF]">
          <div className="space-y-0.5">
            <h3 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#1F6B4F]" />
              Diagnostic Assessment History
            </h3>
            <p className="text-xs text-[#626763]">Persisted score history and proctored verification results</p>
          </div>

          <Badge variant="forest" size="sm" className="font-bold">
            {results.length} Attempt{results.length > 1 ? 's' : ''} Record
          </Badge>
        </div>

        <div className="space-y-3 pt-2">
          {results.map((res, index) => {
            const dateStr = res.completedAt
              ? new Date(res.completedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent'

            return (
              <div
                key={res.id || index}
                className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#1F6B4F]" />
                    <span className="font-bold text-[#171918]">{res.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#626763] font-medium">{dateStr}</span>
                    <span className="text-xs font-bold text-[#1F6B4F] bg-[#D8E8DE] px-2 py-0.5 rounded-md">
                      Score: {res.score}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#626763] flex-wrap gap-2">
                  <span>
                    Questions: <strong className="text-[#171918]">{res.correctQuestions}/{res.totalQuestions} Correct</strong>
                  </span>

                  <span className="flex items-center gap-1 text-[#1F6B4F] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Proctoring: {res.integrityStatus || 'VERIFIED'}
                  </span>
                </div>

                {res.evaluatedSkills && res.evaluatedSkills.length > 0 && (
                  <div className="pt-2 border-t border-[#E5E5DF]/70 flex flex-wrap gap-1.5">
                    {res.evaluatedSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-white border border-[#E5E5DF] text-[#171918] font-medium"
                      >
                        {sk.skillName}: Level {sk.demonstratedLevel}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-[#E5E5DF] text-xs text-[#626763] flex items-center justify-between">
        <span className="flex items-center gap-1 text-[#1F6B4F] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Proctored diagnostic attempt records
        </span>
        <span>Source: Assessment Engine</span>
      </div>
    </Card>
  )
}
