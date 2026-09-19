import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Swords, ShieldCheck, Clock, Target, Sparkles } from 'lucide-react'

interface BattleOverviewHeaderProps {
  totalAvailable: number
  totalCompleted: number
  totalWins: number
  targetRole: string
  topSkillGap?: string
}

export const BattleOverviewHeader: React.FC<BattleOverviewHeaderProps> = ({
  totalAvailable,
  totalCompleted,
  totalWins,
  targetRole,
  topSkillGap = 'Node.js',
}) => {
  return (
    <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D8E8DE]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          {/* Tag Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
              <Swords className="w-5 h-5 fill-current" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Practical Skill Battle Engine
            </span>
            <Badge variant="forest" size="sm" className="gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Evidence Creation
            </Badge>
          </div>

          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
              Skill Battles & Timed Drills
            </h1>
            <p className="text-xs sm:text-sm text-[#626763] mt-1.5 leading-relaxed max-w-2xl">
              Demonstrate actual problem-solving ability in timed technical drills matched against benchmark requirements for <strong className="text-[#171918]">{targetRole}</strong>. Completed battles generate verified evidence proofs.
            </p>
          </div>

          {/* Context Line */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#626763]">
            <span className="flex items-center gap-1.5 font-semibold text-[#1F6B4F]">
              <Target className="w-4 h-4" />
              Focus Bottleneck: {topSkillGap}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#171918] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#1F6B4F]" />
              Automated Verification & Evidence Log
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="shrink-0 grid grid-cols-3 gap-3 min-w-[260px]">
          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              Available
            </span>
            <span className="text-2xl font-bold text-[#171918] font-heading block mt-0.5">
              {totalAvailable}
            </span>
            <span className="text-[10px] text-[#1F6B4F] font-semibold block flex items-center justify-center gap-0.5">
              <Clock className="w-3 h-3" /> Timed
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-2xl font-bold text-[#1F6B4F] font-heading block mt-0.5">
              {totalCompleted}
            </span>
            <span className="text-[10px] text-[#1F6B4F] font-semibold block">
              ✓ Verified
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              Victories
            </span>
            <span className="text-2xl font-bold text-amber-700 font-heading block mt-0.5">
              {totalWins}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold block">
              ★ Passed
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default BattleOverviewHeader
