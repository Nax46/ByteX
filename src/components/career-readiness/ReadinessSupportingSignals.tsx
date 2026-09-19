import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ClipboardCheck, Map, FolderGit2, ArrowRight } from 'lucide-react'

interface ReadinessSupportingSignalsProps {
  assessmentScore: number
  assessmentTitle: string
  completedMilestones: number
  totalMilestones: number
  completedProjects: number
  inProgressProjects: number
}

export const ReadinessSupportingSignals: React.FC<ReadinessSupportingSignalsProps> = ({
  assessmentScore,
  assessmentTitle,
  completedMilestones,
  totalMilestones,
  completedProjects,
  inProgressProjects,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Assessment Signal Card */}
      <Card className="p-5 border-[#E5E5DF] bg-white space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1F6B4F] bg-[#D8E8DE] px-2 py-0.5 rounded">
              Score: {assessmentScore}%
            </span>
          </div>

          <h4 className="font-heading text-sm font-bold text-[#171918]">Diagnostic Assessment</h4>
          <p className="text-xs text-[#626763] line-clamp-2">
            {assessmentTitle || 'Proctored Technical Diagnostic'}
          </p>
        </div>

        <div className="pt-2 border-t border-[#E5E5DF]">
          <Link to={ROUTES.ASSESSMENT_RESULTS}>
            <Button variant="outline" size="sm" className="w-full text-xs font-semibold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Results
            </Button>
          </Link>
        </div>
      </Card>

      {/* 2. Roadmap Milestone Signal Card */}
      <Card className="p-5 border-[#E5E5DF] bg-white space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
              <Map className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1F6B4F] bg-[#D8E8DE] px-2 py-0.5 rounded">
              {completedMilestones} / {totalMilestones} Milestones
            </span>
          </div>

          <h4 className="font-heading text-sm font-bold text-[#171918]">Learning Roadmap</h4>
          <p className="text-xs text-[#626763] line-clamp-2">
            Sequential learning modules completed toward career target.
          </p>
        </div>

        <div className="pt-2 border-t border-[#E5E5DF]">
          <Link to={ROUTES.ROADMAP}>
            <Button variant="outline" size="sm" className="w-full text-xs font-semibold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Roadmap
            </Button>
          </Link>
        </div>
      </Card>

      {/* 3. Project Experience Signal Card */}
      <Card className="p-5 border-[#E5E5DF] bg-white space-y-3 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1F6B4F] bg-[#D8E8DE] px-2 py-0.5 rounded">
              {completedProjects} Done · {inProgressProjects} Active
            </span>
          </div>

          <h4 className="font-heading text-sm font-bold text-[#171918]">Practical Projects</h4>
          <p className="text-xs text-[#626763] line-clamp-2">
            Real-world portfolio projects reinforcing core skills.
          </p>
        </div>

        <div className="pt-2 border-t border-[#E5E5DF]">
          <Link to={ROUTES.PROJECTS}>
            <Button variant="outline" size="sm" className="w-full text-xs font-semibold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Projects
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
