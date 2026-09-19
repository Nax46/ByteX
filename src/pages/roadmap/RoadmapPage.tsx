import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { LoadingState } from '@/components/common/LoadingState'
import { roadmapApi } from '@/api/endpoints/roadmap.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { Roadmap, RoadmapMilestone, MilestoneStatus } from '@/types/roadmap.types'
import { SkillGap } from '@/types/skill.types'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  BookOpen,
  Check,
  Sparkles,
  Map,
  Briefcase,
  Target,
  RefreshCw,
  Zap,
  FolderGit2,
  Lock,
} from 'lucide-react'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const RoadmapPage: React.FC = () => {
  const { user } = useAuth()
  const targetRole = user?.careerGoal || user?.targetCareer || DEFAULT_CAREER_GOAL

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadRoadmapData = async () => {
      setIsLoading(true)
      try {
        const [roadmapRes, gapsRes] = await Promise.allSettled([
          roadmapApi.getCurrentRoadmap(),
          skillsApi.getSkillGaps(),
        ])

        if (!isMounted) return

        if (roadmapRes.status === 'fulfilled' && roadmapRes.value) {
          setRoadmap(roadmapRes.value)
          const active =
            roadmapRes.value.milestones?.find((m) => m.status === 'IN_PROGRESS') ||
            roadmapRes.value.milestones?.[0]
          if (active) setExpandedStage(active.id)
        }

        if (gapsRes.status === 'fulfilled' && gapsRes.value) {
          setSkillGaps(gapsRes.value)
        }
      } catch (err) {
        console.error('Failed to load roadmap intelligence:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadRoadmapData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleGenerateRoadmap = async () => {
    setIsRegenerating(true)
    try {
      const newRoadmap = await roadmapApi.regenerateRoadmap()
      setRoadmap(newRoadmap)
      const active =
        newRoadmap?.milestones?.find((m) => m.status === 'IN_PROGRESS') ||
        newRoadmap?.milestones?.[0]
      if (active) setExpandedStage(active.id)
      setFeedbackMsg('Personalized career roadmap generated based on current skill gaps!')
    } catch (err) {
      console.error('Failed to generate roadmap:', err)
    } finally {
      setIsRegenerating(false)
      setTimeout(() => setFeedbackMsg(null), 4000)
    }
  }

  const handleToggleMilestone = async (milestone: RoadmapMilestone) => {
    const nextStatus: MilestoneStatus =
      milestone.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
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
      setFeedbackMsg(`Stage "${milestone.title}" status updated to ${nextStatus.replace('_', ' ')}.`)
    } catch (err) {
      console.error('Failed to update milestone status:', err)
    } finally {
      setTimeout(() => setFeedbackMsg(null), 3500)
    }
  }

  const toggleStage = (id: string) => {
    setExpandedStage((prev) => (prev === id ? null : id))
  }

  if (isLoading) {
    return <LoadingState message="Building your career-aware learning roadmap..." minHeight="min-h-[350px]" />
  }

  const milestones = roadmap?.milestones || []
  const completedStages = milestones.filter((m) => m.status === 'COMPLETED').length
  const totalStages = milestones.length
  const progressPercent = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0

  const activeMilestone =
    milestones.find((m) => m.status === 'IN_PROGRESS') || milestones[0]

  const nextMilestone =
    milestones.find((m) => m.status === 'NOT_STARTED') || null

  // Match top skill gap addressed by active stage
  const activeCoveredSkills = activeMilestone?.skillsCovered || []
  const matchingGap = skillGaps.find((g) =>
    activeCoveredSkills.some((sc) => sc.toLowerCase() === g.skillName.toLowerCase())
  ) || skillGaps[0]

  return (
    <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Learning Roadmap Intelligence"
        subtitle={`Personalized skill-gap learning path for your goal of becoming a ${targetRole}.`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Learning Path' },
        ]}
      />

      {/* Notification Banner */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-[#D8E8DE]/80 border border-[#C2D8C9] text-xs font-semibold text-[#1F6B4F] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        </div>
      )}

      {/* 1. CAREER GOAL ANCHOR & ROADMAP PROGRESS HERO */}
      <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 space-y-6 animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E5E5DF]/70">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="forest" size="sm" className="flex items-center gap-1 font-semibold">
                <Briefcase className="w-3.5 h-3.5 text-[#1F6B4F]" />
                Target Career: {targetRole}
              </Badge>
              <span className="text-xs text-[#626763] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1F6B4F]" />
                Skill Gap Calibrated Path
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              {targetRole} Learning Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] max-w-xl leading-relaxed">
              Curated milestones addressing your verified skill gaps in sequence to maximize your career readiness.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center sm:text-right shrink-0 min-w-44">
            <span className="text-xs text-[#626763] block font-medium">Roadmap Progress</span>
            <span className="font-heading text-3xl font-extrabold text-[#1F6B4F] block mt-0.5">
              <AnimatedCounter value={progressPercent} suffix="%" />
            </span>
            <span className="text-[11px] font-semibold text-[#1F6B4F] block mt-1">
              {completedStages} of {totalStages} Stages Completed
            </span>
          </div>
        </div>

        {/* Progress Bar & Actions */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#171918]">
              Active Focus: {activeMilestone?.title || 'Stage 01'}
            </span>
            <span className="text-[#626763]">
              {totalStages - completedStages} stages remaining
            </span>
          </div>
          <ProgressBar value={progressPercent} size="md" variant="forest" />

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Link to={ROUTES.SKILL_GAP}>
                <Button variant="outline" size="sm" leftIcon={<Target className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
                  Skill Gap Matrix
                </Button>
              </Link>
              <Link to={ROUTES.CAREERS}>
                <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#626763]" />}>
                  Change Career
                </Button>
              </Link>
            </div>

            <Link to={ROUTES.TODAY}>
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Start Today's Action
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 2. CURRENTLY LEARNING SPOTLIGHT CARD */}
      {activeMilestone && (
        <Card className="p-6 sm:p-7 bg-gradient-to-br from-white via-[#F8F7F3] to-[#FFFDF9] border-[#1F6B4F]/40 space-y-4 shadow-md animate-slideUp">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="forest" size="sm" className="flex items-center gap-1 font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  Currently Learning • Stage {activeMilestone.order}
                </Badge>
                {matchingGap && (
                  <Badge variant="warning" size="sm">
                    Addresses: {matchingGap.skillName} Gap (-{matchingGap.gap} pts)
                  </Badge>
                )}
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
                {activeMilestone.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#626763] max-w-xl leading-relaxed">
                {activeMilestone.description}
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
              <Link to={ROUTES.TODAY}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="w-full">
                  Continue Learning
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs text-[#626763]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#171918] font-medium">
                <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                {activeMilestone.estimatedHours} Hours
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[#171918] font-medium">
                <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" />
                {activeMilestone.resourcesCount || 3} Learning Resources
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-[#171918] font-medium">
                <FolderGit2 className="w-3.5 h-3.5 text-[#1F6B4F]" />
                {activeMilestone.projectsCount || 1} Practical Project
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link to={ROUTES.RESOURCES}>
                <Button variant="outline" size="sm">
                  Resources
                </Button>
              </Link>
              <Link to={ROUTES.PROJECTS}>
                <Button variant="outline" size="sm">
                  Projects
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* 3. NEXT UP SPOTLIGHT CARD */}
      {nextMilestone && (
        <Card className="p-5 bg-white border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Up Next • Stage {nextMilestone.order}
              </span>
            </div>
            <h4 className="font-heading text-base font-bold text-[#171918]">
              {nextMilestone.title}
            </h4>
            <p className="text-xs text-[#626763] max-w-lg">
              {nextMilestone.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleMilestone(nextMilestone)}
            >
              Start Stage
            </Button>
          </div>
        </Card>
      )}

      {/* 4. VERTICAL INTERACTIVE ROADMAP STAGES */}
      {milestones.length > 0 ? (
        <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-[#1F6B4F] before:via-[#1F6B4F] before:to-[#E5E5DF]">
          {milestones.map((stage) => {
            const isCompleted = stage.status === 'COMPLETED'
            const isNext = stage.status === 'IN_PROGRESS'
            const isExpanded = expandedStage === stage.id

            // Check if stage covers a specific skill gap
            const gapMatch = skillGaps.find((g) =>
              stage.skillsCovered?.some((sc) => sc.toLowerCase() === g.skillName.toLowerCase())
            )

            return (
              <div key={stage.id} className="relative">
                {/* Vertical Step Marker Node */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center -translate-x-1/2 transition-transform duration-200 z-20 ${
                    isCompleted
                      ? 'bg-[#1F6B4F] border-[#1F6B4F] text-white shadow-xs'
                      : isNext
                      ? 'bg-white border-[#1F6B4F] text-[#1F6B4F] animate-pathPulse shadow-xs scale-110'
                      : 'bg-white border-[#D0D0C8] text-[#8E948F]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isNext ? (
                    <span className="text-[10px] font-bold text-[#1F6B4F]">{stage.order}</span>
                  ) : (
                    <Lock className="w-3 h-3 text-[#8E948F]" />
                  )}
                </div>

                {/* Stage Card */}
                <Card
                  glass={isNext ? 'elevated' : 'interactive'}
                  sheen={isNext}
                  className={`p-5 sm:p-6 transition-all duration-200 cursor-pointer ${
                    isNext
                      ? 'border-[#1F6B4F]/50 ring-1 ring-[#1F6B4F]/30 shadow-md bg-white'
                      : isCompleted
                      ? 'border-white/80 bg-[#D8E8DE]/20'
                      : 'border-white/60 opacity-90 hover:opacity-100 bg-white'
                  }`}
                  onClick={() => toggleStage(stage.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#626763]">
                        Stage {stage.order}
                      </span>
                      <h3 className="font-heading text-base sm:text-lg font-bold text-[#171918]">
                        {stage.title}
                      </h3>
                      {gapMatch && (
                        <Badge variant="warning" size="sm">
                          Addresses {gapMatch.skillName} Gap
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
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
                        {isCompleted ? 'Completed' : isNext ? 'In Progress' : 'Upcoming'}
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
                          <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" /> Covered Skills & Competencies:
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
                        {isCompleted ? 'Mark Incomplete' : isNext ? 'Mark Complete' : 'Start Stage'}
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
            Generate an AI-curated milestone roadmap designed around your target career goal and verified skill gaps.
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
