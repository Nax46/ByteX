import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Squad } from '@/types/squad.types'
import { ROUTES } from '@/constants/routes'
import { Users, FolderGit2, ShieldCheck, ArrowRight, Zap, Target } from 'lucide-react'

interface SquadOverviewHeaderProps {
  activeSquad: Squad | null
}

export const SquadOverviewHeader: React.FC<SquadOverviewHeaderProps> = ({
  activeSquad,
}) => {
  if (!activeSquad) {
    return (
      <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
                <Users className="w-5 h-5 fill-current" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
                Career Collaboration Squads
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
              Build Together with Engineering Squads
            </h1>
            <p className="text-xs sm:text-sm text-[#626763] leading-relaxed max-w-2xl">
              Join a role-specific study & build squad targeting your chosen career track. Collaborate on real production applications while logging verified team evidence for your portfolio.
            </p>
          </div>

          <div className="shrink-0">
            <Link to={ROUTES.PROJECTS}>
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Recommended Projects
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D8E8DE]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 flex-1">
          {/* Header Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
              <Users className="w-5 h-5 fill-current" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Active Career Squad
            </span>
            <Badge variant="forest" size="sm">
              {activeSquad.userRoleLabel || activeSquad.userRole || 'Member'}
            </Badge>
          </div>

          {/* Squad Title & Project */}
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
              {activeSquad.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#626763] mt-1.5 leading-relaxed max-w-2xl">
              Target Project: <strong className="text-[#171918]">{activeSquad.projectName}</strong> • Stage: <span className="text-[#1F6B4F] font-semibold">{activeSquad.currentMissionStage}</span>
            </p>
          </div>

          {/* Progress Bar & Role Info */}
          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-2 max-w-2xl">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#171918] flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-[#1F6B4F]" />
                Squad MVP Progress: <strong className="text-[#1F6B4F]">{activeSquad.progressPercent}%</strong>
              </span>
              <span className="text-[#626763] font-medium">
                {activeSquad.members.length} Active Teammates
              </span>
            </div>
            <ProgressBar value={activeSquad.progressPercent} variant="forest" size="md" />
            <div className="flex items-center justify-between text-[11px] text-[#626763]">
              <span>Your Role: <strong className="text-[#171918]">{activeSquad.userRoleLabel}</strong></span>
              <span className="flex items-center gap-1 text-[#1F6B4F] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Evidence Connected
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="shrink-0 flex flex-col gap-3 min-w-[220px]">
          <Link to={ROUTES.TODAY} className="w-full">
            <Button variant="primary" size="lg" className="w-full shadow-md" leftIcon={<Zap className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Execute Today's Action
            </Button>
          </Link>
          <Link to={ROUTES.PROJECTS} className="w-full">
            <Button variant="outline" size="sm" className="w-full text-xs" leftIcon={<Target className="w-3.5 h-3.5" />}>
              Open Project Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default SquadOverviewHeader
