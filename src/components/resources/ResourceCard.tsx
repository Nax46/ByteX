import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LearningResource } from '@/types/resource.types'
import { ExternalLink, Clock, CheckCircle2, Circle } from 'lucide-react'

interface ResourceCardProps {
  resource: LearningResource
  onToggleCompleted: (resource: LearningResource) => void
  staggerClass?: string
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onToggleCompleted,
  staggerClass = '',
}) => {
  const isCompleted = !!resource.isCompleted

  return (
    <Card
      className={`p-5 sm:p-6 border-[#E5E5DF] bg-white flex flex-col justify-between space-y-4 hover-lift animate-slideUp ${staggerClass} group`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="forest" size="sm" className="font-semibold">
              {resource.skillTag || 'Curriculum'}
            </Badge>

            {resource.level && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#E5E5DF] bg-[#F8F7F3] text-[#626763]">
                {resource.level}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#8E948F]">
            <span className="font-semibold text-[#626763]">{resource.type}</span>
            <span>•</span>
            <span className="text-[#171918]">{resource.provider}</span>
          </div>
        </div>

        <h3 className="font-heading text-base font-bold text-[#171918] leading-snug group-hover:text-[#1F6B4F] transition-colors duration-200">
          {resource.title}
        </h3>

        <p className="text-xs text-[#626763] leading-relaxed line-clamp-2">
          {resource.description}
        </p>

        <div className="pt-1">
          <ProgressBar
            value={isCompleted ? 100 : 0}
            size="sm"
            variant="forest"
            label={isCompleted ? 'Completed' : 'Not completed'}
            showPercentage={isCompleted}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between text-xs gap-2">
        <span className="text-[#626763] flex items-center gap-1.5 shrink-0 font-medium">
          <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
          {resource.estimatedDuration || 'Self-paced'}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleCompleted(resource)}
            className="text-xs font-medium"
            leftIcon={
              isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6B4F]" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-[#8E948F]" />
              )
            }
          >
            {isCompleted ? 'Done' : 'Mark Done'}
          </Button>

          <a
            href={resource.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] rounded-lg"
          >
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-bold"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Open Resource
            </Button>
          </a>
        </div>
      </div>
    </Card>
  )
}
