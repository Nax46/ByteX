import React from 'react'
import { StatCard } from '@/components/ui/StatCard'
import { TrendingUp, BookCheck, ClipboardCheck, FolderGit2, CheckCircle2 } from 'lucide-react'

interface ProgressDimensionsGridProps {
  careerReadiness: number
  skillsMeetingTarget: number
  totalSkillsTracked: number
  completedModules: number
  totalModules: number
  completedProjects: number
  inProgressProjects: number
  assessmentCount: number
  avgAssessmentScore: number
}

export const ProgressDimensionsGrid: React.FC<ProgressDimensionsGridProps> = ({
  careerReadiness,
  skillsMeetingTarget,
  totalSkillsTracked,
  completedModules,
  totalModules,
  completedProjects,
  inProgressProjects,
  assessmentCount,
  avgAssessmentScore,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Career Readiness"
        value={`${careerReadiness}%`}
        subtitle="Overall pathway score"
        icon={<TrendingUp className="w-4 h-4 text-[#1F6B4F]" />}
        trend={{ value: 'Target Goal: 85%+', isPositive: true }}
      />

      <StatCard
        title="Target Skills Met"
        value={`${skillsMeetingTarget} / ${totalSkillsTracked}`}
        subtitle={`${totalSkillsTracked > 0 ? Math.round((skillsMeetingTarget / totalSkillsTracked) * 100) : 0}% skills at target level`}
        icon={<CheckCircle2 className="w-4 h-4 text-[#1F6B4F]" />}
      />

      <StatCard
        title="Roadmap Progression"
        value={`${completedModules} / ${totalModules}`}
        subtitle="Milestone modules finished"
        icon={<BookCheck className="w-4 h-4 text-[#1F6B4F]" />}
      />

      <StatCard
        title="Diagnostic Tests"
        value={`${assessmentCount} Attempts`}
        subtitle={`Avg score: ${avgAssessmentScore}%`}
        icon={<ClipboardCheck className="w-4 h-4 text-[#1F6B4F]" />}
      />

      <StatCard
        title="Projects Built"
        value={`${completedProjects + inProgressProjects} Total`}
        subtitle={`${completedProjects} done, ${inProgressProjects} in progress`}
        icon={<FolderGit2 className="w-4 h-4 text-[#1F6B4F]" />}
      />
    </div>
  )
}
