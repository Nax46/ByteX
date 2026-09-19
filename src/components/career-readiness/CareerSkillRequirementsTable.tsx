import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BackendCareerReadiness } from '@/api/endpoints/careers.api'
import { ShieldCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

interface CareerSkillRequirementsTableProps {
  skillBreakdown: BackendCareerReadiness['skillBreakdown']
  careerTitle: string
}

export const CareerSkillRequirementsTable: React.FC<CareerSkillRequirementsTableProps> = ({
  skillBreakdown,
  careerTitle,
}) => {
  if (!skillBreakdown || skillBreakdown.length === 0) {
    return (
      <Card className="p-6 border-[#E5E5DF] bg-white space-y-4">
        <h3 className="font-heading text-base font-bold text-[#171918]">Career Skill Requirements</h3>
        <p className="text-xs text-[#626763]">No career skill requirements data loaded.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-[#E5E5DF] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF] flex-wrap gap-2">
        <div className="space-y-0.5">
          <h3 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1F6B4F]" />
            Required Skills for {careerTitle}
          </h3>
          <p className="text-xs text-[#626763]">
            Verified student proficiency vs required target levels mapped by industry standards
          </p>
        </div>

        <Badge variant="forest" size="sm" className="font-bold">
          {skillBreakdown.filter((s) => s.status === 'MET').length} / {skillBreakdown.length} Requirements Met
        </Badge>
      </div>

      <div className="space-y-3 pt-1">
        {skillBreakdown.map((skill) => {
          const isMet = skill.status === 'MET'
          const isDeveloping = skill.status === 'DEVELOPING'
          const gap = Math.max(0, skill.requiredLevel - skill.currentLevel)
          const pct = Math.min(100, Math.round((skill.currentLevel / (skill.requiredLevel || 100)) * 100))

          return (
            <div
              key={skill.skillId || skill.slug || skill.name}
              className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold text-[#171918]">
                    {isMet ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1F6B4F]" />
                    ) : isDeveloping ? (
                      <Clock className="w-4 h-4 text-[#D97706]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                    )}
                    <span>{skill.name}</span>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-[#E5E5DF] text-[#626763]">
                    {skill.category}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      skill.importance === 'CRITICAL'
                        ? 'bg-[#FEE2E2] text-[#DC2626]'
                        : skill.importance === 'HIGH'
                        ? 'bg-[#FEF3C7] text-[#D97706]'
                        : 'bg-[#E5E5DF] text-[#626763]'
                    }`}
                  >
                    {skill.importance} Importance
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#626763]">
                    Current: <strong className="text-[#171918]">{skill.currentLevel}%</strong> / Required: <strong className="text-[#1F6B4F]">{skill.requiredLevel}%</strong>
                  </span>

                  {isMet ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#D8E8DE] text-[#1F6B4F]">
                      ✓ MET
                    </span>
                  ) : isDeveloping ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#FEF3C7] text-[#D97706]">
                      ◐ DEVELOPING (-{gap} pts)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#FEE2E2] text-[#DC2626]">
                      ✕ NEEDS WORK (-{gap} pts)
                    </span>
                  )}
                </div>
              </div>

              <ProgressBar
                value={pct}
                size="sm"
                variant={isMet ? 'forest' : isDeveloping ? 'amber' : 'forest'}
                label={`${skill.name} Readiness`}
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
