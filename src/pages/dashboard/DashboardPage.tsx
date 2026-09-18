import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { dashboardApi } from '@/api/endpoints/dashboard.api'
import { DashboardSummary } from '@/types/dashboard.types'
import { useAuth } from '@/hooks/useAuth'
import { ArrowRight, Clock, Sparkles } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async (isMounted: () => boolean) => {
    setIsLoading(true)
    setError(null)
    try {
      const summary = await dashboardApi.getDashboardSummary()
      if (isMounted()) {
        setData(summary)
      }
    } catch (err: unknown) {
      if (isMounted()) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Unable to load dashboard data. Please try again.'
        setError(message)
        console.error('Dashboard fetch failed:', err)
      }
    } finally {
      if (isMounted()) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    fetchDashboard(() => mounted)
    return () => {
      mounted = false
    }
  }, [fetchDashboard])

  const handleRetry = () => {
    let mounted = true
    fetchDashboard(() => mounted)
  }

  if (isLoading) {
    return <LoadingState message="Loading your SkillPath dashboard..." minHeight="min-h-[350px]" />
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message={error || 'Dashboard data is temporarily unavailable.'}
        onRetry={handleRetry}
      />
    )
  }

  const profile = data.profile || { completed: false }
  const onboarding = data.onboarding || { completed: false }
  const assessment = data.assessment || { hasActiveAttempt: false, latestAttempt: null }

  const displayName = profile.fullName || user?.name || 'Student'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* 1. GREETING & CONTEXT */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#171918]">
            {getGreeting()}, {displayName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#626763] mt-1">
            {profile.targetCareer
              ? `Targeting: ${profile.targetCareer} • Here's where you are in your learning journey.`
              : onboarding.completed
              ? "Here's where you are in your learning journey."
              : 'Complete your onboarding profile to unlock your personalized skill path.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={ROUTES.SKILL_GAP}>
            <Button variant="outline" size="sm">
              Skill Gap Matrix
            </Button>
          </Link>
          {onboarding.completed ? (
            <Link to={ROUTES.ASSESSMENT}>
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                {assessment.hasActiveAttempt
                  ? 'Resume Assessment'
                  : assessment.latestAttempt
                  ? 'Retake Assessment'
                  : 'Take Skill Assessment'}
              </Button>
            </Link>
          ) : (
            <Link to={ROUTES.ONBOARDING}>
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Complete Onboarding
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ONBOARDING INCOMPLETE BANNER */}
      {!onboarding.completed && (
        <Card
          glass="interactive"
          className="p-5 border-[#F8DCB5] bg-[#FDF4E6]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slideUp"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#FBE8CE] border border-[#F8DCB5] flex items-center justify-center text-[#A66E1D] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-[#171918]">
                Onboarding Incomplete
              </h3>
              <p className="text-xs text-[#626763] mt-0.5">
                Set up your educational background, interests, and target career to generate your customized roadmap.
              </p>
            </div>
          </div>
          <Link to={ROUTES.ONBOARDING} className="shrink-0">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Complete Profile Now
            </Button>
          </Link>
        </Card>
      )}

      {/* 2. TOP METRICS (4 compact, elegant cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Target Career"
          value={profile.targetCareer || 'Not Set'}
          subtitle={profile.completed ? 'Active career focus' : 'Set in onboarding'}
          trend={profile.targetCareer ? { value: 'Active', isPositive: true } : undefined}
          className="animate-slideUp stagger-1"
        />
        <StatCard
          title="Profile Status"
          value={onboarding.completed ? 'Complete' : 'Pending'}
          subtitle={onboarding.completed ? 'Onboarding verified' : 'Action required'}
          trend={
            onboarding.completed
              ? { value: 'Ready', isPositive: true }
              : { value: 'Incomplete', isPositive: false }
          }
          className="animate-slideUp stagger-2"
        />
        <StatCard
          title="Skill Assessment"
          value={
            assessment.hasActiveAttempt
              ? 'In Progress'
              : assessment.latestAttempt
              ? assessment.latestAttempt.status
              : 'Not Started'
          }
          subtitle={
            assessment.hasActiveAttempt
              ? 'Active attempt open'
              : assessment.latestAttempt
              ? `Started: ${new Date(assessment.latestAttempt.startedAt).toLocaleDateString()}`
              : 'Diagnostic pending'
          }
          trend={
            assessment.hasActiveAttempt
              ? { value: 'Active', isPositive: true }
              : assessment.latestAttempt?.status === 'COMPLETED'
              ? { value: 'Done', isPositive: true }
              : undefined
          }
          className="animate-slideUp stagger-3"
        />
        <StatCard
          title="Roadmap Path"
          value={profile.completed ? 'Available' : 'Pending'}
          subtitle={
            profile.targetCareer
              ? `Aligned with ${profile.targetCareer}`
              : 'Available after profile setup'
          }
          trend={
            profile.completed
              ? { value: 'Ready', isPositive: true }
              : undefined
          }
          className="animate-slideUp stagger-4"
        />
      </div>

      {/* 3. CURRENT FOCUS / ASSESSMENT (Large Card) */}
      <Card glass="elevated" sheen className="p-6 sm:p-7 border-white/80 animate-slideUp">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
                {assessment.hasActiveAttempt
                  ? 'Active Assessment'
                  : assessment.latestAttempt
                  ? 'Assessment Status'
                  : !onboarding.completed
                  ? 'Getting Started'
                  : 'Next Recommended Step'}
              </span>
              <span className="text-xs text-[#8E948F]">•</span>
              <Badge
                variant={
                  assessment.hasActiveAttempt
                    ? 'warning'
                    : assessment.latestAttempt
                    ? 'forest'
                    : 'default'
                }
                size="sm"
              >
                {assessment.hasActiveAttempt
                  ? 'In Progress'
                  : assessment.latestAttempt
                  ? assessment.latestAttempt.status
                  : !onboarding.completed
                  ? 'Profile Incomplete'
                  : 'Ready to Start'}
              </Badge>
            </div>

            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
              {assessment.hasActiveAttempt
                ? 'Diagnostic Skill Assessment In Progress'
                : assessment.latestAttempt
                ? 'Diagnostic Skill Assessment Evaluated'
                : !onboarding.completed
                ? 'Complete Your Student Onboarding'
                : 'Take Your Diagnostic Skill Assessment'}
            </h2>

            <p className="text-xs sm:text-sm text-[#626763]">
              {assessment.hasActiveAttempt
                ? 'You have an active assessment session in progress. Submit your answers to reveal your competency gaps and roadmap.'
                : assessment.latestAttempt
                ? 'Your skill assessment has been recorded. Review your competency levels and explore your personalized roadmap.'
                : !onboarding.completed
                ? 'Complete your profile with your education, college, and target career to generate intelligent skill recommendations.'
                : `Evaluate your current skill proficiency in ${
                    profile.targetCareer || 'your chosen field'
                  } to benchmark your competencies against industry standards.`}
            </p>

            {assessment.latestAttempt && (
              <div className="pt-1 text-xs text-[#626763] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                {assessment.latestAttempt.submittedAt
                  ? `Submitted: ${new Date(assessment.latestAttempt.submittedAt).toLocaleString()}`
                  : `Started: ${new Date(assessment.latestAttempt.startedAt).toLocaleString()}`}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0">
            {assessment.hasActiveAttempt ? (
              <Link to={ROUTES.ASSESSMENT}>
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Resume Assessment →
                </Button>
              </Link>
            ) : assessment.latestAttempt ? (
              <div className="flex items-center gap-2.5">
                <Link to={ROUTES.SKILL_GAP}>
                  <Button variant="outline" size="sm">
                    Skill Gap Matrix
                  </Button>
                </Link>
                <Link to={ROUTES.ASSESSMENT_RESULTS}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View Results →
                  </Button>
                </Link>
              </div>
            ) : !onboarding.completed ? (
              <Link to={ROUTES.ONBOARDING}>
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Complete Onboarding →
                </Button>
              </Link>
            ) : (
              <Link to={ROUTES.ASSESSMENT}>
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Assessment →
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* 4. TWO-COLUMN: SKILL OVERVIEW & RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left: Skill Snapshot */}
        <div className="lg:col-span-6 space-y-4">
          <Card glass="interactive" className="p-6 border-white/80 h-full flex flex-col justify-between animate-slideUp stagger-1">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#171918]">Your Skill Snapshot</h3>
                  <p className="text-xs text-[#626763] mt-0.5">Evaluated proficiency across core competencies</p>
                </div>
                <Link to={ROUTES.SKILLS} className="text-xs font-semibold text-[#1F6B4F] hover:underline">
                  View skills catalog →
                </Link>
              </div>

              <div className="py-6">
                <EmptyState
                  title={assessment.latestAttempt ? 'Skill Data Recorded' : 'No Assessment Taken'}
                  description={
                    assessment.latestAttempt
                      ? 'Your skills have been evaluated. Open the Skill Gap Matrix to review detailed proficiency breakdowns.'
                      : 'Take your diagnostic skill assessment to evaluate your proficiency across core competencies.'
                  }
                  actionLabel={assessment.latestAttempt ? 'View Skill Gap Matrix' : 'Take Skill Assessment'}
                  onAction={() => navigate(assessment.latestAttempt ? ROUTES.SKILL_GAP : ROUTES.ASSESSMENT)}
                />
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#E5E5DF]/70 flex items-center justify-between text-xs">
              <span className="text-[#626763]">Target Career Focus:</span>
              <span className="font-semibold text-[#1F6B4F] bg-[#D8E8DE]/80 px-2.5 py-0.5 rounded-full border border-[#C2D8C9]">
                {profile.targetCareer || 'General Track'}
              </span>
            </div>
          </Card>
        </div>

        {/* Right: Personalized Recommendations */}
        <div className="lg:col-span-6 space-y-4">
          <Card glass="interactive" className="p-6 border-white/80 h-full flex flex-col justify-between animate-slideUp stagger-2">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#171918]">Recommended for you</h3>
                  <p className="text-xs text-[#626763] mt-0.5">Tailored to your current skills and target role</p>
                </div>
                <Badge variant="forest" size="sm">Smart Track</Badge>
              </div>

              <div className="py-6">
                <EmptyState
                  title={onboarding.completed ? 'Recommendations In Preparation' : 'Profile Incomplete'}
                  description={
                    onboarding.completed
                      ? 'Personalized learning recommendations will populate as you progress through your roadmap milestones.'
                      : 'Complete your onboarding profile to allow the AI engine to curate personalized learning recommendations.'
                  }
                  actionLabel={onboarding.completed ? 'Explore Roadmap' : 'Complete Onboarding'}
                  onAction={() => navigate(onboarding.completed ? ROUTES.ROADMAP : ROUTES.ONBOARDING)}
                />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E5E5DF]/70">
              <Link to={ROUTES.ROADMAP}>
                <Button variant="outline" size="sm" className="w-full">
                  View Full Learning Path →
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. ACTIVE LEARNING ROADMAP PREVIEW */}
      <Card glass="interactive" className="p-6 border-white/80 animate-slideUp stagger-3">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E5DF]/70">
          <div>
            <h3 className="font-heading text-base font-bold text-[#171918]">Your Learning Roadmap Stages</h3>
            <p className="text-xs text-[#626763] mt-0.5">
              {profile.targetCareer
                ? `${profile.targetCareer} preparation track`
                : 'Personalized preparation track'}
            </p>
          </div>
          <Link to={ROUTES.ROADMAP}>
            <Button variant="outline" size="sm">
              Open Interactive Roadmap →
            </Button>
          </Link>
        </div>

        <div className="py-8">
          <EmptyState
            title={profile.completed ? 'Roadmap Ready to Explore' : 'Set Your Target Career'}
            description={
              profile.completed
                ? `Explore the interactive roadmap milestones curated for ${
                    profile.targetCareer || 'your career path'
                  }.`
                : 'Complete onboarding to initialize your custom learning stages and skill modules.'
            }
            actionLabel={profile.completed ? 'Open Interactive Roadmap' : 'Go to Onboarding'}
            onAction={() => navigate(profile.completed ? ROUTES.ROADMAP : ROUTES.ONBOARDING)}
          />
        </div>
      </Card>
    </div>
  )
}
