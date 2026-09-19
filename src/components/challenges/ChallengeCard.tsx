import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PracticalChallenge } from '@/types/challenge.types'
import { Clock, Play, CheckCircle2, Dumbbell } from 'lucide-react'

interface ChallengeCardProps {
  challenge: PracticalChallenge
  onAttempt: (challenge: PracticalChallenge) => void
  staggerClass?: string
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onAttempt,
  staggerClass = '',
}) => {
  const isCompleted = challenge.status === 'COMPLETED'

  return (
    <Card
      hoverEffect
      className={`p-5 sm:p-6 bg-white border-[#E5E5DF] flex flex-col justify-between space-y-4 hover-lift animate-slideUp ${staggerClass} group`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="forest" size="sm" className="font-semibold">
              {challenge.skillTag}
            </Badge>

            <Badge
              variant={challenge.difficulty === 'ADVANCED' ? 'warning' : 'forest'}
              size="sm"
            >
              {challenge.difficulty}
            </Badge>

            {isCompleted && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D8E8DE] text-[#1F6B4F]">
                ✓ Completed
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#626763] font-medium">
            <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
            <span>~{challenge.estimatedMinutes} Mins</span>
          </div>
        </div>

        <h3 className="font-heading text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors duration-200">
          {challenge.title}
        </h3>

        <p className="text-xs text-[#626763] leading-relaxed line-clamp-2">
          {challenge.description}
        </p>

        <div className="pt-1 flex items-center justify-between text-[11px] text-[#8E948F]">
          <span className="font-semibold uppercase tracking-wider text-[#626763]">
            Type: {challenge.category}
          </span>
          <span>{challenge.requirements?.length || 0} Task Checks</span>
        </div>
      </div>

      <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between text-xs gap-2">
        <span className="text-[#626763] flex items-center gap-1">
          <Dumbbell className="w-3.5 h-3.5 text-[#1F6B4F]" />
          Micro-Drill
        </span>

        <Button
          variant={isCompleted ? 'outline' : 'primary'}
          size="sm"
          onClick={() => onAttempt(challenge)}
          className="text-xs font-bold"
          rightIcon={isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        >
          {isCompleted ? 'Re-attempt Drill' : 'Start Drill'}
        </Button>
      </div>
    </Card>
  )
}
