import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import { Flag, ArrowRight, Zap, Target, CheckCircle2 } from 'lucide-react'

interface CareerMissionHeaderBannerProps {
  targetRole: string
  completedMilestones: number
  totalMilestones: number
  progressPercent: number
  activeStageTitle?: string
}

export const CareerMissionHeaderBanner: React.FC<CareerMissionHeaderBannerProps> = ({
  targetRole,
  completedMilestones,
  totalMilestones,
  progressPercent,
  activeStageTitle = 'Backend Development',
}) => {
  return (
    <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D8E8DE]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          {/* Header Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
              <Flag className="w-5 h-5 fill-current" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Career Mission Path
            </span>
            <Badge variant="forest" size="sm">
              Active Track
            </Badge>
          </div>

          {/* Goal Title & Subtitle */}
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
              Mission Objective: <span className="text-[#1F6B4F]">{targetRole}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#626763] mt-1.5 leading-relaxed max-w-2xl">
              Your step-by-step master mission converting long-term target role competency criteria into clear stages, verified evidence, and daily high-impact actions.
            </p>
          </div>

          {/* Progress Bar & Stats */}
          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap justify-between items-center text-xs">
              <span className="font-bold text-[#171918] flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#1F6B4F]" />
                Current Mission Progress: <strong className="text-[#1F6B4F]">{progressPercent}%</strong>
              </span>
              <span className="text-[#626763] font-medium">
                {completedMilestones} of {totalMilestones} Stages Completed
              </span>
            </div>
            <ProgressBar value={progressPercent} variant="forest" size="md" />
            <div className="flex items-center justify-between text-[11px] text-[#626763]">
              <span>Current Stage: <strong className="text-[#171918]">{activeStageTitle}</strong></span>
              <span className="flex items-center gap-1 text-[#1F6B4F]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Industry Verified Benchmarks
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button Block */}
        <div className="shrink-0 flex flex-col gap-3 min-w-[220px]">
          <Link to={ROUTES.TODAY} className="w-full">
            <Button variant="primary" size="lg" className="w-full shadow-md" leftIcon={<Zap className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Today's Career Action
            </Button>
          </Link>
          <Link to={ROUTES.CAREERS} className="w-full">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Change Target Career Goal
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default CareerMissionHeaderBanner
