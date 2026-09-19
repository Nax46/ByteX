import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Target, ShieldCheck, Zap, Sparkles, CheckCircle2 } from 'lucide-react'
import { StudentOpportunityContext } from '@/api/endpoints/opportunities.api'

interface OpportunityHeaderBannerProps {
  context: StudentOpportunityContext | null
}

export const OpportunityHeaderBanner: React.FC<OpportunityHeaderBannerProps> = ({ context }) => {
  const targetCareer = context?.targetCareer || 'Full Stack Developer'
  const readinessScore = context?.readinessScore || 68
  const topBottleneck = context?.topBottleneck || 'Node.js & REST APIs'
  const verifiedCount = context?.verifiedSkillsCount || 6

  return (
    <Card className="p-5 bg-gradient-to-r from-[#1F6B4F]/10 via-[#D8E8DE]/30 to-[#F8F7F3] border-[#E5E5DF]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and Career Context */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="forest" size="sm">
              Career-Aware Discovery
            </Badge>
            <div className="flex items-center gap-1 text-xs text-[#1F6B4F] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Platform Intelligence</span>
            </div>
          </div>
          <h2 className="font-heading text-lg sm:text-xl font-bold text-[#171918]">
            Opportunities Matched to Your SkillPath
          </h2>
          <p className="text-xs sm:text-sm text-[#626763]">
            Discover internships, jobs, freelance gigs, and hackathons aligned with your verified capability.
          </p>
        </div>

        {/* Live Context Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs shrink-0">
          {/* Target Role */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5DF] text-[#171918] shadow-2xs font-medium">
            <Target className="w-3.5 h-3.5 text-[#1F6B4F]" />
            <span className="text-[#626763]">Target Role:</span>
            <span className="font-semibold text-[#1F6B4F]">{targetCareer}</span>
          </div>

          {/* Readiness Score */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5DF] text-[#171918] shadow-2xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1F6B4F]" />
            <span className="text-[#626763]">Readiness:</span>
            <span className="font-semibold text-[#1F6B4F]">{readinessScore}%</span>
          </div>

          {/* Verified Skills */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5DF] text-[#171918] shadow-2xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[#626763]">Verified Skills:</span>
            <span className="font-semibold text-emerald-800">{verifiedCount} Mastered</span>
          </div>

          {/* Top Bottleneck */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5DF] text-[#171918] shadow-2xs font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[#626763]">Top Gap:</span>
            <span className="font-semibold text-amber-700">{topBottleneck}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
