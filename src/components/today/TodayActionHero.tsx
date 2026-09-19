import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { Zap, Clock, Target, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { SkillGap } from '@/types/skill.types'

interface TodayActionHeroProps {
  targetRole: string
  topGap?: SkillGap | null
  activeMilestoneTitle?: string | null
  estimatedEffort?: string
  isCompleted?: boolean
  onMarkCompleted?: () => void
}

export const TodayActionHero: React.FC<TodayActionHeroProps> = ({
  targetRole,
  topGap,
  activeMilestoneTitle,
  estimatedEffort = '45 mins',
  isCompleted = false,
  onMarkCompleted,
}) => {
  const skillName =
    topGap?.skillName || (activeMilestoneTitle ? activeMilestoneTitle.split(' ')[0] : 'Core Engineering')

  const actionTitle = topGap
    ? `Build & master ${skillName} implementation patterns`
    : `Complete ${skillName} roadmap stage`

  const actionType = topGap ? 'Practical Challenge' : 'Roadmap Module'

  const whyItMatters = topGap
    ? `Closing your ${topGap.gap}-point gap in ${skillName} directly unlocks the core backend benchmark needed for ${targetRole}.`
    : `Strengthens foundational skills required for your active ${targetRole} milestone track.`

  const targetRoute = topGap ? ROUTES.CHALLENGES : ROUTES.ROADMAP

  return (
    <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#D8E8DE]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          {/* Header Tag Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
              <Zap className="w-5 h-5 fill-current" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Today's High-Impact Action
            </span>
            <Badge variant="forest" size="sm" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {actionType}
            </Badge>
            {topGap?.priority && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  topGap.priority === 'HIGH'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {topGap.priority} Priority
              </span>
            )}
          </div>

          {/* Action Title */}
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight leading-snug">
              {actionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] mt-1.5">
              Target Career: <strong className="text-[#171918]">{targetRole}</strong>
            </p>
          </div>

          {/* Why It Matters Callout */}
          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Why This Matters Now
            </span>
            <p className="text-xs sm:text-sm text-[#171918] leading-relaxed">
              {whyItMatters}
            </p>
          </div>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#626763] pt-1">
            <span className="flex items-center gap-1.5 font-medium text-[#171918]">
              <Clock className="w-4 h-4 text-[#1F6B4F]" />
              Estimated Effort: <strong>{estimatedEffort}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#1F6B4F] font-semibold">
              <Target className="w-4 h-4" />
              Focus Skill: {skillName}
            </span>
            {topGap && (
              <>
                <span>•</span>
                <span className="text-red-700 font-semibold">
                  Remaining Skill Gap: {topGap.gap} pts
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Button Section */}
        <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
          {isCompleted ? (
            <div className="p-4 rounded-xl bg-[#D8E8DE] border border-[#C2D8C9] text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#1F6B4F] text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[#1F6B4F]">Action Completed!</p>
              <p className="text-[11px] text-[#626763]">Progress & Skill Evidence recorded.</p>
            </div>
          ) : (
            <>
              <Link to={targetRoute} className="w-full">
                <Button variant="primary" size="lg" className="w-full shadow-md" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Start Activity Now
                </Button>
              </Link>
              {onMarkCompleted && (
                <Button variant="outline" size="sm" onClick={onMarkCompleted} className="w-full text-xs">
                  Mark as Complete
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

export default TodayActionHero
