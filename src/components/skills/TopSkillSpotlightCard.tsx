import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import { AlertCircle, Target, ArrowRight, Sparkles, Compass } from 'lucide-react'

export interface TopSkillSpotlightCardProps {
  skillName: string
  category?: string
  currentLevel: number
  targetLevel: number
  gap: number
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL' | string
  targetRole?: string
  recommendedAction?: string
  onAnalyzeGap?: () => void
  className?: string
}

export const TopSkillSpotlightCard: React.FC<TopSkillSpotlightCardProps> = ({
  skillName,
  category = 'Core Competency',
  currentLevel,
  targetLevel,
  gap,
  priority = 'HIGH',
  targetRole = 'Full Stack Developer',
  recommendedAction,
  onAnalyzeGap,
  className = '',
}) => {
  return (
    <Card
      glass="elevated"
      sheen
      className={`p-6 sm:p-7 border-amber-300/60 bg-gradient-to-br from-white via-[#F8F7F3] to-[#FFFDF9] space-y-5 animate-slideUp shadow-md ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]/70">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="warning" size="sm" className="flex items-center gap-1 font-bold">
              <AlertCircle className="w-3 h-3 text-amber-700" />
              #1 Priority Skill to Improve
            </Badge>
            <span className="text-xs text-[#626763] font-medium">
              Target Role Bottleneck: <strong className="text-[#171918]">{targetRole}</strong>
            </span>
          </div>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
            {skillName}
          </h3>
          <p className="text-xs sm:text-sm text-[#626763] max-w-xl leading-relaxed">
            {recommendedAction ||
              `Upgrading ${skillName} is your highest priority move to advance your ${targetRole} career path.`}
          </p>
        </div>

        {/* Priority & Gap Badge Callout */}
        <div className="sm:text-right shrink-0 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 min-w-40">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Gap Magnitude
          </span>
          <span className="font-heading text-2xl font-bold text-amber-900">
            -{gap} pts
          </span>
          <span className="text-[11px] text-amber-700 block mt-0.5">
            Current {currentLevel}% vs Target {targetLevel}%
          </span>
        </div>
      </div>

      {/* Progress Overlay */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#626763]">
            Category: <strong className="text-[#171918]">{category}</strong>
          </span>
          <span className="font-semibold text-[#1F6B4F]">
            {currentLevel >= targetLevel ? 'Target Achieved' : `${gap} points to target (${targetLevel}%)`}
          </span>
        </div>
        <ProgressBar value={currentLevel} variant="warning" size="md" />
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-xs text-[#626763] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#1F6B4F]" />
          Focused practice on {skillName} unlocks downstream milestone progression.
        </span>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link to={ROUTES.ASSESSMENT} className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" className="w-full">
              Assess Skill
            </Button>
          </Link>

          {onAnalyzeGap ? (
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={onAnalyzeGap}
              className="flex-1 sm:flex-initial"
            >
              Analyze Skill Gap
            </Button>
          ) : (
            <Link to={ROUTES.SKILL_GAP} className="flex-1 sm:flex-initial">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<Compass className="w-3.5 h-3.5" />}
                className="w-full"
              >
                Skill Gap Matrix
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  )
}
