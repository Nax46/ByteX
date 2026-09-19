import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { Zap, Clock, ArrowRight, Target } from 'lucide-react'
import { SkillGap } from '@/types/skill.types'

interface TodayActionWidgetProps {
  targetRole: string
  topGap?: SkillGap | null
  activeMilestoneTitle?: string | null
}

export const TodayActionWidget: React.FC<TodayActionWidgetProps> = ({
  targetRole,
  topGap,
  activeMilestoneTitle,
}) => {
  const skillName =
    (topGap && typeof topGap.skillName === 'string' && topGap.skillName.trim())
      ? topGap.skillName
      : (typeof activeMilestoneTitle === 'string' && activeMilestoneTitle.trim())
      ? activeMilestoneTitle.trim().split(' ')[0]
      : 'Core Competency'
  const actionTitle = topGap
    ? `Master ${skillName} implementation & practice patterns`
    : `Complete ${skillName} study milestone`

  const whyItMatters = topGap
    ? `Closing the ${topGap.gap}-point gap in ${skillName} is required for your target ${targetRole} path.`
    : `Reinforces foundational competencies for your target ${targetRole} roadmap.`

  // Determine destination route
  const targetRoute = topGap ? ROUTES.CHALLENGES : ROUTES.ROADMAP

  return (
    <Card glass="elevated" sheen className="p-6 border-white/80 animate-slideUp relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#D8E8DE] text-[#1F6B4F]">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Today's Career Action
            </span>
            <Badge variant="forest" size="sm">High Impact</Badge>
          </div>

          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
            {actionTitle}
          </h2>

          <p className="text-xs sm:text-sm text-[#626763] max-w-2xl leading-relaxed">
            <strong className="text-[#171918]">Why this matters:</strong> {whyItMatters}
          </p>

          <div className="flex items-center gap-4 text-xs text-[#626763] pt-1">
            <span className="flex items-center gap-1.5 font-medium text-[#171918]">
              <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
              Est. Effort: 45 mins
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#1F6B4F] font-semibold">
              <Target className="w-3.5 h-3.5" />
              Focus Skill: {skillName}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <Link to={targetRoute}>
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Action →
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default TodayActionWidget
