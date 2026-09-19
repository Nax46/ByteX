import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ResourceRecommendation, LearningResource } from '@/types/resource.types'
import { ExternalLink, Clock, CheckCircle2, Circle, Sparkles, Award } from 'lucide-react'

interface RecommendedResourceCardProps {
  recommendation: ResourceRecommendation
  onToggleCompleted: (resource: LearningResource) => void
}

export const RecommendedResourceCard: React.FC<RecommendedResourceCardProps> = ({
  recommendation,
  onToggleCompleted,
}) => {
  const { resource, relevanceScore, recommendationReason, skillName, targetSkillGap } = recommendation
  const isCompleted = !!resource.isCompleted

  return (
    <Card className="p-5 sm:p-6 border-[#1F6B4F]/40 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 relative overflow-hidden group">
      {/* Top Banner Tag */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1F6B4F] via-[#2D8A66] to-[#D8E8DE]" />

      <div className="space-y-3">
        {/* Badges & Meta */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="forest" size="sm" className="bg-[#D8E8DE] text-[#1F6B4F] font-bold">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {Math.round(relevanceScore)}% Match
            </Badge>

            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#F8F7F3] text-[#171918] border border-[#E5E5DF]">
              {skillName}
            </span>

            {resource.level && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#E5E5DF] bg-white text-[#626763]">
                {resource.level}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#626763] font-medium">
            <span>{resource.type}</span>
            <span>•</span>
            <span className="text-[#171918] font-semibold">{resource.provider}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-heading text-base font-bold text-[#171918] leading-snug group-hover:text-[#1F6B4F] transition-colors duration-200">
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#626763] leading-relaxed line-clamp-2">
          {resource.description}
        </p>

        {/* Relevance Callout Box */}
        <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-[#1F6B4F] font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Addresses: {skillName} Gap {targetSkillGap > 0 ? `(-${targetSkillGap} pts)` : ''}</span>
          </div>
          <p className="text-[11px] text-[#626763]">
            <strong className="text-[#171918]">Why you&apos;re seeing this:</strong> {recommendationReason}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="pt-1">
          <ProgressBar
            value={isCompleted ? 100 : 0}
            size="sm"
            variant="forest"
            label={isCompleted ? 'Completed' : 'Not started'}
            showPercentage={isCompleted}
          />
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between gap-2 text-xs">
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
            leftIcon={isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6B4F]" /> : <Circle className="w-3.5 h-3.5 text-[#8E948F]" />}
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
              Start Learning
            </Button>
          </a>
        </div>
      </div>
    </Card>
  )
}
