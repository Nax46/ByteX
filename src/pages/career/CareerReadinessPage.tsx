import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { profileApi } from '@/api/endpoints/profile.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { aiApi } from '@/api/endpoints/ai.api'
import { ISkillGapPrioritySnapshot } from '@/types/skill.types'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { ShieldCheck, Target, Sparkles, ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const CareerReadinessPage: React.FC = () => {
  const { user } = useAuth()
  const [snapshots, setSnapshots] = useState<ISkillGapPrioritySnapshot[]>([])
  const [targetRole, setTargetRole] = useState<string>(user?.careerGoal || DEFAULT_CAREER_GOAL)
  const [aiHeadline, setAiHeadline] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const loadCareerData = async () => {
      setIsLoading(true)
      try {
        const [profileRes, gapPriorityRes, aiSummaryRes] = await Promise.allSettled([
          profileApi.getProfile(),
          skillsApi.getSkillGapPriority(),
          aiApi.getPersonalizedSummary(),
        ])

        if (!isMounted) return

        if (profileRes.status === 'fulfilled' && profileRes.value?.targetCareer) {
          setTargetRole(profileRes.value.targetCareer)
        }

        if (gapPriorityRes.status === 'fulfilled' && gapPriorityRes.value?.snapshots) {
          setSnapshots(gapPriorityRes.value.snapshots)
        }

        if (aiSummaryRes.status === 'fulfilled' && aiSummaryRes.value?.personalizedSummary?.headline) {
          setAiHeadline(aiSummaryRes.value.personalizedSummary.headline)
        }
      } catch (err) {
        console.error('Failed to load career readiness data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadCareerData()
    return () => {
      isMounted = false
    }
  }, [user?.careerGoal])

  if (isLoading) {
    return <LoadingState message="Evaluating career readiness index..." minHeight="min-h-[350px]" />
  }

  // Calculate live readiness score from deterministic skill gaps
  let readinessScore = 0
  if (snapshots.length > 0) {
    const totalRatio = snapshots.reduce((acc, s) => {
      const cur = s.currentLevel ?? 0
      const target = s.targetLevel || 100
      return acc + Math.min(100, Math.round((cur / target) * 100))
    }, 0)
    readinessScore = Math.round(totalRatio / snapshots.length)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Career Readiness Index"
        subtitle="Quantitative evaluation of your technical capabilities mapped against real industry hiring rubrics."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Career Readiness' },
        ]}
      />

      {/* Main Readiness Score Banner */}
      <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[#1F6B4F] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role Benchmark: {targetRole}
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              {aiHeadline || 'Overall Career Readiness'}
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] max-w-md leading-relaxed">
              Synthesized from diagnostic skill evaluations, practical project completions, and verified milestone progress against {targetRole} standards.
            </p>
          </div>
          <ProgressRing value={readinessScore} label="Ready" variant="forest" size={130} />
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6 bg-white border-[#E5E5DF]">
        <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-[#E5E5DF]">
          <div>
            <h3 className="font-heading text-base font-bold text-[#171918]">
              Readiness Breakdown by Core Competency
            </h3>
            <p className="text-xs text-[#626763] mt-0.5">
              Target requirements defined by industry syllabus rubrics for {targetRole}.
            </p>
          </div>

          <Link to={ROUTES.ROADMAP}>
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Active Roadmap
            </Button>
          </Link>
        </div>

        {snapshots.length > 0 ? (
          <div className="space-y-5">
            {snapshots.map((snap) => {
              const cur = snap.currentLevel ?? 0
              const target = snap.targetLevel || 100
              const pct = Math.min(100, Math.round((cur / target) * 100))
              const isTargetMet = cur >= target || snap.gap <= 0

              return (
                <div key={snap.skillId || snap.skillSlug} className="space-y-2 p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DF]/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#171918]">{snap.skillName || snap.skillSlug}</span>
                      <Badge
                        variant={snap.importance === 'CRITICAL' ? 'danger' : snap.importance === 'HIGH' ? 'warning' : 'outline'}
                        size="sm"
                        className="text-[10px]"
                      >
                        {snap.importance}
                      </Badge>
                      {isTargetMet && (
                        <Badge variant="forest" size="sm" className="text-[10px]">
                          Target Met
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#626763]">
                      <span>Level: <strong className="text-[#171918]">{cur}%</strong> / {target}%</span>
                      <span className="text-[#1F6B4F] font-bold">({pct}% aligned)</span>
                    </div>
                  </div>

                  <ProgressBar
                    value={pct}
                    variant={pct >= 80 ? 'forest' : pct >= 50 ? 'primary' : 'warning'}
                    size="sm"
                  />

                  {snap.priority?.explanation && (
                    <p className="text-[11px] text-[#626763] leading-relaxed pt-0.5">
                      {snap.priority.explanation}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#626763] space-y-3">
            <Target className="w-10 h-10 text-[#1F6B4F] mx-auto opacity-75" />
            <p>No verified skill scores recorded yet. Complete diagnostic assessments to compute your readiness profile.</p>
            <Link to={ROUTES.ASSESSMENT}>
              <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Take Initial Assessment
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#626763]">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" />
            Benchmarks continuously recalibrated upon assessment submissions
          </span>
          <Link to={ROUTES.CAREERS}>
            <Button variant="outline" size="sm">
              Explore Other Career Paths →
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
