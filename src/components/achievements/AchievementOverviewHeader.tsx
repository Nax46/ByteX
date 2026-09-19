import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AchievementSummary } from '@/types/achievement.types'
import { Award, Trophy, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface AchievementOverviewHeaderProps {
  summary: AchievementSummary
}

export const AchievementOverviewHeader: React.FC<AchievementOverviewHeaderProps> = ({
  summary,
}) => {
  const completionPercentage = Math.round(
    (summary.totalUnlocked / (summary.totalAchievements || 1)) * 100
  )

  return (
    <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D8E8DE]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          {/* Tag Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
              <Award className="w-5 h-5 fill-current" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Evidence-Based Achievement Engine
            </span>
            <Badge variant="forest" size="sm">
              Verified Progress
            </Badge>
          </div>

          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
              Verified Career Achievements
            </h1>
            <p className="text-xs sm:text-sm text-[#626763] mt-1.5 leading-relaxed max-w-2xl">
              Achievements represent verified proof-of-work unlocked automatically when you pass proctored assessments, submit practical project builds, complete coding drills, and advance your roadmap.
            </p>
          </div>

          {/* Progress Bar & Stat Summary */}
          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-2.5 max-w-2xl">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#171918] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#1F6B4F]" />
                Unlocked Milestones: <strong className="text-[#1F6B4F]">{summary.totalUnlocked} of {summary.totalAchievements}</strong> ({completionPercentage}%)
              </span>
              <span className="text-[#626763] font-medium">
                {summary.totalInProgress} In Progress
              </span>
            </div>
            <ProgressBar value={completionPercentage} variant="forest" size="md" />
            <div className="flex items-center justify-between text-[11px] text-[#626763]">
              <span>Status: <strong className="text-[#171918]">Evidence-Grounded</strong></span>
              <span className="flex items-center gap-1 text-[#1F6B4F] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Proof Points
              </span>
            </div>
          </div>
        </div>

        {/* Metric Box Array */}
        <div className="shrink-0 grid grid-cols-2 gap-3 min-w-[220px]">
          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              Unlocked
            </span>
            <span className="text-2xl font-bold text-[#1F6B4F] font-heading block mt-0.5">
              {summary.totalUnlocked}
            </span>
            <span className="text-[10px] text-[#1F6B4F] font-semibold block">
              ✓ Verified
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-2xl font-bold text-amber-700 font-heading block mt-0.5">
              {summary.totalInProgress}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold block">
              ● Active Drills
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default AchievementOverviewHeader
