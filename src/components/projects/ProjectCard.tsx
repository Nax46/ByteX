import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RecommendedProject } from '@/types/project.types'
import { Clock, FolderGit2, ArrowRight, CheckCircle2, Play } from 'lucide-react'

interface ProjectCardProps {
  project: RecommendedProject
  onUpdateStatus: (projectId: string, nextStatus: RecommendedProject['status']) => void
  staggerClass?: string
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onUpdateStatus,
  staggerClass = '',
}) => {
  const isStarted = project.status === 'IN_PROGRESS'
  const isSubmitted = project.status === 'SUBMITTED'

  return (
    <Card
      hoverEffect
      className={`p-5 sm:p-6 bg-white border-[#E5E5DF] flex flex-col justify-between space-y-4 hover-lift animate-slideUp ${staggerClass} group`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center shrink-0">
              <FolderGit2 className="w-4 h-4" />
            </div>

            <Badge
              variant={project.difficulty === 'ADVANCED' ? 'warning' : 'forest'}
              size="sm"
            >
              {project.difficulty}
            </Badge>

            {isStarted && <Badge variant="warning" size="sm">In Progress</Badge>}
            {isSubmitted && <Badge variant="forest" size="sm">Submitted</Badge>}
          </div>

          <span className="text-xs text-[#626763] font-medium flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
            ~{project.estimatedHours} Hours
          </span>
        </div>

        <h3 className="font-heading text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors duration-200">
          {project.title}
        </h3>

        <p className="text-xs text-[#626763] leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Technologies List */}
        <div className="space-y-1 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E948F]">
            Technologies
          </span>
          <div className="flex flex-wrap gap-1">
            {project.technologies?.map((tech, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#F8F7F3] text-[#171918] border border-[#E5E5DF] font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Skills Reinforced */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E948F]">
            Reinforces Skills
          </span>
          <div className="flex flex-wrap gap-1">
            {project.skillsReinforced?.map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#E5F3EB] text-[#1F6B4F] font-semibold border border-[#1F6B4F]/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between gap-2 text-xs">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateStatus(project.id, isStarted ? 'SUBMITTED' : 'IN_PROGRESS')}
          className="text-xs font-semibold"
        >
          {isSubmitted ? 'Completed' : isStarted ? 'Mark Done' : 'Start Project'}
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onUpdateStatus(project.id, isStarted ? 'SUBMITTED' : 'IN_PROGRESS')}
          className="text-xs font-bold"
          rightIcon={isSubmitted ? <CheckCircle2 className="w-3.5 h-3.5" /> : isStarted ? <ArrowRight className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        >
          {isSubmitted ? 'View Details' : isStarted ? 'Resume Project' : 'Build Now'}
        </Button>
      </div>
    </Card>
  )
}
