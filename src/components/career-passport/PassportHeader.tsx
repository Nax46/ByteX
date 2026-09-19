import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { UserProfile } from '@/types/user.types'
import { ShieldCheck, Share2, Printer, Award, Target, GraduationCap } from 'lucide-react'

interface PassportHeaderProps {
  profile: UserProfile | null
  targetRole: string
  careerReadiness: number
  verifiedEvidenceCount: number
  onPrint: () => void
  onShare: () => void
}

export const PassportHeader: React.FC<PassportHeaderProps> = ({
  profile,
  targetRole,
  careerReadiness,
  verifiedEvidenceCount,
  onPrint,
  onShare,
}) => {
  const displayName = profile?.name || 'Learner'
  const displayEmail = profile?.email || 'Student'
  const education = profile?.education

  return (
    <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp relative overflow-hidden print:shadow-none print:border-none">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D8E8DE]/40 rounded-full blur-3xl -z-10 pointer-events-none print:hidden" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar & Identity Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar name={displayName} size="xl" className="ring-4 ring-[#D8E8DE]" />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1 rounded-md bg-[#D8E8DE] text-[#1F6B4F]">
                <ShieldCheck className="w-4 h-4 fill-current" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
                Official Career Passport
              </span>
              <Badge variant="forest" size="sm" className="gap-1">
                <Award className="w-3.5 h-3.5" />
                Verified Credential
              </Badge>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
              {displayName}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#626763]">
              <span className="flex items-center gap-1.5 font-medium text-[#1F6B4F]">
                <Target className="w-4 h-4" />
                Target Role: <strong>{targetRole}</strong>
              </span>
              {education?.institution && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-[#626763]" />
                    {education.institution}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-[#626763] pt-0.5">
              {displayEmail} {education?.degree ? `• ${education.degree}` : ''}
            </p>
          </div>
        </div>

        {/* Right: Readiness Badge & Action Buttons */}
        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto">
          {/* Readiness Pillar */}
          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center w-full sm:w-auto min-w-[160px]">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              Career Readiness
            </span>
            <span className="text-2xl font-bold text-[#1F6B4F] font-heading">
              {careerReadiness}%
            </span>
            <span className="text-[11px] text-[#1F6B4F] font-semibold block mt-0.5">
              ✓ {verifiedEvidenceCount} Verified Evidence Points
            </span>
          </div>

          {/* Action Buttons (Hidden when printing) */}
          <div className="flex items-center gap-2 print:hidden w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={onPrint}
              className="flex-1 sm:flex-none"
            >
              Print / PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={onShare}
              className="flex-1 sm:flex-none shadow-xs"
            >
              Share Credential
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default PassportHeader
