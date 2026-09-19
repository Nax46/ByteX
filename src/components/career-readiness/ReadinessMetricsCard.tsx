import React from 'react'
import { StatCard } from '@/components/ui/StatCard'
import { ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react'

interface ReadinessMetricsCardProps {
  readinessScore: number
  totalRequired: number
  metCount: number
  developingCount: number
  needsWorkCount: number
}

export const ReadinessMetricsCard: React.FC<ReadinessMetricsCardProps> = ({
  readinessScore,
  totalRequired,
  metCount,
  developingCount,
  needsWorkCount,
}) => {
  const metPercentage = totalRequired > 0 ? Math.round((metCount / totalRequired) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Readiness Index"
        value={`${readinessScore}%`}
        subtitle="Current pathway readiness"
        icon={<ShieldCheck className="w-4 h-4 text-[#1F6B4F]" />}
        trend={{ value: 'Target: 85%+', isPositive: true }}
      />

      <StatCard
        title="Skills Target Met"
        value={`${metCount} / ${totalRequired}`}
        subtitle={`${metPercentage}% of required skills met`}
        icon={<CheckCircle2 className="w-4 h-4 text-[#1F6B4F]" />}
      />

      <StatCard
        title="Developing Skills"
        value={`${developingCount} Skills`}
        subtitle="Partially proficient"
        icon={<TrendingUp className="w-4 h-4 text-[#D97706]" />}
      />

      <StatCard
        title="Needs Work"
        value={`${needsWorkCount} Skills`}
        subtitle="Primary gap areas"
        icon={<AlertTriangle className="w-4 h-4 text-[#DC2626]" />}
      />
    </div>
  )
}
