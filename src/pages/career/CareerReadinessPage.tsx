import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MOCK_USER_STATS } from '@/mocks/user.mock'
import { ROUTES } from '@/constants/routes'
import { ShieldCheck } from 'lucide-react'

export const CareerReadinessPage: React.FC = () => {
  const stats = MOCK_USER_STATS

  const categories = [
    { name: 'Core Computer Science & Data Structures', score: 85 },
    { name: 'Full-Stack Architecture & API Design', score: 80 },
    { name: 'AI Integration & Vector Systems', score: 55 },
    { name: 'DevOps, Containers & Cloud Reliability', score: 50 },
    { name: 'System Design & Distributed Patterns', score: 60 },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
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
              Role Benchmark: Full-Stack AI Engineer
            </div>
            <h2 className="text-2xl font-bold text-white">Overall Readiness Score</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              Based on your assessments, completed projects, and demonstrated milestone mastery.
            </p>
          </div>
          <ProgressRing value={stats.careerReadiness} label="Ready" variant="cyan" size={130} />
        </div>
      </Card>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-white mb-4">Readiness Breakdown by Engineering Pillar</h3>
        <div className="space-y-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-300">{cat.name}</span>
                <span className="font-bold text-indigo-400">{cat.score}%</span>
              </div>
              <ProgressBar
                value={cat.score}
                variant={cat.score >= 75 ? 'success' : cat.score >= 60 ? 'primary' : 'warning'}
                size="sm"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
