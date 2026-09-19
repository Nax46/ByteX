import React from 'react'
import { Card } from '@/components/ui/Card'
import { BackendCareerReadiness } from '@/api/endpoints/careers.api'
import { Award, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'

interface StrongAndGapSpotlightProps {
  skillBreakdown: BackendCareerReadiness['skillBreakdown']
}

export const StrongAndGapSpotlight: React.FC<StrongAndGapSpotlightProps> = ({ skillBreakdown }) => {
  const metSkills = skillBreakdown.filter((s) => s.status === 'MET')
  const gapSkills = skillBreakdown.filter((s) => s.status !== 'MET').sort((a, b) => b.gap - a.gap)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strong Areas Card */}
      <Card className="p-5 sm:p-6 border-[#E5E5DF] bg-white space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3">
            <h4 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1F6B4F]" />
              Verified Strong Areas
            </h4>
            <span className="text-xs font-bold text-[#1F6B4F] bg-[#D8E8DE] px-2 py-0.5 rounded">
              {metSkills.length} Verified
            </span>
          </div>

          <p className="text-xs text-[#626763]">
            Skills where your current proficiency meets or exceeds target career benchmark levels.
          </p>

          {metSkills.length > 0 ? (
            <div className="space-y-2">
              {metSkills.map((sk) => (
                <div
                  key={sk.skillId}
                  className="p-2.5 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 font-bold text-[#171918]">
                    <CheckCircle2 className="w-4 h-4 text-[#1F6B4F]" />
                    <span>{sk.name}</span>
                  </div>
                  <span className="font-semibold text-[#1F6B4F]">
                    {sk.currentLevel}% / {sk.requiredLevel}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#626763] italic py-2">
              Complete diagnostic assessments to verify your strong capability areas.
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[#E5E5DF]">
          <Link to={ROUTES.SKILLS}>
            <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
              View Skill Profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Active Readiness Gaps & Blockers Card */}
      <Card className="p-5 sm:p-6 border-[#E5E5DF] bg-white space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3">
            <h4 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              Career Bottlenecks & Gaps
            </h4>
            <span className="text-xs font-bold text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded">
              {gapSkills.length} Remaining
            </span>
          </div>

          <p className="text-xs text-[#626763]">
            Primary capability gaps blocking full career readiness for your target role.
          </p>

          {gapSkills.length > 0 ? (
            <div className="space-y-2">
              {gapSkills.slice(0, 4).map((sk) => (
                <div
                  key={sk.skillId}
                  className="p-2.5 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#171918] block">{sk.name}</span>
                    <span className="text-[10px] text-[#626763]">
                      Current: {sk.currentLevel}% · Required: {sk.requiredLevel}%
                    </span>
                  </div>
                  <span className="font-bold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded text-[11px]">
                    -{sk.gap} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#1F6B4F] font-semibold py-2">
              All core career skill requirements are met! No active blockers detected.
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[#E5E5DF]">
          <Link to={ROUTES.SKILL_GAP}>
            <Button variant="primary" size="sm" className="w-full text-xs font-bold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Skill Gap Report
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
