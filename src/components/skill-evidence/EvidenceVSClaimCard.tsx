import React from 'react'
import { Card } from '@/components/ui/Card'
import { BadgeCheck, ShieldCheck, CheckCircle2 } from 'lucide-react'

export const EvidenceVSClaimCard: React.FC = () => {
  return (
    <Card className="p-5 sm:p-6 border-[#1F6B4F]/30 bg-gradient-to-r from-[#F4F9F6] via-white to-[#F8F7F3] shadow-xs space-y-3">
      <div className="flex items-center gap-2">
        <BadgeCheck className="w-5 h-5 text-[#1F6B4F]" />
        <h3 className="font-heading text-base font-bold text-[#171918]">
          Proven Capability &gt; Unverified Claims
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
        <div className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#626763] font-bold">
            <span>Self-Reported Skill Level</span>
          </div>
          <p className="text-[#626763] leading-relaxed">
            What you say you know based on course titles or self-assessments. Essential for initial gap tracking, but unverified by hiring managers.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#E5F3EB] border border-[#1F6B4F]/30 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#1F6B4F] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Skill Evidence</span>
          </div>
          <p className="text-[#171918] leading-relaxed">
            What you have actually demonstrated through proctored diagnostic tests, practical micro-drills, and submitted repository deliverables.
          </p>
        </div>
      </div>
    </Card>
  )
}
