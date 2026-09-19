import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Map, CheckCircle2, PlayCircle, Circle } from 'lucide-react'
import { RoadmapMilestone } from '@/types/roadmap.types'

interface RoadmapModuleProgressProps {
  milestones: RoadmapMilestone[]
}

export const RoadmapModuleProgress: React.FC<RoadmapModuleProgressProps> = ({ milestones }) => {
  if (!milestones || milestones.length === 0) {
    return (
      <Card className="p-6 border-[#E5E5DF] bg-white space-y-4">
        <h3 className="font-heading text-base font-bold text-[#171918]">Learning Roadmap Progress</h3>
        <p className="text-xs text-[#626763]">No active roadmap modules loaded. Select a career goal to generate your roadmap.</p>
      </Card>
    )
  }

  const completedCount = milestones.filter((m) => m.status === 'COMPLETED').length

  return (
    <Card className="p-6 border-[#E5E5DF] bg-white space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E5E5DF]">
          <div className="space-y-0.5">
            <h3 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
              <Map className="w-4 h-4 text-[#1F6B4F]" />
              Learning Roadmap Progression
            </h3>
            <p className="text-xs text-[#626763]">Sequential milestone modules in your pathway</p>
          </div>

          <Badge variant="forest" size="sm" className="font-bold">
            {completedCount} / {milestones.length} Complete
          </Badge>
        </div>

        <div className="space-y-3 pt-2">
          {milestones.map((mod: RoadmapMilestone, idx: number) => {
            const isCompleted = mod.status === 'COMPLETED'
            const isInProgress = mod.status === 'IN_PROGRESS'

            return (
              <div
                key={mod.id || idx}
                className={`p-3.5 rounded-xl border transition-all duration-150 space-y-2 text-xs ${
                  isInProgress
                    ? 'bg-[#F4F9F6] border-[#1F6B4F]/40 shadow-xs'
                    : isCompleted
                    ? 'bg-[#F8F7F3] border-[#E5E5DF]'
                    : 'bg-white border-[#E5E5DF] opacity-80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1F6B4F]" />
                    ) : isInProgress ? (
                      <PlayCircle className="w-4 h-4 text-[#1F6B4F] animate-pulse" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#8E948F]" />
                    )}

                    <span className="font-bold text-[#171918]">
                      Stage {idx + 1}: {mod.title}
                    </span>
                  </div>

                  {isCompleted ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D8E8DE] text-[#1F6B4F]">
                      ✓ Completed
                    </span>
                  ) : isInProgress ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1F6B4F] text-white">
                      ● Active Module
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[#8E948F]">
                      ○ Upcoming
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#626763] line-clamp-2 pl-6">
                  {mod.description}
                </p>

                {mod.skillsCovered && mod.skillsCovered.length > 0 && (
                  <div className="pl-6 pt-1 flex flex-wrap gap-1">
                    {mod.skillsCovered.map((s: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-white text-[#1F6B4F] font-semibold border border-[#E5E5DF]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-[#E5E5DF] text-xs text-[#626763] flex items-center justify-between">
        <span>Sequential milestone progression</span>
        <span className="font-semibold text-[#171918]">{completedCount} of {milestones.length} Finished</span>
      </div>
    </Card>
  )
}

