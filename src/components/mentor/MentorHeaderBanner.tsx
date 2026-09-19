import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Target, Zap, MapPin, Trash2, Sparkles } from 'lucide-react'
import { AIPersonalizationContext } from '@/api/endpoints/mentor.api'

interface MentorHeaderBannerProps {
  context?: AIPersonalizationContext | null
  onClearHistory: () => void
  hasMessages: boolean
}

export const MentorHeaderBanner: React.FC<MentorHeaderBannerProps> = ({
  context,
  onClearHistory,
  hasMessages,
}) => {
  const targetCareer = context?.targetCareer || 'Full Stack Developer'
  const topSkill = context?.topPrioritySkill || 'Node.js & Express'
  const topGap = context?.topPriorityGap ?? 45
  const progressPercent = Math.round(context?.overallProgressPercent || 35)

  return (
    <Card className="p-4 bg-gradient-to-r from-[#1F6B4F]/5 via-[#D8E8DE]/20 to-[#F8F7F3] border-[#E5E5DF]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Context Information Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          {/* Target Role */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5DF] text-[#171918] font-medium shadow-2xs">
            <Target className="w-3.5 h-3.5 text-[#1F6B4F]" />
            <span className="text-[#626763]">Career Goal:</span>
            <span className="font-semibold text-[#1F6B4F]">{targetCareer}</span>
          </div>

          {/* Top Priority Bottleneck */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5DF] text-[#171918] font-medium shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[#626763]">Top Bottleneck:</span>
            <span className="font-semibold text-amber-700">{topSkill}</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">
              -{topGap} pts
            </span>
          </div>

          {/* Roadmap Completion */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E5DF] text-[#171918] font-medium shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[#626763]">Roadmap:</span>
            <span className="font-semibold text-blue-800">{progressPercent}% complete</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#626763]">
            <Sparkles className="w-3.5 h-3.5 text-[#1F6B4F] animate-pulse" />
            <span>Live Platform Context Active</span>
          </div>
          {hasMessages && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearHistory}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#626763]" />}
              className="text-xs text-[#626763] hover:text-red-600 hover:border-red-200"
            >
              Clear Chat
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
