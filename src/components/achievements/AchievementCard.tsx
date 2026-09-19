import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Achievement } from '@/types/achievement.types'
import { ROUTES } from '@/constants/routes'
import {
  Award,
  CheckCircle2,
  Lock,
  Clock,
  Code,
  FolderGit2,
  FileText,
  Map,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface AchievementCardProps {
  achievement: Achievement
  onSelect: (achievement: Achievement) => void
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onSelect,
}) => {
  const isUnlocked = achievement.status === 'UNLOCKED'
  const isInProgress = achievement.status === 'IN_PROGRESS'

  const progressPercent = achievement.progressCurrent && achievement.progressTarget
    ? Math.min(100, Math.round((achievement.progressCurrent / achievement.progressTarget) * 100))
    : 0

  const getCategoryIcon = () => {
    switch (achievement.category) {
      case 'CHALLENGE':
        return <Code className="w-5 h-5" />
      case 'PROJECT':
        return <FolderGit2 className="w-5 h-5" />
      case 'ASSESSMENT':
        return <FileText className="w-5 h-5" />
      case 'ROADMAP':
        return <Map className="w-5 h-5" />
      default:
        return <Award className="w-5 h-5" />
    }
  }

  const getTargetRoute = () => {
    if (achievement.sourceUrl) return achievement.sourceUrl
    switch (achievement.category) {
      case 'CHALLENGE':
        return ROUTES.CHALLENGES
      case 'PROJECT':
        return ROUTES.PROJECTS
      case 'ASSESSMENT':
        return ROUTES.ASSESSMENT_RESULTS
      case 'ROADMAP':
        return ROUTES.ROADMAP
      default:
        return ROUTES.SKILL_EVIDENCE
    }
  }

  return (
    <Card
      glass="interactive"
      className={`p-5 border-white/80 animate-slideUp flex flex-col justify-between transition-all group ${
        isUnlocked
          ? 'bg-[#D8E8DE]/30 border-[#C2D8C9] hover:border-[#1F6B4F]'
          : isInProgress
          ? 'bg-[#F8F7F3] border-[#1F6B4F]/40 ring-1 ring-[#1F6B4F]/20'
          : 'bg-white border-[#E5E5DF] opacity-80'
      }`}
    >
      <div className="space-y-3">
        {/* Header Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`p-2 rounded-xl transition-all ${
                isUnlocked
                  ? 'bg-[#1F6B4F] text-white shadow-xs'
                  : isInProgress
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-[#E5E5DF] text-[#626763]'
              }`}
            >
              {isUnlocked ? <CheckCircle2 className="w-5 h-5" /> : getCategoryIcon()}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
              {achievement.category}
            </span>
          </div>

          <Badge
            variant={isUnlocked ? 'forest' : isInProgress ? 'warning' : 'outline'}
            size="sm"
          >
            {isUnlocked ? '✓ Unlocked' : isInProgress ? '● In Progress' : '○ Locked'}
          </Badge>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-heading text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
            {achievement.title}
          </h3>
          <p className="text-xs text-[#626763] mt-1 leading-relaxed line-clamp-2">
            {achievement.description}
          </p>
        </div>

        {/* Requirement Box */}
        <div className="p-3 rounded-lg bg-white/80 border border-[#E5E5DF] text-xs space-y-1">
          <span className="text-[11px] font-bold text-[#1F6B4F] uppercase tracking-wider block">
            Unlock Condition
          </span>
          <p className="text-[#171918] leading-normal">{achievement.requirement}</p>
        </div>

        {/* Progress Bar for In-Progress Achievements */}
        {isInProgress && achievement.progressTarget && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#626763]">Progress:</span>
              <span className="font-bold text-[#1F6B4F]">
                {achievement.progressCurrent} / {achievement.progressTarget} ({progressPercent}%)
              </span>
            </div>
            <ProgressBar value={progressPercent} variant="warning" size="sm" />
          </div>
        )}

        {/* Unlocked Date Bar */}
        {isUnlocked && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#1F6B4F] font-semibold pt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Unlocked: {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : 'Verified'}</span>
          </div>
        )}
      </div>

      {/* Footer Action Bar */}
      <div className="pt-4 mt-4 border-t border-[#E5E5DF]/70 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(achievement)}
          className="text-xs flex-1"
        >
          View Evidence Details
        </Button>
        <Link to={getTargetRoute()}>
          <Button variant="primary" size="sm" className="px-2.5">
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}

export default AchievementCard
