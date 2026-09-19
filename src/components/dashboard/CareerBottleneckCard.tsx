import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { SkillGap } from '@/types/skill.types'

interface CareerBottleneckCardProps {
  topGap?: SkillGap | null
  targetRole: string
}

export const CareerBottleneckCard: React.FC<CareerBottleneckCardProps> = ({
  topGap,
  targetRole,
}) => {
  const skillName = topGap?.skillName || 'Backend Engineering'
  const currentLevel = topGap?.currentLevel ?? 50
  const targetLevel = topGap?.targetLevel ?? 90
  const gapAmount = topGap?.gap ?? 40
  const priority = topGap?.priority || 'HIGH'

  return (
    <Card glass="interactive" className="p-6 border-white/80 flex flex-col justify-between animate-slideUp">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-red-100 text-red-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">
              Career Bottleneck
            </span>
          </div>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              priority === 'HIGH'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {priority} Priority ({gapAmount} pts)
          </span>
        </div>

        <div>
          <h3 className="font-heading text-lg font-bold text-[#171918]">
            {skillName}
          </h3>
          <p className="text-xs text-[#626763] mt-1 leading-relaxed">
            {topGap?.recommendedAction ||
              `Current proficiency (${currentLevel}%) is below target requirement (${targetLevel}%) for your ${targetRole} roadmap.`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-2.5 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[11px] text-[#626763] block">Current Score</span>
            <span className="text-sm font-bold text-[#171918]">{currentLevel}%</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#D8E8DE]/50 border border-[#C2D8C9]">
            <span className="text-[11px] text-[#1F6B4F] block">Target Score</span>
            <span className="text-sm font-bold text-[#1F6B4F]">{targetLevel}%</span>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#E5E5DF]/70">
        <Link to={ROUTES.SKILL_GAP}>
          <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Work on This Gap
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default CareerBottleneckCard
