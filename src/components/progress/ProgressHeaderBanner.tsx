import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { TrendingUp, Sparkles, Compass, Target, ArrowRight } from 'lucide-react'

interface ProgressHeaderBannerProps {
  careerGoal: string
  overallReadiness: number
  activeGapsCount: number
  completedModulesCount: number
  totalModulesCount: number
}

export const ProgressHeaderBanner: React.FC<ProgressHeaderBannerProps> = ({
  careerGoal,
  overallReadiness,
  activeGapsCount,
  completedModulesCount,
  totalModulesCount,
}) => {
  return (
    <Card className="p-6 sm:p-8 bg-gradient-to-r from-[#1F6B4F] via-[#16523C] to-[#0F3A2B] text-white border-0 shadow-md relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-[#D8E8DE]/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="forest" size="sm" className="bg-[#D8E8DE] text-[#1F6B4F] font-bold">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Unified Progress Intelligence
            </Badge>
            <span className="text-xs text-white/80 font-medium flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Career Track Timeline
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Measurable Skill & Milestone Growth
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Progress toward <span className="text-[#D8E8DE] underline decoration-white/30 underline-offset-4">{careerGoal}</span>
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
            Track your verified skill level increases, roadmap module completions, project builds, and diagnostic assessment scores over time.
          </p>

          <div className="pt-1 flex items-center gap-4 text-xs text-white/80 flex-wrap">
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{overallReadiness}%</strong> Career Readiness
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{completedModulesCount}/{totalModulesCount}</strong> Roadmap Modules
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{activeGapsCount}</strong> Active Skill Gaps
            </span>
          </div>
        </div>

        {/* Readiness Score Donut / Stat Box & Actions */}
        <div className="flex flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center w-full md:w-48 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/70 block">
              Career Readiness Score
            </span>
            <div className="text-3xl font-extrabold text-[#D8E8DE] flex items-center justify-center gap-1">
              <TrendingUp className="w-6 h-6" />
              <span>{overallReadiness}%</span>
            </div>
            <span className="text-[10px] text-white/80 font-medium block">
              Verified by skill diagnostic
            </span>
          </div>

          <div className="flex items-center gap-2 w-full">
            <Link to={ROUTES.SKILL_GAP} className="w-1/2 md:w-auto flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-semibold"
                leftIcon={<Target className="w-3.5 h-3.5" />}
              >
                Skill Gap
              </Button>
            </Link>

            <Link to={ROUTES.ROADMAP} className="w-1/2 md:w-auto flex-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-[#D8E8DE] text-[#1F6B4F] hover:bg-white text-xs font-bold shadow-xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
