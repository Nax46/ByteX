import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LeagueSummary } from '@/types/league.types'
import { Trophy, ShieldCheck, Target, TrendingUp, Sparkles } from 'lucide-react'

interface LeagueOverviewHeaderProps {
  summary: LeagueSummary
}

export const LeagueOverviewHeader: React.FC<LeagueOverviewHeaderProps> = ({
  summary,
}) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'DIAMOND':
        return 'bg-cyan-50 text-cyan-800 border-cyan-300 font-bold'
      case 'GOLD':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
      case 'SILVER':
        return 'bg-slate-50 text-slate-700 border-slate-300 font-bold'
      default:
        return 'bg-orange-50 text-orange-800 border-orange-300 font-bold'
    }
  }

  return (
    <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D8E8DE]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          {/* Tag Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
              <Trophy className="w-5 h-5 fill-current" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Career Growth League
            </span>
            <Badge variant="forest" size="sm" className="gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {summary.seasonName}
            </Badge>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getTierColor(summary.tier)}`}>
              {summary.tier} Division
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
              {summary.targetCareer} Cohort Standings
            </h1>
            <p className="text-xs sm:text-sm text-[#626763] mt-1.5 leading-relaxed max-w-2xl">
              Career League benchmarks your practical skills, completed coding drills, production builds, and readiness progress alongside peers pursuing the same career goal.
            </p>
          </div>

          {/* Quick Context Line */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#626763]">
            <span className="flex items-center gap-1.5 font-medium text-[#1F6B4F]">
              <Target className="w-4 h-4" />
              Target Role: <strong>{summary.targetCareer}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#171918] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#1F6B4F]" />
              {summary.userVerifiedEvidenceCount} Verified Evidence Proofs
            </span>
          </div>
        </div>

        {/* Right Metric Pillar Array */}
        <div className="shrink-0 grid grid-cols-2 gap-3 min-w-[240px]">
          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              Cohort Rank
            </span>
            <span className="text-3xl font-bold text-[#1F6B4F] font-heading block mt-0.5">
              #{summary.currentRank}
            </span>
            <span className="text-[10px] text-[#626763] block">
              out of {summary.totalMembers} peers
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              Readiness Percentile
            </span>
            <span className="text-3xl font-bold text-[#171918] font-heading block mt-0.5">
              Top {summary.percentile}%
            </span>
            <span className="text-[10px] text-[#1F6B4F] font-semibold block flex items-center justify-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {summary.userReadinessScore}% Score
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default LeagueOverviewHeader
