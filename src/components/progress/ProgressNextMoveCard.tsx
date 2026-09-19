import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SkillGap } from '@/types/skill.types'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Zap, Calendar, Target, Map, BookOpen, FolderGit2, ArrowRight } from 'lucide-react'

interface ProgressNextMoveCardProps {
  prioritySkill: SkillGap | null
}

export const ProgressNextMoveCard: React.FC<ProgressNextMoveCardProps> = ({ prioritySkill }) => {
  const gapMagnitude = prioritySkill ? Math.max(0, prioritySkill.targetLevel - prioritySkill.currentLevel) : 0

  return (
    <Card className="p-6 sm:p-7 border-[#1F6B4F]/40 bg-gradient-to-r from-[#F4F9F6] via-white to-[#F8F7F3] shadow-md space-y-5 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1F6B4F] text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Your Next Career Move
            </span>

            {prioritySkill && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#E5F3EB] text-[#1F6B4F] text-xs font-semibold border border-[#1F6B4F]/20">
                Priority: {prioritySkill.priority || 'High'}
              </span>
            )}
          </div>

          <h3 className="font-heading text-xl font-extrabold text-[#171918]">
            {prioritySkill ? `Focus on closing your gap in ${prioritySkill.skillName}` : 'Continue your daily career roadmap'}
          </h3>

          <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
            {prioritySkill
              ? `Your current level in ${prioritySkill.skillName} is ${prioritySkill.currentLevel}% (Target: ${prioritySkill.targetLevel}%). Closing this -${gapMagnitude} pt gap will unlock your next career readiness level.`
              : 'Complete your daily learning focus action or start a practical project build to increase your readiness score.'}
          </p>
        </div>

        {/* Big CTA to Today's Focus Action */}
        <div className="shrink-0 w-full sm:w-auto">
          <Link to={ROUTES.TODAY}>
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto bg-[#1F6B4F] text-white font-bold px-6 text-sm shadow-sm hover:bg-[#17543E]"
              leftIcon={<Calendar className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Today&apos;s Focus
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="pt-4 border-t border-[#E5E5DF] flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-[#626763] font-semibold">Quick Pathway Actions:</span>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <Link to={ROUTES.SKILL_GAP}>
            <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Target className="w-3.5 h-3.5" />}>
              Skill Gap
            </Button>
          </Link>

          <Link to={ROUTES.ROADMAP}>
            <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Map className="w-3.5 h-3.5" />}>
              Roadmap
            </Button>
          </Link>

          <Link to={ROUTES.RESOURCES}>
            <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
              Resources
            </Button>
          </Link>

          <Link to={ROUTES.PROJECTS}>
            <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<FolderGit2 className="w-3.5 h-3.5" />}>
              Projects
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
