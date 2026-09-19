import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import { Flag, ArrowRight } from 'lucide-react'

interface CareerMissionCardProps {
  targetRole: string
  completedMilestones?: number
  totalMilestones?: number
  progressPercent?: number
}

export const CareerMissionCard: React.FC<CareerMissionCardProps> = ({
  targetRole,
  completedMilestones = 3,
  totalMilestones = 5,
  progressPercent = 60,
}) => {
  return (
    <Card glass="interactive" className="p-6 border-white/80 flex flex-col justify-between animate-slideUp">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#D8E8DE] text-[#1F6B4F]">
              <Flag className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Career Mission
            </span>
          </div>
          <Badge variant="forest" size="sm">Active Track</Badge>
        </div>

        <div>
          <h3 className="font-heading text-lg font-bold text-[#171918]">
            Target Goal: {targetRole}
          </h3>
          <p className="text-xs text-[#626763] mt-1 leading-relaxed">
            Build and verify full production-level competencies required for {targetRole} industry placement.
          </p>
        </div>

        <div className="pt-2 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#626763]">Milestones Progress:</span>
            <span className="font-bold text-[#1F6B4F]">
              {completedMilestones} / {totalMilestones} Completed ({progressPercent}%)
            </span>
          </div>
          <ProgressBar value={progressPercent} variant="forest" size="sm" />
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[#E5E5DF]/70">
        <Link to={ROUTES.CAREER_MISSION}>
          <Button variant="outline" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            View Career Mission
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default CareerMissionCard
