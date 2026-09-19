import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { BadgeCheck, Sparkles, Compass, ArrowRight, ShieldCheck } from 'lucide-react'

interface EvidenceHeaderBannerProps {
  careerGoal: string
  totalItems: number
  verifiedCount: number
  assessmentCount: number
  challengeCount: number
  projectCount: number
}

export const EvidenceHeaderBanner: React.FC<EvidenceHeaderBannerProps> = ({
  careerGoal,
  totalItems,
  verifiedCount,
  assessmentCount,
  challengeCount,
  projectCount,
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
              Verified Capability Proof
            </Badge>
            <span className="text-xs text-white/80 font-medium flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Audit-Ready Career Evidence
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Demonstrated Skill Portfolio
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Skill Evidence for <span className="text-[#D8E8DE] underline decoration-white/30 underline-offset-4">{careerGoal}</span>
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
            Record of actual capability demonstrated through proctored diagnostic assessments, practical challenges, and completed portfolio projects.
          </p>

          <div className="pt-1 flex items-center gap-4 text-xs text-white/80 flex-wrap">
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{verifiedCount} / {totalItems}</strong> System Verified
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{assessmentCount}</strong> Assessments
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{challengeCount}</strong> Drills
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{projectCount}</strong> Projects
            </span>
          </div>
        </div>

        {/* Action Button Links */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
          <Link to={ROUTES.CAREER_PASSPORT} className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-semibold"
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
            >
              Career Passport
            </Button>
          </Link>

          <Link to={ROUTES.PROGRESS} className="w-full">
            <Button
              variant="primary"
              size="sm"
              className="w-full bg-[#D8E8DE] text-[#1F6B4F] hover:bg-white text-xs font-bold shadow-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Learning Progress
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
