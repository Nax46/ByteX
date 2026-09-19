import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, Clock, BookOpen, Code, ArrowRight, Lock, PlayCircle, Sparkles } from 'lucide-react'
import { RoadmapMilestone } from '@/types/roadmap.types'

interface MissionStageTimelineProps {
  milestones: RoadmapMilestone[]
  targetRole: string
  topBottleneckSkill?: string
}

export const MissionStageTimeline: React.FC<MissionStageTimelineProps> = ({
  milestones,
  targetRole,
  topBottleneckSkill,
}) => {
  return (
    <Card glass="interactive" className="p-6 sm:p-8 border-white/80 animate-slideUp space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]/70">
        <div>
          <h2 className="font-heading text-xl font-bold text-[#171918] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1F6B4F]" />
            Career Mission Path & Stages
          </h2>
          <p className="text-xs sm:text-sm text-[#626763] mt-0.5">
            Sequential competency milestones mapped specifically to achieve {targetRole} industry placement.
          </p>
        </div>
        <Link to={ROUTES.ROADMAP}>
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Full Interactive Roadmap
          </Button>
        </Link>
      </div>

      {/* Vertical Timeline Path */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5E5DF]">
        {milestones.map((milestone, idx) => {
          const isCompleted = milestone.status === 'COMPLETED'
          const isInProgress = milestone.status === 'IN_PROGRESS'
          const isUpcoming = milestone.status === 'NOT_STARTED'

          return (
            <div key={milestone.id || idx} className="relative group">
              {/* Timeline Marker Icon */}
              <div
                className={`absolute -left-[27px] sm:-left-[31px] top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-[#1F6B4F] border-[#1F6B4F] text-white shadow-xs'
                    : isInProgress
                    ? 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100 shadow-sm animate-pulse'
                    : 'bg-white border-[#C2D8C9] text-[#626763]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isInProgress ? (
                  <PlayCircle className="w-4 h-4" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Stage Card Content */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isInProgress
                    ? 'bg-[#F8F7F3] border-[#1F6B4F]/40 shadow-sm ring-1 ring-[#1F6B4F]/20'
                    : isCompleted
                    ? 'bg-[#D8E8DE]/20 border-[#C2D8C9]'
                    : 'bg-white border-[#E5E5DF]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#626763]">
                      Stage {milestone.order || idx + 1}
                    </span>
                    <Badge
                      variant={isCompleted ? 'forest' : isInProgress ? 'warning' : 'outline'}
                      size="sm"
                    >
                      {isCompleted ? '✓ Completed' : isInProgress ? '● Current Stage' : '○ Upcoming'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#626763]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                      {milestone.estimatedHours} hrs
                    </span>
                    {milestone.resourcesCount > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" />
                        {milestone.resourcesCount} Resources
                      </span>
                    )}
                    {milestone.projectsCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Code className="w-3.5 h-3.5 text-[#1F6B4F]" />
                        {milestone.projectsCount} Projects
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-heading text-base sm:text-lg font-bold text-[#171918]">
                  {milestone.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#626763] mt-1 leading-relaxed">
                  {milestone.description}
                </p>

                {/* Skills Covered Pills */}
                {milestone.skillsCovered && milestone.skillsCovered.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#E5E5DF]/60">
                    <span className="text-[11px] font-semibold text-[#626763] mr-1">Skills Covered:</span>
                    {milestone.skillsCovered.map((skill) => (
                      <span
                        key={skill}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                          topBottleneckSkill && skill.toLowerCase().includes(topBottleneckSkill.toLowerCase())
                            ? 'bg-red-50 text-red-700 border border-red-200 font-bold'
                            : 'bg-[#D8E8DE]/70 text-[#1F6B4F] border border-[#C2D8C9]'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons for Stage */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#E5E5DF]/60">
                  {isInProgress ? (
                    <>
                      <Link to={ROUTES.TODAY}>
                        <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Start Stage Action
                        </Button>
                      </Link>
                      <Link to={ROUTES.CHALLENGES}>
                        <Button variant="outline" size="sm">
                          Practice Challenges
                        </Button>
                      </Link>
                    </>
                  ) : isCompleted ? (
                    <Link to={ROUTES.SKILL_EVIDENCE}>
                      <Button variant="outline" size="sm">
                        View Stage Evidence
                      </Button>
                    </Link>
                  ) : (
                    <Link to={ROUTES.ROADMAP}>
                      <Button variant="outline" size="sm">
                        Preview Stage Details
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default MissionStageTimeline
