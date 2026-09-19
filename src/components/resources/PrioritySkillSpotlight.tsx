import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Target, Zap, Filter, ArrowRight } from 'lucide-react'
import { SkillGap } from '@/types/skill.types'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface PrioritySkillSpotlightProps {
  prioritySkill: SkillGap | null
  onFilterByFocusSkill?: (skillName: string) => void
  isFilteredByFocusSkill?: boolean
}

export const PrioritySkillSpotlight: React.FC<PrioritySkillSpotlightProps> = ({
  prioritySkill,
  onFilterByFocusSkill,
  isFilteredByFocusSkill,
}) => {
  if (!prioritySkill) {
    return (
      <Card className="p-5 border-[#E5E5DF] bg-[#F8F7F3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-[#171918]">Priority Skill Focus</h4>
            <p className="text-xs text-[#626763]">
              All core target skills currently meet or exceed required target levels. Browse general career development resources below.
            </p>
          </div>
        </div>
        <Link to={ROUTES.SKILL_GAP}>
          <Button variant="outline" size="sm" className="text-xs shrink-0">
            View Skill Gap Report
          </Button>
        </Link>
      </Card>
    )
  }

  const gapMagnitude = Math.max(0, prioritySkill.targetLevel - prioritySkill.currentLevel)

  return (
    <Card className="p-5 sm:p-6 border-[#1F6B4F]/30 bg-gradient-to-r from-[#F4F9F6] via-white to-[#F8F7F3] shadow-xs relative overflow-hidden space-y-4">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="forest" size="sm" className="bg-[#1F6B4F] text-white">
            <Zap className="w-3 h-3 inline mr-1" />
            Priority Focus Skill
          </Badge>

          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E5F3EB] text-[#1F6B4F] border border-[#1F6B4F]/20">
            Priority: {prioritySkill.priority || 'High'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onFilterByFocusSkill && (
            <Button
              variant={isFilteredByFocusSkill ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onFilterByFocusSkill(prioritySkill.skillName)}
              className="text-xs font-semibold"
              leftIcon={<Filter className="w-3.5 h-3.5" />}
            >
              {isFilteredByFocusSkill ? 'Showing Focus Skill Resources' : `Filter by ${prioritySkill.skillName}`}
            </Button>
          )}

          <Link to={ROUTES.SKILL_GAP}>
            <Button variant="ghost" size="sm" className="text-xs text-[#1F6B4F] font-semibold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Skill Gap
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
        <div className="md:col-span-5 space-y-1">
          <h3 className="font-heading text-xl font-extrabold text-[#171918]">
            {prioritySkill.skillName}
          </h3>
          <p className="text-xs text-[#626763] leading-relaxed">
            This is your highest impact skill gap. Mastering this topic directly unlocks your career roadmap progression.
          </p>
        </div>

        <div className="md:col-span-7 bg-white p-3.5 rounded-xl border border-[#E5E5DF] grid grid-cols-3 gap-3 text-center">
          <div>
            <span className="block text-[11px] font-semibold text-[#8E948F] uppercase tracking-wider">Current Level</span>
            <span className="text-base font-bold text-[#171918]">{prioritySkill.currentLevel}%</span>
          </div>

          <div className="border-x border-[#E5E5DF]">
            <span className="block text-[11px] font-semibold text-[#8E948F] uppercase tracking-wider">Target Level</span>
            <span className="text-base font-bold text-[#1F6B4F]">{prioritySkill.targetLevel}%</span>
          </div>

          <div>
            <span className="block text-[11px] font-semibold text-[#8E948F] uppercase tracking-wider">Skill Gap</span>
            <span className="text-base font-bold text-[#D97706]">-{gapMagnitude} pts</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
