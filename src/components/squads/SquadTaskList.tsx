import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SquadTask, SquadTaskStatus } from '@/types/squad.types'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, Clock, Code, ArrowRight, Zap, Target } from 'lucide-react'

interface SquadTaskListProps {
  tasks: SquadTask[]
  onUpdateTaskStatus: (taskId: string, status: SquadTaskStatus) => void
}

export const SquadTaskList: React.FC<SquadTaskListProps> = ({
  tasks,
  onUpdateTaskStatus,
}) => {
  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]/70">
        <div>
          <h2 className="font-heading text-base sm:text-lg font-bold text-[#171918] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#1F6B4F]" />
            Squad Project Tasks & Responsibilities
          </h2>
          <p className="text-xs text-[#626763] mt-0.5">
            Role-based development tasks required for project completion and evidence generation
          </p>
        </div>
        <Link to={ROUTES.TODAY}>
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Execute Today's Action
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const isCompleted = task.status === 'COMPLETED'
          const isInProgress = task.status === 'IN_PROGRESS'

          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                isCompleted
                  ? 'bg-[#D8E8DE]/20 border-[#C2D8C9]'
                  : isInProgress
                  ? 'bg-[#F8F7F3] border-[#1F6B4F]/40 shadow-xs ring-1 ring-[#1F6B4F]/20'
                  : 'bg-white border-[#E5E5DF]'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <span
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'bg-[#1F6B4F] text-white'
                      : isInProgress
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#E5E5DF] text-[#626763]'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Code className="w-4 h-4" />}
                </span>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-sm font-bold text-[#171918]">{task.title}</h3>
                    <Badge variant={isCompleted ? 'forest' : isInProgress ? 'warning' : 'outline'} size="sm">
                      {isCompleted ? '✓ Completed' : isInProgress ? '● In Progress' : '○ To Do'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#626763] leading-relaxed">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#626763] pt-0.5">
                    <span>Assigned Role: <strong className="text-[#171918]">{task.assignedRole}</strong></span>
                    <span>•</span>
                    <span>Skill Tag: <strong className="text-[#1F6B4F]">{task.skillTag}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                {isCompleted ? (
                  <span className="text-[11px] font-semibold text-[#1F6B4F] bg-[#D8E8DE]/60 px-2.5 py-1 rounded-full border border-[#C2D8C9]">
                    ✓ Evidence Verified
                  </span>
                ) : isInProgress ? (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    onClick={() => onUpdateTaskStatus(task.id, 'COMPLETED')}
                  >
                    Mark Task Completed
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Clock className="w-3.5 h-3.5" />}
                    onClick={() => onUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                  >
                    Start Working
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default SquadTaskList
