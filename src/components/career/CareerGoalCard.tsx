import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import { Target, Sparkles, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react'

export interface CareerGoalCardProps {
  careerTitle: string
  description?: string
  readinessPct?: number
  requiredSkillsCount?: number
  onTrackCount?: number
  onViewRequirements?: () => void
  onChangeCareer?: () => void
  className?: string
}

export const CareerGoalCard: React.FC<CareerGoalCardProps> = ({
  careerTitle,
  description = 'Your primary target career path guiding your personalized skill matrix, roadmap milestones, and daily career actions.',
  readinessPct = 72,
  requiredSkillsCount = 12,
  onTrackCount = 7,
  onViewRequirements,
  onChangeCareer,
  className = '',
}) => {
  return (
    <Card glass="elevated" sheen className={`p-6 sm:p-7 border-white/80 space-y-5 animate-slideUp ${className}`}>
      {/* Header & Goal Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]/70">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="forest" size="sm" className="flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-[#1F6B4F]" />
              Active Target Career Goal
            </Badge>
            <span className="text-xs text-[#626763] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F6B4F]" />
              Verified Goal Anchor
            </span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
            {careerTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#626763] max-w-xl leading-relaxed pt-0.5">
            {description}
          </p>
        </div>

        {/* Readiness Metric Ring/Summary */}
        <div className="sm:text-right shrink-0 bg-[#F8F7F3] p-3.5 rounded-xl border border-[#E5E5DF] min-w-44">
          <div className="flex items-baseline justify-between sm:justify-end gap-2">
            <span className="text-xs text-[#626763]">Career Readiness</span>
            <span className="font-heading text-xl font-bold text-[#1F6B4F]">{readinessPct}%</span>
          </div>
          <div className="mt-1.5">
            <ProgressBar value={readinessPct} variant={readinessPct >= 70 ? 'forest' : 'primary'} size="sm" />
          </div>
          <span className="text-[11px] text-[#626763] block text-right mt-1">
            {onTrackCount} of {requiredSkillsCount} skills on track
          </span>
        </div>
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]">
          <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-medium">
            Required Skills
          </span>
          <span className="font-heading text-base font-bold text-[#171918]">
            {requiredSkillsCount} Competencies
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]">
          <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-medium">
            Skills On Track
          </span>
          <span className="font-heading text-base font-bold text-[#1F6B4F]">
            {onTrackCount} Verified
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] col-span-2 sm:col-span-1">
          <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-medium">
            Gap Priority
          </span>
          <span className="font-heading text-base font-bold text-[#A66E1D]">
            {requiredSkillsCount - onTrackCount} Skills to Upgrade
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {onChangeCareer ? (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#626763]" />}
            onClick={onChangeCareer}
          >
            Change Target Career
          </Button>
        ) : (
          <Link to={ROUTES.CAREERS}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#626763]" />}
            >
              Explore Career Options
            </Button>
          </Link>
        )}

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onViewRequirements ? (
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={onViewRequirements}
            >
              View Skill Requirements
            </Button>
          ) : (
            <Link to={ROUTES.SKILL_GAP} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<Target className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Analyze Skill Gaps
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}
