import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Achievement } from '@/types/achievement.types'
import { ROUTES } from '@/constants/routes'
import { ShieldCheck, CheckCircle2, X, Award, ExternalLink, Target } from 'lucide-react'

interface AchievementDetailModalProps {
  achievement: Achievement | null
  onClose: () => void
}

export const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievement,
  onClose,
}) => {
  if (!achievement) return null

  const isUnlocked = achievement.status === 'UNLOCKED'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <Card className="w-full max-w-lg p-6 bg-white border-[#E5E5DF] space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isUnlocked ? 'bg-[#D8E8DE] text-[#1F6B4F]' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isUnlocked ? <CheckCircle2 className="w-6 h-6" /> : <Award className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={isUnlocked ? 'forest' : 'warning'} size="sm">
                {isUnlocked ? '✓ Unlocked Milestone' : '● In Progress'}
              </Badge>
              <span className="text-xs font-bold text-[#626763] uppercase tracking-wider">
                {achievement.category}
              </span>
            </div>
            <h3 className="font-heading text-xl font-bold text-[#171918] mt-0.5">
              {achievement.title}
            </h3>
          </div>
        </div>

        {/* Description & Unlock Criteria */}
        <div className="space-y-3 text-xs sm:text-sm">
          <p className="text-[#626763] leading-relaxed">{achievement.description}</p>

          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Verified Unlock Criteria
            </span>
            <p className="text-[#171918] leading-relaxed">{achievement.requirement}</p>
          </div>

          {achievement.skillName && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E5DF] bg-white text-xs">
              <span className="text-[#626763]">Associated Competency:</span>
              <span className="font-bold text-[#1F6B4F] bg-[#D8E8DE]/80 px-2.5 py-0.5 rounded-full border border-[#C2D8C9]">
                {achievement.skillName}
              </span>
            </div>
          )}

          {isUnlocked && achievement.unlockedAt && (
            <div className="flex items-center gap-2 text-xs text-[#1F6B4F] font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Unlocked & Verified on {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#E5E5DF] flex flex-wrap items-center justify-between gap-3">
          <Link to={ROUTES.SKILL_EVIDENCE} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Skill Evidence Log
            </Button>
          </Link>
          <Link to={getTargetRoute()} className="flex-1">
            <Button variant="primary" size="sm" className="w-full" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open Activity Source
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default AchievementDetailModal
