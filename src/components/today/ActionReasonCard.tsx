import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { AlertTriangle, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react'
import { SkillGap } from '@/types/skill.types'

interface ActionReasonCardProps {
  topGap?: SkillGap | null
  targetRole: string
}

export const ActionReasonCard: React.FC<ActionReasonCardProps> = ({
  topGap,
  targetRole,
}) => {
  const skillName = topGap?.skillName || 'Backend Engineering'
  const currentLevel = topGap?.currentLevel ?? 50
  const targetLevel = topGap?.targetLevel ?? 90
  const gapAmount = topGap?.gap ?? 40
  const priority = topGap?.priority || 'HIGH'

  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]/70">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-100 text-red-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 block">
                Career Bottleneck Alignment
              </span>
              <p className="text-xs text-[#626763]">Connecting today's action directly to your goal</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              priority === 'HIGH'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {priority} Priority Gap
          </span>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-2">
            <h3 className="font-heading text-lg font-bold text-[#171918]">
              Target Bottleneck: {skillName}
            </h3>
            <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
              {topGap?.recommendedAction ||
                `Your current proficiency (${currentLevel}%) is below the benchmark (${targetLevel}%) required for hiring readiness as a ${targetRole}. Today's action directly bridges this gap.`}
            </p>

            <div className="flex items-center gap-2 text-xs text-[#1F6B4F] pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Completing this action registers verified skill evidence for {skillName}.</span>
            </div>
          </div>

          {/* Metric Box */}
          <div className="md:col-span-5 grid grid-cols-3 gap-2 bg-[#F8F7F3] p-4 rounded-xl border border-[#E5E5DF] text-center">
            <div>
              <span className="text-[11px] text-[#626763] block font-medium">Current</span>
              <span className="text-base font-bold text-[#171918]">{currentLevel}%</span>
            </div>
            <div className="border-x border-[#E5E5DF]">
              <span className="text-[11px] text-[#626763] block font-medium">Target</span>
              <span className="text-base font-bold text-[#1F6B4F]">{targetLevel}%</span>
            </div>
            <div>
              <span className="text-[11px] text-red-700 block font-medium">Gap</span>
              <span className="text-base font-bold text-red-700">-{gapAmount} pts</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-[#E5E5DF]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[#626763] flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#1F6B4F]" />
            Closing this gap increases your Career Readiness score.
          </span>
          <Link to={ROUTES.SKILL_GAP}>
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open Skill Gap Matrix
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default ActionReasonCard
