import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { aiApi } from '@/api/endpoints/ai.api'
import { CareerTrackRecommendation } from '@/types/ai.types'
import {
  Check,
  Circle,
  ArrowRight,
  Info,
  Sparkles,
  Filter,
  Bot,
  Quote,
  RefreshCw,
  AlertCircle,
  Lightbulb,
} from 'lucide-react'

export const CareersPage: React.FC = () => {
  const [tracks, setTracks] = useState<CareerTrackRecommendation[]>([])
  const [aiSummary, setAiSummary] = useState<{
    headline?: string
    summaryText?: string
    encouragementQuote?: string
    nextBestAction?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'target'>('all')

  const loadCareerRecommendations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await aiApi.getCareerRecommendations()
      setTracks(data.allTracks || [])
      setAiSummary({
        headline: data.summaryHeadline,
        summaryText: data.summaryText,
        encouragementQuote: data.encouragementQuote,
        nextBestAction: data.nextBestAction,
      })
    } catch (err: unknown) {
      console.error('Failed to load career recommendations:', err)
      setError('Unable to load personalized career recommendations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCareerRecommendations()
  }, [loadCareerRecommendations])

  const filteredTracks = tracks.filter((track) => {
    if (activeFilter === 'target') return track.isTargetRole
    if (activeFilter === 'high') return track.alignment >= 50
    return true
  })

  if (isLoading) {
    return <LoadingState message="Synthesizing AI career recommendations..." minHeight="min-h-[350px]" />
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Career Explorer & AI Recommendations"
        subtitle="Explore where your verified competencies take you. Compare your skills against technical industry standards with live AI guidance."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Careers' },
        ]}
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-3 animate-slideUp">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadCareerRecommendations}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry
          </Button>
        </div>
      )}

      {/* AI Personalized Career Guidance Banner */}
      {aiSummary && (aiSummary.headline || aiSummary.summaryText) && (
        <Card glass="elevated" sheen className="p-6 sm:p-7 border-white/80 space-y-4 animate-slideUp">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[#1F6B4F] text-xs font-semibold">
                <Bot className="w-3.5 h-3.5 text-[#1F6B4F]" />
                <span>AI Career Intelligence Engine</span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
                {aiSummary.headline || 'Personalized Career Guidance'}
              </h2>
            </div>

            <Link to={ROUTES.MENTOR}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Chat with AI Mentor
              </Button>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-[#626763] leading-relaxed max-w-3xl">
            {aiSummary.summaryText}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Immediate Next Step */}
            {aiSummary.nextBestAction && (
              <div className="p-3.5 rounded-xl bg-[#D8E8DE]/50 border border-[#C2D8C9] space-y-1 text-xs">
                <span className="font-bold text-[#1F6B4F] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Lightbulb className="w-3.5 h-3.5 text-[#1F6B4F]" />
                  Immediate Recommendation
                </span>
                <p className="text-[#171918] leading-relaxed font-medium">
                  {aiSummary.nextBestAction}
                </p>
              </div>
            )}

            {/* Motivational Quote */}
            {aiSummary.encouragementQuote && (
              <div className="p-3.5 rounded-xl bg-[#F8F9F8] border border-[#E5E5DF] space-y-1 text-xs">
                <span className="font-bold text-[#626763] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Quote className="w-3 h-3 text-[#626763]" />
                  Mentor Perspective
                </span>
                <p className="text-[#626763] italic leading-relaxed">
                  {aiSummary.encouragementQuote}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Educational Notice Banner */}
      <div className="p-4 rounded-xl glass-panel border-white/80 flex items-start gap-3 shadow-xs">
        <Info className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5" />
        <p className="text-xs text-[#626763] leading-relaxed">
          <strong className="text-[#171918]">Educational matching note:</strong> Career alignment percentages reflect a quantitative comparison between your verified assessment scores and entry-level syllabus rubrics. They serve as personal learning benchmarks to prioritize your study milestones.
        </p>
      </div>

      {/* Interactive Filter Pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#626763]" />
          <span className="text-xs font-semibold text-[#626763]">Filter Tracks:</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Careers' },
              { id: 'high', label: 'High Alignment (≥50%)' },
              { id: 'target', label: 'Active Goal Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as 'all' | 'high' | 'target')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#1F6B4F] text-white shadow-xs scale-[1.02]'
                    : 'glass-pill border-white/80 text-[#626763] hover:text-[#171918]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-[#8E948F]">
          Showing {filteredTracks.length} of {tracks.length} roles
        </span>
      </div>

      {/* Career Cards Grid */}
      <div className="space-y-5">
        {filteredTracks.map((career, index) => {
          const staggerClass = index === 0 ? 'stagger-1' : index === 1 ? 'stagger-2' : index === 2 ? 'stagger-3' : 'stagger-4'
          return (
            <Card
              key={career.id || career.slug}
              glass="interactive"
              sheen={career.isTargetRole}
              className={`p-6 sm:p-7 border-white/80 space-y-5 animate-slideUp ${staggerClass} hover-lift ${
                career.isTargetRole ? 'ring-1 ring-[#1F6B4F] border-[#1F6B4F]/50 shadow-md' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#171918]">
                      {career.title}
                    </h3>
                    {career.isTargetRole && (
                      <Badge variant="forest" size="sm" className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#1F6B4F]" />
                        Your Active Goal
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#626763] mt-1 max-w-xl leading-relaxed">
                    {career.description}
                  </p>
                </div>

                <div className="sm:text-right shrink-0 min-w-32">
                  <div className="font-heading text-2xl sm:text-3xl font-bold text-[#1F6B4F] flex sm:justify-end items-baseline gap-0.5">
                    <AnimatedCounter end={career.alignment} duration={1200} suffix="%" />
                  </div>
                  <p className="text-[11px] text-[#626763] mb-1.5">Skill alignment</p>

                  {/* Visual Alignment Bar */}
                  <div className="w-full h-1.5 bg-[#F1EFEA] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        career.alignment >= 65 ? 'bg-[#1F6B4F] progress-shimmer' : 'bg-[#E7A84B]'
                      }`}
                      style={{ width: `${career.alignment}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Skill Alignment Comparison Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                {/* Existing Skills */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B4F]" />
                    You already have
                  </span>
                  <ul className="space-y-1.5 pt-1">
                    {career.existingSkills.map((sk, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#171918]">
                        <Check className="w-3.5 h-3.5 text-[#1F6B4F] shrink-0" />
                        <span>{sk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Skills / Focus Next */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A66E1D] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E7A84B]" />
                    Focus next
                  </span>
                  <ul className="space-y-1.5 pt-1">
                    {career.missingSkills.map((sk, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#626763]">
                        <Circle className="w-2.5 h-2.5 text-[#E7A84B] shrink-0 fill-[#E7A84B]/20" />
                        <span>{sk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-[#626763]">
                  <strong className="text-[#171918]">Recommended next step:</strong>{' '}
                  {career.recommendedNextStep}
                </p>

                <Link to={career.isTargetRole ? ROUTES.ROADMAP : ROUTES.SKILL_GAP} className="shrink-0 group">
                  <Button
                    variant={career.isTargetRole ? 'primary' : 'outline'}
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover-arrow" />}
                  >
                    {career.isTargetRole ? 'View Learning Roadmap' : 'Compare Skill Matrix'}
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
