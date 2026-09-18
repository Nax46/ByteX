import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { roadmapApi, IRoadmapProgressSummary } from '@/api/endpoints/roadmap.api'
import { ROUTES } from '@/constants/routes'
import { Clock, CheckCircle2, ArrowRight, ChevronDown, BookOpen, Check, Play, RefreshCw, Sparkles } from 'lucide-react'

export const RoadmapPage: React.FC = () => {
  const [progressSummary, setProgressSummary] = useState<IRoadmapProgressSummary | null>(null)
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAdapting, setIsAdapting] = useState<boolean>(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  const fetchRoadmap = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await roadmapApi.getRoadmapProgress()
      if (data && data.progress) {
        setProgressSummary(data.progress)
        const activeMod = data.progress.modules.find((m) => m.status === 'IN_PROGRESS')
        if (activeMod) {
          setExpandedModuleId(activeMod.moduleId)
        }
      }
    } catch (err: unknown) {
      console.error('Failed to load roadmap progress:', err)
      setError('Unable to load roadmap from backend. Please ensure you have completed onboarding.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoadmap()
  }, [])

  const handleStartModule = async (moduleId: string) => {
    setActionLoading(moduleId)
    setFeedbackMsg(null)
    try {
      const res = await roadmapApi.startModule(moduleId, progressSummary?.roadmapId)
      if (res && res.progress) {
        setProgressSummary(res.progress)
        setFeedbackMsg(`Module started! Status changed to IN_PROGRESS.`)
      }
    } catch (err: unknown) {
      console.error('Error starting module:', err)
      setError('Unable to start module. Ensure prerequisite modules are completed.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompleteModule = async (moduleId: string) => {
    setActionLoading(moduleId)
    setFeedbackMsg(null)
    try {
      const res = await roadmapApi.completeModule(moduleId, progressSummary?.roadmapId)
      if (res && res.progress) {
        setProgressSummary(res.progress)
        setFeedbackMsg(`Module completed successfully! Next module unlocked.`)
      }
    } catch (err: unknown) {
      console.error('Error completing module:', err)
      setError('Unable to complete module.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleTriggerAdaptive = async () => {
    setIsAdapting(true)
    setFeedbackMsg(null)
    setError(null)
    try {
      await roadmapApi.generateAdaptiveRoadmap(true)
      setFeedbackMsg('Adaptive roadmap generated successfully from latest assessment evidence!')
      await fetchRoadmap()
    } catch (err: unknown) {
      console.error('Error generating adaptive roadmap:', err)
      setError('Unable to generate adaptive roadmap.')
    } finally {
      setIsAdapting(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading your personalized learning path..." minHeight="min-h-[350px]" />
  }

  if (error && !progressSummary) {
    return <ErrorState message={error || 'Roadmap is temporarily unavailable.'} />
  }

  const modules = progressSummary?.roadmapDetails?.modules || []
  const progressMap = new Map((progressSummary?.modules || []).map((m) => [m.moduleId, m]))

  return (
    <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
      {/* Header */}
      <PageHeader
        title={`Learning Path (Version ${progressSummary?.version ?? 1})`}
        subtitle="Built dynamically around your demonstrated skills and career target."
        actions={
          <Button
            variant="outline"
            size="sm"
            isLoading={isAdapting}
            onClick={handleTriggerAdaptive}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#1F6B4F]" />}
          >
            Adapt Roadmap
          </Button>
        }
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
      <Card glass="elevated" sheen className="p-6 border-white/80 shadow-lg animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-xs font-semibold text-[#1F6B4F]">Track Progress</span>
            <h3 className="font-heading text-lg font-bold text-[#171918]">
              {progressSummary?.completedModules ?? 0} of {progressSummary?.totalModules ?? 0} Modules Completed
            </h3>
          </div>
          <Badge variant="forest" size="md">
            Status: {progressSummary?.status || 'ACTIVE'}
          </Badge>
        </div>
        <ProgressBar value={progressSummary?.overallProgress ?? 0} size="md" variant="forest" showPercentage />
      </Card>

      {/* Vertical Roadmap Modules */}
      <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-[#1F6B4F] before:via-[#1F6B4F] before:to-[#E5E5DF]">
        {modules.length === 0 ? (
          <Card className="p-8 text-center text-xs text-[#626763]">
            No roadmap modules found. Complete your initial skill assessment to generate your personalized learning path.
          </Card>
        ) : (
          modules.map((mod) => {
            const prog = progressMap.get(mod.moduleId)
            const status = prog?.status || 'LOCKED'
            const isCompleted = status === 'COMPLETED'
            const isInProgress = status === 'IN_PROGRESS'
            const isExpanded = expandedModuleId === mod.moduleId

            return (
              <div key={mod.moduleId} className="relative">
                {/* Step Node */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center -translate-x-1/2 transition-transform duration-200 z-20 ${
                    isCompleted
                      ? 'bg-[#1F6B4F] border-[#1F6B4F] text-white shadow-xs'
                      : isInProgress
                      ? 'bg-white border-[#1F6B4F] text-[#1F6B4F] animate-pathPulse shadow-xs scale-110'
                      : 'glass-panel border-[#D0D0C8] text-[#8E948F]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[10px] font-bold">{mod.order}</span>
                  )}
                </div>

                {/* Module Card */}
                <Card
                  glass={isInProgress ? 'elevated' : 'interactive'}
                  sheen={isInProgress}
                  className={`p-5 sm:p-6 transition-all duration-200 cursor-pointer ${
                    isInProgress
                      ? 'border-[#1F6B4F]/50 ring-1 ring-[#1F6B4F]/30 shadow-md'
                      : isCompleted
                      ? 'border-white/80 bg-[#D8E8DE]/20'
                      : 'border-white/60 opacity-90 hover:opacity-100'
                  }`}
                  onClick={() => setExpandedModuleId((prev) => (prev === mod.moduleId ? null : mod.moduleId))}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#626763]">
                        Stage {mod.order}
                      </span>
                      <h3 className="font-heading text-base sm:text-lg font-bold text-[#171918]">
                        {mod.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isCompleted
                            ? 'forest'
                            : isInProgress
                            ? 'warning'
                            : 'outline'
                        }
                        size="sm"
                      >
                        {status}
                      </Badge>
                      <ChevronDown
                        className={`w-4 h-4 text-[#626763] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#626763] leading-relaxed mb-3">
                    {mod.description}
                  </p>

                  {/* Expandable Section */}
                  {isExpanded && (
                    <div className="pt-3 pb-2 border-t border-[#E5E5DF] mt-2 space-y-3 animate-fadeIn">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-[#171918] uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" /> Module Details & Objectives:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-[#626763]">
                          <div className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-[#1F6B4F] shrink-0" />
                            <span>Target Level: {mod.targetLevel}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-[#1F6B4F] shrink-0" />
                            <span>Demonstrated Skill: {mod.skillName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E5E5DF] text-xs">
                    <div className="flex items-center gap-4 text-[#626763]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                        {mod.estimatedHours} hrs
                      </span>
                      <span className="hidden sm:inline text-[#8E948F]">•</span>
                      <span className="flex items-center gap-1 text-[#171918] font-medium">
                        Skill: {mod.skillName}
                      </span>
                    </div>

                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                      {status === 'LOCKED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={actionLoading === mod.moduleId}
                          onClick={() => handleStartModule(mod.moduleId)}
                          leftIcon={<Play className="w-3 h-3 text-[#1F6B4F]" />}
                        >
                          Start Module
                        </Button>
                      )}

                      {status === 'IN_PROGRESS' && (
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={actionLoading === mod.moduleId}
                          onClick={() => handleCompleteModule(mod.moduleId)}
                          rightIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Mark Completed
                        </Button>
                      )}

                      {status === 'COMPLETED' && (
                        <span className="text-xs text-[#1F6B4F] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
