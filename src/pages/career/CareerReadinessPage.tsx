import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { profileApi } from '@/api/endpoints/profile.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { UserStats } from '@/types/user.types'
import { Skill } from '@/types/skill.types'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { ShieldCheck, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const CareerReadinessPage: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    const loadCareerData = async () => {
      setIsLoading(true)
      try {
        const [statsRes, skillsRes] = await Promise.allSettled([
          profileApi.getUserStats(),
          skillsApi.getSkills(),
        ])

        if (!isMounted) return
        if (statsRes.status === 'fulfilled') setStats(statsRes.value)
        if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value || [])
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
  }, [])

  if (isLoading) {
    return <LoadingState message="Evaluating career readiness index..." minHeight="min-h-[350px]" />
  }

  const readinessScore = stats?.careerReadiness ?? 0
  const targetRole = user?.careerGoal || DEFAULT_CAREER_GOAL

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
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">Overall Readiness Score</h2>
            <p className="text-xs sm:text-sm text-[#626763] max-w-md leading-relaxed">
              Synthesized from diagnostic skill evaluations, practical project completions, and validated milestone progress.
            </p>
          </div>
          <ProgressRing value={readinessScore} label="Ready" variant="forest" size={130} />
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6 bg-white border-[#E5E5DF]">
        <h3 className="font-heading text-base font-bold text-[#171918] mb-4">
          Readiness Breakdown by Core Competency
        </h3>

        {skills.length > 0 ? (
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.id || skill.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#171918]">{skill.name}</span>
                  <span className="font-bold text-[#1F6B4F]">{skill.progress}%</span>
                </div>
                <ProgressBar
                  value={skill.progress}
                  variant={skill.progress >= 75 ? 'forest' : skill.progress >= 50 ? 'primary' : 'warning'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#626763] space-y-3">
            <Target className="w-10 h-10 text-[#1F6B4F] mx-auto opacity-75" />
            <p>No verified skill scores recorded yet. Complete diagnostic assessments to compute your readiness profile.</p>
            <Link to={ROUTES.ASSESSMENT}>
              <Button variant="primary" size="sm">
                Take Initial Assessment
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
