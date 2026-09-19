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
import { Clock, CheckCircle2, ArrowRight, ChevronDown, BookOpen, Check, Sparkles, Map, Lock, AlertCircle } from 'lucide-react'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const RoadmapPage: React.FC = () => {
  const { user } = useAuth()
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(null)
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadRoadmap = async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data = await roadmapApi.getCurrentRoadmap()
      setRoadmap(data || null)
      const active = data?.milestones?.find((m) => m.status === 'IN_PROGRESS') || data?.milestones?.[0]
      if (active) setExpandedStage(active.id)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to load your learning roadmap. Please check your connection and try again.'
      setErrorMsg(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRoadmap()
  }, [])

  const handleGenerateRoadmap = async () => {
    setIsRegenerating(true)
    setErrorMsg(null)
    setFeedbackMsg(null)
    try {
      const newRoadmap = await roadmapApi.regenerateRoadmap()
      setRoadmap(newRoadmap)
      setFeedbackMsg(`Adaptive roadmap (V${newRoadmap?.version || 1}) updated successfully based on your current skill profile!`)
      const active = newRoadmap?.milestones?.find((m) => m.status === 'IN_PROGRESS') || newRoadmap?.milestones?.[0]
      if (active) setExpandedStage(active.id)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Failed to adapt roadmap. Please ensure your student profile has a target career configured.'
      setErrorMsg(msg)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleStartMilestone = async (milestone: RoadmapMilestone) => {
    setUpdatingMilestoneId(milestone.id)
    setErrorMsg(null)
    setFeedbackMsg(null)
    try {
      await roadmapApi.startModule(milestone.id, roadmap?.id)
      const fresh = await roadmapApi.getCurrentRoadmap()
      setRoadmap(fresh)
      setFeedbackMsg(`Started stage ${milestone.order}: "${milestone.title}". Good luck!`)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Unable to start this stage. Ensure all prerequisite stages are completed first.'
      setErrorMsg(msg)
    } finally {
      setUpdatingMilestoneId(null)
    }
  }

  const handleCompleteMilestone = async (milestone: RoadmapMilestone) => {
    setUpdatingMilestoneId(milestone.id)
    setErrorMsg(null)
    setFeedbackMsg(null)
    try {
      await roadmapApi.completeModule(milestone.id, roadmap?.id)
      const fresh = await roadmapApi.getCurrentRoadmap()
      setRoadmap(fresh)
      setFeedbackMsg(`Completed stage ${milestone.order}: "${milestone.title}"! Next stage is now unlocked.`)
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: string }).message)
        : 'Unable to mark stage completed. Please try again.'
      setErrorMsg(msg)
    } finally {
      setUpdatingMilestoneId(null)
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
  const progressPercent = typeof roadmap?.progressPercentage === 'number'
    ? roadmap.progressPercentage
    : totalStages > 0
    ? Math.round((completedStages / totalStages) * 100)
    : 0
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

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-xs font-semibold text-[#9B1C1C] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#C81E1E] shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadRoadmap} className="text-xs h-7">
            Retry
          </Button>
        </div>
      )}

      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-[#D8E8DE]/80 border border-[#C2D8C9] text-xs font-semibold text-[#1F6B4F] flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-[#1F6B4F] hover:text-[#171918] text-xs underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Progress Summary Card */}
      {milestones.length > 0 ? (
        <Card glass="elevated" sheen className="p-6 border-white/80 shadow-lg animate-slideUp">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#1F6B4F]">Track Progress</span>
                {roadmap?.version && (
                  <Badge variant="outline" size="sm" className="text-[10px] font-mono">
                    v{roadmap.version} Active
                  </Badge>
                )}
              </div>
              <h3 className="font-heading text-lg font-bold text-[#171918]">
                {completedStages} of {totalStages} Stages Completed
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {activeMilestone && (
                <Badge variant="forest" size="md">
                  Active: {activeMilestone.title}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                isLoading={isRegenerating}
                onClick={handleGenerateRoadmap}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#1F6B4F]" />}
                className="text-xs border-[#1F6B4F]/30 hover:bg-[#1F6B4F]/5 text-[#1F6B4F]"
              >
                Adapt with AI
              </Button>
            </div>
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
                  ) : stage.status === 'LOCKED' ? (
                    <Lock className="w-2.5 h-2.5 text-[#8E948F]" />
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
                      {isCompleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="text-xs text-[#1F6B4F] border-[#1F6B4F]/30 bg-[#1F6B4F]/5 cursor-default font-medium"
                        >
                          <Check className="w-3.5 h-3.5 mr-1 text-[#1F6B4F]" />
                          Completed
                        </Button>
                      ) : isNext ? (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={updatingMilestoneId === stage.id}
                          onClick={() => handleCompleteMilestone(stage)}
                          className="text-xs shadow-xs"
                        >
                          Mark Complete
                        </Button>
                      ) : (
                        (() => {
                          const prevStage = milestones.find((m) => m.order === stage.order - 1)
                          const isUnlocked = stage.order === 1 || prevStage?.status === 'COMPLETED'
                          return isUnlocked ? (
                            <Button
                              variant="outline"
                              size="sm"
                              isLoading={updatingMilestoneId === stage.id}
                              onClick={() => handleStartMilestone(stage)}
                              className="text-xs text-[#1F6B4F] border-[#1F6B4F]/40 hover:bg-[#1F6B4F]/5 font-medium"
                            >
                              Start Stage
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              title="Complete prerequisite stages first"
                              className="text-xs opacity-60 cursor-not-allowed text-[#8E948F] flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3 text-[#8E948F]" />
                              Locked
                            </Button>
                          )
                        })()
                      )}
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
