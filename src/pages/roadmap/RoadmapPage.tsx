import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { roadmapApi } from '@/api/endpoints/roadmap.api'
import { Roadmap, RoadmapMilestone, MilestoneStatus } from '@/types/roadmap.types'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle2, ArrowRight, ChevronDown, BookOpen, Check, Sparkles, Map } from 'lucide-react'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const RoadmapPage: React.FC = () => {
  const { user } = useAuth()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadRoadmap = async () => {
      setIsLoading(true)
      try {
        const data = await roadmapApi.getCurrentRoadmap()
        if (isMounted) {
          setRoadmap(data || null)
          // Default to first in-progress or first milestone expanded
          const active = data?.milestones?.find((m) => m.status === 'IN_PROGRESS') || data?.milestones?.[0]
          if (active) setExpandedStage(active.id)
        }
      } catch (err) {
        console.error('Failed to load roadmap:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadRoadmap()
    return () => {
      isMounted = false
    }
  }, [])

  const handleGenerateRoadmap = async () => {
    setIsRegenerating(true)
    try {
      const newRoadmap = await roadmapApi.regenerateRoadmap()
      setRoadmap(newRoadmap)
      const active = newRoadmap?.milestones?.find((m) => m.status === 'IN_PROGRESS') || newRoadmap?.milestones?.[0]
      if (active) setExpandedStage(active.id)
    } catch (err) {
      console.error('Failed to generate roadmap:', err)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleToggleMilestone = async (milestone: RoadmapMilestone) => {
    const nextStatus: MilestoneStatus = milestone.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
    try {
      await roadmapApi.updateMilestoneStatus(milestone.id, nextStatus)
      setRoadmap((prev) => {
        if (!prev) return null
        const updated = prev.milestones.map((m) =>
          m.id === milestone.id ? { ...m, status: nextStatus } : m
        )
        const completedCount = updated.filter((m) => m.status === 'COMPLETED').length
        const pct = Math.round((completedCount / updated.length) * 100)
        return {
          ...prev,
          milestones: updated,
          progressPercentage: pct,
        }
      })
    } catch (err) {
      console.error('Failed to update milestone:', err)
    }
  }

  const toggleStage = (id: string) => {
    setExpandedStage((prev) => (prev === id ? null : id))
  }

  if (isLoading) {
    return <LoadingState message="Loading your customized learning path..." minHeight="min-h-[350px]" />
  }

  const milestones = roadmap?.milestones || []
  const completedStages = milestones.filter((m) => m.status === 'COMPLETED').length
  const totalStages = milestones.length
  const progressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0
  const activeMilestone = milestones.find((m) => m.status === 'IN_PROGRESS') || milestones[0]

  return (
    <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
      {/* Header */}
      <PageHeader
        title="Your Learning Path"
        subtitle={`Built around your current abilities and your goal of becoming a ${roadmap?.careerGoal || user?.careerGoal || DEFAULT_CAREER_GOAL}.`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Learning Path' },
        ]}
      />

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-[#D8E8DE]/80 border border-[#C2D8C9] text-xs font-semibold text-[#1F6B4F]">
          {feedbackMsg}
        </div>
      )}

      {/* Progress Summary Card */}
      {milestones.length > 0 ? (
        <Card glass="elevated" sheen className="p-6 border-white/80 shadow-lg animate-slideUp">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-xs font-semibold text-[#1F6B4F]">Track Progress</span>
              <h3 className="font-heading text-lg font-bold text-[#171918]">
                {completedStages} of {totalStages} Stages Completed
              </h3>
            </div>
            {activeMilestone && (
              <Badge variant="forest" size="md">
                Active: {activeMilestone.title}
              </Badge>
            )}
          </div>
          <ProgressBar value={progressPercent} size="md" variant="forest" showPercentage />
        </Card>
      ) : null}

      {/* Vertical Roadmap */}
      {milestones.length > 0 ? (
        <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-[#1F6B4F] before:via-[#1F6B4F] before:to-[#E5E5DF]">
          {milestones.map((stage) => {
            const isCompleted = stage.status === 'COMPLETED'
            const isNext = stage.status === 'IN_PROGRESS'
            const isExpanded = expandedStage === stage.id

            return (
              <div key={stage.id} className="relative">
                {/* Vertical Step Marker Node */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center -translate-x-1/2 transition-transform duration-200 z-20 ${
                    isCompleted
                      ? 'bg-[#1F6B4F] border-[#1F6B4F] text-white shadow-xs'
                      : isNext
                      ? 'bg-white border-[#1F6B4F] text-[#1F6B4F] animate-pathPulse shadow-xs scale-110'
                      : 'glass-panel border-[#D0D0C8] text-[#8E948F]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{stage.order}</span>
                  )}
                </div>

                {/* Stage Card with Glass */}
                <Card
                  glass={isNext ? 'elevated' : 'interactive'}
                  sheen={isNext}
                  className={`p-5 sm:p-6 transition-all duration-200 cursor-pointer ${
                    isNext
                      ? 'border-[#1F6B4F]/50 ring-1 ring-[#1F6B4F]/30 shadow-md'
                      : isCompleted
                      ? 'border-white/80 bg-[#D8E8DE]/20'
                      : 'border-white/60 opacity-90 hover:opacity-100'
                  }`}
                  onClick={() => toggleStage(stage.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#626763]">
                        Stage {stage.order}
                      </span>
                      <h3 className="font-heading text-base sm:text-lg font-bold text-[#171918]">
                        {stage.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isCompleted
                            ? 'forest'
                            : isNext
                            ? 'warning'
                            : 'outline'
                        }
                        size="sm"
                      >
                        {stage.status}
                      </Badge>
                      <ChevronDown
                        className={`w-4 h-4 text-[#626763] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#626763] leading-relaxed mb-3">
                    {stage.description}
                  </p>

                  {/* Expandable Content Section */}
                  {isExpanded && (
                    <div className="pt-3 pb-2 border-t border-[#E5E5DF] mt-2 space-y-3 animate-fadeIn">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-[#171918] uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" /> Covered Skills:
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {stage.skillsCovered?.map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#F8F7F3] border border-[#E5E5DF] text-[#171918]"
                            >
                              <Check className="w-3 h-3 text-[#1F6B4F] shrink-0" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E5E5DF] text-xs">
                    <div className="flex items-center gap-4 text-[#626763]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                        {stage.estimatedHours} hours
                      </span>
                      <span className="hidden sm:inline text-[#8E948F]">•</span>
                      <span className="flex items-center gap-1 text-[#171918] font-medium">
                        {stage.resourcesCount || 3} resources • {stage.projectsCount || 1} project
                      </span>
                    </div>

                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleMilestone(stage)}
                        className="text-xs"
                      >
                        {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                      </Button>
                      <Link to={ROUTES.RESOURCES}>
                        <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Resources →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="p-8 text-center space-y-4 bg-white border-[#E5E5DF]">
          <Map className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No active roadmap found</h3>
          <p className="text-xs text-[#626763] max-w-md mx-auto">
            You don't have an active roadmap yet. Generate an AI-curated milestone plan designed around your target career goal.
          </p>
          <Button
            variant="primary"
            size="md"
            isLoading={isRegenerating}
            onClick={handleGenerateRoadmap}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate Learning Roadmap
          </Button>
        </Card>
      )}
    </div>
  )
}
