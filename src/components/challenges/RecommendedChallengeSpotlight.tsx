import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PracticalChallenge } from '@/types/challenge.types'
import { SkillGap } from '@/types/skill.types'
import { Dumbbell, Clock, Zap, Award, Play } from 'lucide-react'

interface RecommendedChallengeSpotlightProps {
  challenge: PracticalChallenge
  prioritySkill: SkillGap | null
  onAttempt: (challenge: PracticalChallenge) => void
}

export const RecommendedChallengeSpotlight: React.FC<RecommendedChallengeSpotlightProps> = ({
  challenge,
  prioritySkill,
  onAttempt,
}) => {
  const gapMagnitude = prioritySkill ? Math.max(0, prioritySkill.targetLevel - prioritySkill.currentLevel) : 0

  return (
    <Card className="p-6 sm:p-7 border-[#1F6B4F]/40 bg-gradient-to-r from-white via-[#F4F9F6] to-white shadow-md relative overflow-hidden space-y-4 group">
      {/* Top Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1F6B4F] via-[#2D8A66] to-[#D8E8DE]" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="forest" size="sm" className="bg-[#1F6B4F] text-white font-bold">
            <Zap className="w-3.5 h-3.5 inline mr-1" />
            PRIORITY SKILL DRILL
          </Badge>

          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E5F3EB] text-[#1F6B4F] border border-[#1F6B4F]/20">
            {challenge.skillTag}
          </span>

          <Badge
            variant={challenge.difficulty === 'ADVANCED' ? 'warning' : 'forest'}
            size="sm"
          >
            {challenge.difficulty}
          </Badge>

          <span className="text-xs text-[#8E948F] font-semibold uppercase tracking-wider">
            {challenge.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#626763] font-semibold bg-white px-3 py-1 rounded-lg border border-[#E5E5DF]">
          <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
          <span>~{challenge.estimatedMinutes} Mins</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-heading text-xl font-extrabold text-[#171918] group-hover:text-[#1F6B4F] transition-colors duration-200">
          {challenge.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
          {challenge.description}
        </p>
      </div>

      {/* Relevance & Problem Callout */}
      <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
        <div className="md:col-span-4 space-y-1 border-b md:border-b-0 md:border-r border-[#E5E5DF] pb-2 md:pb-0 md:pr-3">
          <div className="flex items-center gap-1.5 text-[#1F6B4F] font-bold">
            <Award className="w-4 h-4" />
            <span>Addresses: {challenge.skillTag} Gap</span>
          </div>
          <p className="text-[11px] text-[#626763]">
            {prioritySkill
              ? `Closing this -${gapMagnitude} pt gap will advance your career readiness.`
              : `Proves your practical execution capability in ${challenge.skillTag}.`}
          </p>
        </div>

        <div className="md:col-span-8 space-y-1">
          <span className="font-bold text-[#171918] block">Task Requirements:</span>
          <ul className="list-disc list-inside text-[11px] text-[#626763] space-y-0.5">
            {challenge.requirements?.slice(0, 2).map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between gap-3 text-xs">
        <span className="text-[#626763] flex items-center gap-1.5">
          <Dumbbell className="w-3.5 h-3.5 text-[#1F6B4F]" />
          Instant evaluation & feedback report
        </span>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onAttempt(challenge)}
          className="text-xs font-bold shadow-xs px-5"
          rightIcon={<Play className="w-3.5 h-3.5" />}
        >
          Attempt Challenge
        </Button>
      </div>
    </Card>
  )
}
