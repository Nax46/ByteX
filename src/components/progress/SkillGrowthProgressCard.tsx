import React from 'react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SkillGap } from '@/types/skill.types'
import { Award, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react'

interface SkillGrowthProgressCardProps {
  skillGaps: SkillGap[]
}

export const SkillGrowthProgressCard: React.FC<SkillGrowthProgressCardProps> = ({ skillGaps }) => {
  if (!skillGaps || skillGaps.length === 0) {
    return (
      <Card className="p-6 border-[#E5E5DF] bg-white space-y-4">
        <h3 className="font-heading text-base font-bold text-[#171918]">Skill Level Progression</h3>
        <p className="text-xs text-[#626763]">No skill data recorded yet. Complete an assessment to track skill growth.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-[#E5E5DF] bg-white space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E5E5DF]">
          <div className="space-y-0.5">
            <h3 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1F6B4F]" />
              Skill Level Progression
            </h3>
            <p className="text-xs text-[#626763]">Current proficiency vs required career target</p>
          </div>

          <span className="text-xs font-bold text-[#1F6B4F] bg-[#D8E8DE] px-2.5 py-1 rounded-md">
            {skillGaps.filter((s) => s.currentLevel >= s.targetLevel).length} / {skillGaps.length} Met
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {skillGaps.map((item) => {
            const isMet = item.currentLevel >= item.targetLevel
            const gapMagnitude = Math.max(0, item.targetLevel - item.currentLevel)
            const pct = Math.min(100, Math.round((item.currentLevel / (item.targetLevel || 100)) * 100))

            return (
              <div key={item.skillId} className="space-y-1.5 p-3 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
                <div className="flex items-center justify-between text-xs font-semibold text-[#171918] flex-wrap gap-1">
                  <div className="flex items-center gap-1.5">
                    {isMet ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6B4F]" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />
                    )}
                    <span className="font-bold">{item.skillName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#626763]">
                      Current: <strong className="text-[#171918]">{item.currentLevel}%</strong> / Target: <strong className="text-[#1F6B4F]">{item.targetLevel}%</strong>
                    </span>

                    {isMet ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D8E8DE] text-[#1F6B4F]">
                        Target Met
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#D97706]">
                        -{gapMagnitude} pts Gap
                      </span>
                    )}
                  </div>
                </div>

                <ProgressBar
                  value={pct}
                  size="sm"
                  variant={isMet ? 'forest' : item.priority === 'HIGH' ? 'amber' : 'forest'}
                  label={`${item.skillName} Level`}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-[#E5E5DF] text-xs text-[#626763] flex items-center justify-between">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-[#1F6B4F]" />
          Evaluated against career standards
        </span>
        <span className="font-semibold text-[#171918]">Source: Diagnostic Readout</span>
      </div>
    </Card>
  )
}
