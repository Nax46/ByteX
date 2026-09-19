import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkillBattle } from '@/types/battle.types'
import { Clock, CheckCircle2, Code, FolderGit2, FileText, ArrowRight, User } from 'lucide-react'

interface BattleCardProps {
  battle: SkillBattle
  onStart: (battle: SkillBattle) => void
  onViewResult: (battle: SkillBattle) => void
}

export const BattleCard: React.FC<BattleCardProps> = ({
  battle,
  onStart,
  onViewResult,
}) => {
  const isCompleted = battle.status === 'COMPLETED' || battle.status === 'SUBMITTED'

  const getCategoryIcon = () => {
    switch (battle.category) {
      case 'API':
      case 'BACKEND':
        return <Code className="w-4 h-4 text-[#1F6B4F]" />
      case 'FRONTEND':
        return <FolderGit2 className="w-4 h-4 text-[#1F6B4F]" />
      default:
        return <FileText className="w-4 h-4 text-[#1F6B4F]" />
    }
  }

  const getDifficultyBadge = () => {
    switch (battle.difficulty) {
      case 'ADVANCED':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">Advanced</span>
      case 'INTERMEDIATE':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Intermediate</span>
      default:
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">Beginner</span>
    }
  }

  return (
    <Card
      glass="interactive"
      className={`p-5 border-white/80 animate-slideUp flex flex-col justify-between transition-all group ${
        isCompleted ? 'bg-[#D8E8DE]/30 border-[#C2D8C9]' : 'bg-white border-[#E5E5DF]'
      }`}
    >
      <div className="space-y-3">
        {/* Category & Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
              {getCategoryIcon()}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              {battle.category}
            </span>
            {getDifficultyBadge()}
          </div>

          <Badge variant={isCompleted ? 'forest' : 'outline'} size="sm">
            {isCompleted ? '✓ Completed' : '● Available'}
          </Badge>
        </div>

        {/* Battle Title & Description */}
        <div>
          <h3 className="font-heading text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
            {battle.title}
          </h3>
          <p className="text-xs text-[#626763] mt-1 leading-relaxed line-clamp-2">
            {battle.description}
          </p>
        </div>

        {/* Requirements Summary */}
        {battle.requirements && battle.requirements.length > 0 && (
          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] text-xs space-y-1">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              Core Objective
            </span>
            <p className="text-[#171918] leading-normal line-clamp-2">
              {battle.requirements[0]}
            </p>
          </div>
        )}

        {/* Metadata Line */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#626763] pt-1 border-t border-[#E5E5DF]/60">
          <span className="flex items-center gap-1 font-medium text-[#171918]">
            <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
            Time Limit: <strong>{battle.timeLimitMinutes} mins</strong>
          </span>
          <span className="flex items-center gap-1 text-[#626763]">
            <User className="w-3.5 h-3.5 text-[#1F6B4F]" />
            Match: {battle.opponentName}
          </span>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-4 mt-4 border-t border-[#E5E5DF]/70">
        {isCompleted ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#1F6B4F]" />}
            onClick={() => onViewResult(battle)}
          >
            Review Battle Result ({battle.score}%)
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="w-full text-xs shadow-xs"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => onStart(battle)}
          >
            Enter Battle Workspace
          </Button>
        )}
      </div>
    </Card>
  )
}

export default BattleCard
