import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Dumbbell, Sparkles, Compass, Target, ArrowRight } from 'lucide-react'

interface ChallengeHeaderBannerProps {
  careerGoal: string
  totalChallengesCount: number
  completedCount: number
  activeGapsCount: number
}

export const ChallengeHeaderBanner: React.FC<ChallengeHeaderBannerProps> = ({
  careerGoal,
  totalChallengesCount,
  completedCount,
  activeGapsCount,
}) => {
  return (
    <Card className="p-6 sm:p-8 bg-gradient-to-r from-[#16523C] via-[#1F6B4F] to-[#2D8A66] text-white border-0 shadow-md relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-[#D8E8DE]/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="forest" size="sm" className="bg-[#D8E8DE] text-[#1F6B4F] font-bold">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Practical Capability Engine
            </Badge>
            <span className="text-xs text-white/80 font-medium flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Timed Scenario Drills
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Demonstrated Skill Validation
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Practical Drills for <span className="text-[#D8E8DE] underline decoration-white/30 underline-offset-4">{careerGoal}</span>
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
            Move from claiming skills to proving ability. Complete timed micro-drills and scenario challenges targeted at your active skill gaps.
          </p>

          <div className="pt-1 flex items-center gap-4 text-xs text-white/80 flex-wrap">
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{completedCount}</strong> Drills Completed
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{activeGapsCount}</strong> Active Skill Gaps
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{totalChallengesCount}</strong> Verified Micro-Drills
            </span>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
          <Link to={ROUTES.SKILL_GAP} className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-semibold"
              leftIcon={<Target className="w-3.5 h-3.5" />}
            >
              View Skill Gaps
            </Button>
          </Link>

          <Link to={ROUTES.ROADMAP} className="w-full">
            <Button
              variant="primary"
              size="sm"
              className="w-full bg-[#D8E8DE] text-[#1F6B4F] hover:bg-white text-xs font-bold shadow-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Roadmap
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
