import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { analyticsService } from '@/services/analyticsService'
import { AdminDashboardMetric, AdminActivityItem } from '@/data/admin/demo.admin.dashboard'
import {
  Users,
  UserCheck,
  ClipboardCheck,
  GraduationCap,
  ArrowUpRight,
  TrendingUp,
  PlusCircle,
  BrainCircuit,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react'

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetric[]>([])
  const [activity, setActivity] = useState<AdminActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [m, a] = await Promise.all([
          analyticsService.getDashboardMetrics(),
          analyticsService.getRecentActivity(),
        ])
        setMetrics(m)
        setActivity(a)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading platform overview..." minHeight="min-h-[400px]" />
  }

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'metric-total-students':
        return <Users className="w-5 h-5 text-[#1F6B4F]" />
      case 'metric-active-learners':
        return <UserCheck className="w-5 h-5 text-[#1F6B4F]" />
      case 'metric-assessments-completed':
        return <ClipboardCheck className="w-5 h-5 text-[#1F6B4F]" />
      case 'metric-courses-completed':
        return <GraduationCap className="w-5 h-5 text-[#1F6B4F]" />
      default:
        return <TrendingUp className="w-5 h-5 text-[#1F6B4F]" />
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Dashboard Top Header */}
      <PageHeader
        title="Good morning, Admin"
        subtitle="Here's what's happening across SkillPath."
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B4F] mr-1.5" />
            Live Platform Stats
          </Badge>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link to={ROUTES.ADMIN_STUDENTS}>
              <Button variant="outline" size="sm">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                Manage Students
              </Button>
            </Link>
            <Link to={ROUTES.ADMIN_ASSESSMENTS}>
              <Button variant="primary" size="sm">
                <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                New Assessment
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric) => (
          <Card key={metric.id} className="p-5 bg-white border-[#E5E5DF] hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] flex items-center justify-center">
                {getMetricIcon(metric.id)}
              </div>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {metric.change}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-[#626763]">{metric.label}</p>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] mt-1 tracking-tight">
                {metric.value}
              </h3>
              <p className="text-[11px] text-[#8E948F] mt-1.5">{metric.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Operational Quick Actions & Recent Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 bg-white border-[#E5E5DF]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E5DF]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1F6B4F]" />
                <h3 className="font-heading text-base font-semibold text-[#171918]">Real-Time Learner Activity</h3>
              </div>
              <Badge variant="outline" size="sm" className="text-[10px] text-[#626763]">
                Automated Event Stream
              </Badge>
            </div>

            <div className="divide-y divide-[#E5E5DF] mt-1">
              {activity.map((item) => (
                <div key={item.id} className="py-4 first:pt-3 last:pb-0 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#171918]">{item.title}</p>
                    <p className="text-xs text-[#626763]">{item.details}</p>
                  </div>
                  <span className="text-[11px] text-[#8E948F] shrink-0 font-medium">{item.timestamp}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E5DF] text-center">
              <Link
                to={ROUTES.ADMIN_ANALYTICS}
                className="text-xs font-semibold text-[#1F6B4F] hover:underline inline-flex items-center gap-1.5"
              >
                <span>View Complete Performance Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Col: Admin Navigation Shortcuts */}
        <div className="space-y-4">
          <Card className="p-6 bg-white border-[#E5E5DF]">
            <h3 className="font-heading text-base font-semibold text-[#171918] mb-4">Quick Management</h3>

            <div className="space-y-2.5">
              <Link
                to={ROUTES.ADMIN_STUDENTS}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5DF] hover:bg-[#F8F7F3] hover:border-[#1F6B4F]/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#171918]">Student Registry</p>
                    <p className="text-[11px] text-[#626763]">Search, view & inspect profiles</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8E948F] group-hover:text-[#171918] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to={ROUTES.ADMIN_SKILLS}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5DF] hover:bg-[#F8F7F3] hover:border-[#1F6B4F]/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white transition-colors">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#171918]">Skill Taxonomy</p>
                    <p className="text-[11px] text-[#626763]">Manage 8 verified skills</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8E948F] group-hover:text-[#171918] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to={ROUTES.ADMIN_RESOURCES}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5DF] hover:bg-[#F8F7F3] hover:border-[#1F6B4F]/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#171918]">Curated Resources</p>
                    <p className="text-[11px] text-[#626763]">Courses, quizzes & labs</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8E948F] group-hover:text-[#171918] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </Card>

          {/* Hackathon Prototype Info Callout */}
          <div className="p-4 rounded-xl border border-[#D8E8DE] bg-[#D8E8DE]/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1F6B4F]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Frontend Demo Architecture</span>
            </div>
            <p className="text-[11px] text-[#626763] leading-relaxed">
              All management operations update reactive local stores. When backend APIs are deployed, swapping the service layer connects live databases instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
