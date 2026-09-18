import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { skillsApi, ISkillGapPriorityReadout } from '@/api/endpoints/skills.api'
import { ROUTES } from '@/constants/routes'
import { ShieldCheck } from 'lucide-react'

export const CareerReadinessPage: React.FC = () => {
  const [readout, setReadout] = useState<ISkillGapPriorityReadout | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    skillsApi.getSkillGapPriority()
      .then((data) => setReadout(data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <LoadingState message="Calculating real-time career readiness index..." minHeight="min-h-[350px]" />
  }

  const readinessScore = readout?.overallReadinessScore ?? 0
  const targetRole = readout?.targetCareerTitle || 'Full Stack Web Developer'
  const snapshots = readout?.snapshots || []

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Career Readiness Index"
        subtitle="Quantitative evaluation of your technical capabilities mapped against real hiring rubrics."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Career Readiness' },
        ]}
      />

      {/* Main Readiness Score Banner */}
      <Card className="p-6 sm:p-8 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role Benchmark: {targetRole}
            </div>
            <h2 className="text-2xl font-bold text-white">Overall Readiness Score</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              Calculated deterministically from your latest assessment evidence and target skill benchmarks.
            </p>
          </div>
          <ProgressRing value={readinessScore} label="Ready" variant="cyan" size={130} />
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-white mb-4">Readiness Breakdown by Evaluated Skill</h3>
        <div className="space-y-4">
          {snapshots.length === 0 ? (
            <p className="text-xs text-slate-400">No skill evaluations available. Take an assessment to compute readiness.</p>
          ) : (
            snapshots.map((s) => (
              <div key={s.skillId} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">{s.skillName} ({s.category})</span>
                  <span className="font-bold text-indigo-400">{s.currentLevel}% / {s.targetLevel}%</span>
                </div>
                <ProgressBar
                  value={s.currentLevel}
                  variant={s.currentLevel >= s.targetLevel ? 'success' : s.currentLevel >= 50 ? 'primary' : 'warning'}
                  size="sm"
                />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
