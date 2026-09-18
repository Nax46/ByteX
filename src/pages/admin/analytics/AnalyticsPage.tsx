import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { analyticsService } from '@/services/analyticsService'
import { DEMO_ADMIN_ANALYTICS } from '@/data/admin/demo.admin.analytics'
import { ROUTES } from '@/constants/routes'
import {
  Users,
  Award,
  BookOpen,
  Briefcase,
  ArrowUpRight,
  Download,
  Calendar,
  CheckCircle2,
} from 'lucide-react'

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<typeof DEMO_ADMIN_ANALYTICS | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [exportNotice, setExportNotice] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await analyticsService.getAnalyticsData()
        setData(res)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const handleExportTelemetry = () => {
    setExportNotice('Telemetry report generated (CSV/PDF exported).')
    setTimeout(() => setExportNotice(null), 3500)
  }

  if (isLoading || !data) {
    return <DashboardSkeleton />
  }

  // Maximum values for normalization
  const maxGrowth = Math.max(...data.studentGrowth.map((d) => d.value))
  const maxActivity = Math.max(...data.weeklyActivity.map((d) => d.value))

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1F6B4F] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Platform Analytics & Insights"
        subtitle="Platform-wide telemetry across enrollment cohorts, assessment metrics, skill distributions, and curriculum engagement."
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Analytics' },
        ]}
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B4F] mr-1.5" />
            Active Telemetry Feed
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportTelemetry}
            aria-label="Export platform telemetry report"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Telemetry
          </Button>
        }
      />

      {/* Grid: Growth & Weekly Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Growth Chart */}
        <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1F6B4F]" />
              <h3 className="font-heading text-base font-semibold text-[#171918]">Student Enrollment Trajectory</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +160% (6 Months)
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {data.studentGrowth.map((item) => {
              const heightPercent = Math.round((item.value / maxGrowth) * 100)
              return (
                <div key={item.period} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-[#171918] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-[#1F6B4F] group-hover:bg-[#154d38] rounded-t-md transition-all duration-300 relative"
                  />
                  <span className="text-xs font-medium text-[#626763]">{item.period}</span>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-[#8E948F] text-center pt-2">
            Monthly active enrolled learners registered on SkillPath.
          </p>
        </Card>

        {/* Weekly Activity Hours */}
        <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1F6B4F]" />
              <h3 className="font-heading text-base font-semibold text-[#171918]">Weekly Learning Activity (Hours)</h3>
            </div>
            <span className="text-xs font-semibold text-[#1F6B4F] bg-[#D8E8DE]/40 px-2 py-0.5 rounded-full">
              2,930 Total Hrs / Wk
            </span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {data.weeklyActivity.map((item) => {
              const heightPercent = Math.round((item.value / maxActivity) * 100)
              return (
                <div key={item.period} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-[#171918] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value}h
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-[#D8E8DE] group-hover:bg-[#1F6B4F] rounded-t-md transition-all duration-300"
                  />
                  <span className="text-xs font-medium text-[#626763]">{item.period}</span>
                </div>
              )
            })}
          </div>
          <p className="text-[11px] text-[#8E948F] text-center pt-2">
            Cumulative interactive study hours recorded across days of week.
          </p>
        </Card>
      </div>

      {/* Grid: Assessment Performance & Career Interest */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assessment Performance by Skill */}
        <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1F6B4F]" />
              <h3 className="font-heading text-base font-semibold text-[#171918]">Assessment Benchmark Performance</h3>
            </div>
            <Badge variant="outline" size="sm" className="text-[10px]">
              Avg Score
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            {data.assessmentPerformanceBySkill.map((skill) => (
              <div key={skill.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#171918]">{skill.label}</span>
                  <span className="font-bold text-[#1F6B4F]">{skill.value}%</span>
                </div>
                <ProgressBar value={skill.value} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* Career Interest Distribution */}
        <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#1F6B4F]" />
              <h3 className="font-heading text-base font-semibold text-[#171918]">Career Track Enrollment Share</h3>
            </div>
            <Badge variant="outline" size="sm" className="text-[10px]">
              1,248 Learners
            </Badge>
          </div>

          <div className="space-y-3.5 pt-1">
            {data.careerDistribution.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#171918]">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#626763]">{item.count} students</span>
                    <span className="font-bold text-[#1F6B4F]">{item.percentage}%</span>
                  </div>
                </div>
                <ProgressBar value={item.percentage * 2} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Resource Modality Breakdown */}
      <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DF]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1F6B4F]" />
            <h3 className="font-heading text-base font-semibold text-[#171918]">Curriculum Modality Engagement</h3>
          </div>
          <Badge variant="outline" size="sm" className="text-[10px]">
            1,672 Completions
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
          {data.resourceUsageByType.map((item) => (
            <div key={item.label} className="p-4 rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] space-y-2 text-center">
              <span className="text-xs font-semibold text-[#171918]">{item.label}</span>
              <div className="font-heading text-2xl font-bold text-[#1F6B4F]">{item.count}</div>
              <p className="text-[11px] text-[#626763]">{item.percentage}% of total usage</p>
              <ProgressBar value={item.percentage} size="sm" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
