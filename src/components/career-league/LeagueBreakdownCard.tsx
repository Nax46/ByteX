import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { ShieldCheck, Code, FolderGit2, FileText, ArrowRight } from 'lucide-react'

interface LeagueBreakdownCardProps {
  readinessScore: number
  evidenceCount: number
}

export const LeagueBreakdownCard: React.FC<LeagueBreakdownCardProps> = ({
  readinessScore,
  evidenceCount,
}) => {
  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]/70">
        <div>
          <h3 className="font-heading text-base font-bold text-[#171918]">
            Your Career Standing Contribution
          </h3>
          <p className="text-xs text-[#626763] mt-0.5">
            How your verified work translates into your cohort ranking
          </p>
        </div>
        <Link to={ROUTES.PROGRESS}>
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Full Progress Analysis
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#171918] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1F6B4F]" /> Verified Proofs
            </span>
            <span className="text-xs font-bold text-[#1F6B4F]">{evidenceCount} Items</span>
          </div>
          <p className="text-[11px] text-[#626763]">Proof of work from passed drills & projects</p>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#171918] flex items-center gap-1.5">
              <Code className="w-4 h-4 text-[#1F6B4F]" /> Practical Drills
            </span>
            <span className="text-xs font-bold text-[#1F6B4F]">Active</span>
          </div>
          <p className="text-[11px] text-[#626763]">Verified coding problem resolutions</p>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#171918] flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-[#1F6B4F]" /> Project Builds
            </span>
            <span className="text-xs font-bold text-[#1F6B4F]">Portfolio</span>
          </div>
          <p className="text-[11px] text-[#626763]">Production application builds submitted</p>
        </div>

        <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#171918] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#1F6B4F]" /> Diagnostic Score
            </span>
            <span className="text-xs font-bold text-[#1F6B4F]">{readinessScore}%</span>
          </div>
          <p className="text-[11px] text-[#626763]">Proctored benchmark performance score</p>
        </div>
      </div>
    </Card>
  )
}

export default LeagueBreakdownCard
