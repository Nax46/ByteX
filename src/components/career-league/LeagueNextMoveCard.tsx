import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { Zap, ArrowRight, Target } from 'lucide-react'

interface LeagueNextMoveCardProps {
  targetCareer: string
  currentRank: number
}

export const LeagueNextMoveCard: React.FC<LeagueNextMoveCardProps> = ({
  targetCareer,
  currentRank,
}) => {
  return (
    <Card className="p-6 bg-white border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between gap-6 animate-slideUp">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-[#D8E8DE] text-[#1F6B4F]">
            <Zap className="w-4 h-4 fill-current" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
            Climb the Career Standings
          </span>
        </div>
        <h3 className="font-heading text-lg font-bold text-[#171918]">
          Advance your rank from #{currentRank} in {targetCareer}
        </h3>
        <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
          Executing today's high-priority career action directly closes your top skill gap and generates verified evidence to boost your standing.
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-3">
        <Link to={ROUTES.TODAY}>
          <Button variant="primary" size="md" leftIcon={<Zap className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Execute Today's Action
          </Button>
        </Link>
        <Link to={ROUTES.SKILL_GAP}>
          <Button variant="outline" size="md" leftIcon={<Target className="w-4 h-4" />}>
            Skill Gaps
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default LeagueNextMoveCard
