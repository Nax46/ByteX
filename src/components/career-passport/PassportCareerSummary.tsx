import React from 'react'
import { Card } from '@/components/ui/Card'
import { ShieldCheck, FolderGit2, Code, Target, BookOpen } from 'lucide-react'

interface PassportCareerSummaryProps {
  careerReadiness: number
  verifiedEvidenceCount: number
  projectsCount: number
  challengesCount: number
  skillsCoveredCount: number
  totalRequiredSkillsCount: number
}

export const PassportCareerSummary: React.FC<PassportCareerSummaryProps> = ({
  careerReadiness,
  verifiedEvidenceCount,
  projectsCount,
  challengesCount,
  skillsCoveredCount,
  totalRequiredSkillsCount,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 animate-slideUp">
      {/* 1. Readiness */}
      <Card glass="interactive" className="p-4 border-white/80 space-y-1.5 text-center">
        <div className="w-8 h-8 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
          Career Readiness
        </span>
        <span className="text-xl font-bold text-[#1F6B4F] font-heading block">
          {careerReadiness}%
        </span>
      </Card>

      {/* 2. Skill Coverage */}
      <Card glass="interactive" className="p-4 border-white/80 space-y-1.5 text-center">
        <div className="w-8 h-8 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mx-auto">
          <Target className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
          Skill Coverage
        </span>
        <span className="text-xl font-bold text-[#171918] font-heading block">
          {skillsCoveredCount} / {totalRequiredSkillsCount}
        </span>
      </Card>

      {/* 3. Verified Evidence */}
      <Card glass="interactive" className="p-4 border-white/80 space-y-1.5 text-center">
        <div className="w-8 h-8 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mx-auto">
          <BookOpen className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
          Verified Evidence
        </span>
        <span className="text-xl font-bold text-[#1F6B4F] font-heading block">
          {verifiedEvidenceCount} Proofs
        </span>
      </Card>

      {/* 4. Projects Built */}
      <Card glass="interactive" className="p-4 border-white/80 space-y-1.5 text-center">
        <div className="w-8 h-8 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mx-auto">
          <FolderGit2 className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
          Projects Built
        </span>
        <span className="text-xl font-bold text-[#171918] font-heading block">
          {projectsCount} Projects
        </span>
      </Card>

      {/* 5. Challenges Passed */}
      <Card glass="interactive" className="p-4 border-white/80 space-y-1.5 text-center col-span-2 lg:col-span-1">
        <div className="w-8 h-8 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mx-auto">
          <Code className="w-4 h-4" />
        </div>
        <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
          Drills Completed
        </span>
        <span className="text-xl font-bold text-[#171918] font-heading block">
          {challengesCount} Drills
        </span>
      </Card>
    </div>
  )
}

export default PassportCareerSummary
