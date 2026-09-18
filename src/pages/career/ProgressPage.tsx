import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import { Clock, BookCheck, ClipboardCheck, TrendingUp } from 'lucide-react'

export const ProgressPage: React.FC = () => {
  // Weekly hours data for minimal clean bar chart
  const weeklyActivity = [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4.0 },
    { day: 'Fri', hours: 3.5 },
    { day: 'Sat', hours: 5.0 },
    { day: 'Sun', hours: 2.0 },
  ]
  const maxHours = 5.0

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Your Progress"
        subtitle="Track your study hours, assessment performance, and competency gains over time."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Progress' },
        ]}
      />

      {/* 4 Core Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Learning Hours"
          value="46 hrs"
          subtitle="This semester"
          icon={<Clock className="w-4 h-4" />}
          trend={{ value: '+8 hrs this week', isPositive: true }}
        />
        <StatCard
          title="Courses Completed"
          value="2"
          subtitle="HTML/CSS & JS Core"
          icon={<BookCheck className="w-4 h-4" />}
        />
        <StatCard
          title="Assessments Passed"
          value="4"
          subtitle="Avg score: 76%"
          icon={<ClipboardCheck className="w-4 h-4" />}
        />
        <StatCard
          title="Skills Improved"
          value="8"
          subtitle="Across 3 domains"
          icon={<TrendingUp className="w-4 h-4" />}
          trend={{ value: '+2 this month', isPositive: true }}
        />
      </div>

      {/* Charts Section: Minimal, Clean, Readable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-7">
          <Card className="p-6 border-[#E5E5DF] bg-white space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E5E5DF]">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#171918]">Weekly Learning Activity</h3>
                  <p className="text-xs text-[#626763]">Hours dedicated per day (Past 7 days)</p>
                </div>
                <Badge variant="forest" size="sm">21.5 hrs Total</Badge>
              </div>

              {/* Minimal SVG Bar Chart */}
              <div className="pt-6 pb-2">
                <div className="flex items-end justify-between gap-3 h-44 px-2">
                  {weeklyActivity.map((d) => {
                    const heightPercent = (d.hours / maxHours) * 100
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[11px] font-semibold text-[#1F6B4F] opacity-0 group-hover:opacity-100 transition-opacity">
                          {d.hours}h
                        </span>
                        <div className="w-full bg-[#F8F7F3] rounded-t-md h-32 flex items-end">
                          <div
                            className="w-full bg-[#1F6B4F] rounded-t-md transition-all duration-500 group-hover:bg-[#17543E]"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#626763]">{d.day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5DF] text-xs text-[#626763] flex justify-between items-center">
              <span>Goal: 15 hrs / week</span>
              <span className="text-[#1F6B4F] font-semibold">143% of weekly target reached</span>
            </div>
          </Card>
        </div>

        {/* Skill Growth Snapshot */}
        <div className="lg:col-span-5">
          <Card className="p-6 border-[#E5E5DF] bg-white space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E5E5DF]">
                <div>
                  <h3 className="font-heading text-base font-bold text-[#171918]">Skill Growth Trajectory</h3>
                  <p className="text-xs text-[#626763]">Progress delta over 60 days</p>
                </div>
                <span className="text-xs font-semibold text-[#1F6B4F] bg-[#D8E8DE] px-2 py-0.5 rounded">
                  +18% Overall
                </span>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-[#171918]">
                    <span>HTML & CSS</span>
                    <span className="text-[#1F6B4F] font-semibold">65% → 85% (+20%)</span>
                  </div>
                  <ProgressBar value={85} size="sm" variant="forest" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-[#171918]">
                    <span>JavaScript</span>
                    <span className="text-[#1F6B4F] font-semibold">50% → 78% (+28%)</span>
                  </div>
                  <ProgressBar value={78} size="sm" variant="forest" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-[#171918]">
                    <span>Problem Solving</span>
                    <span className="text-[#1F6B4F] font-semibold">45% → 66% (+21%)</span>
                  </div>
                  <ProgressBar value={66} size="sm" variant="forest" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-[#171918]">
                    <span>React (In Progress)</span>
                    <span className="text-[#E7A84B] font-semibold">20% → 54% (+34%)</span>
                  </div>
                  <ProgressBar value={54} size="sm" variant="amber" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E5DF] text-xs text-[#626763]">
              Next milestone evaluation scheduled in 7 days.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
