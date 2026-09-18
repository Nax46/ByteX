import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { ROUTES } from '@/constants/routes'
import { Database, Bell } from 'lucide-react'

export const SettingsPage: React.FC = () => {

  return (
    <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage your learning notifications, study preferences, and runtime modes."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Settings' },
        ]}
      />

      {/* Integration & Backend Environment */}
      <Card className="p-6 sm:p-7 bg-white border-[#E5E5DF]">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5DF]">
          <div className="w-9 h-9 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-[#171918]">API Server Connection</h3>
            <p className="text-xs text-[#626763]">Backend REST API and real-time synchronization</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium text-[#171918]">
              Current Target:{' '}
              <span className="text-[#1F6B4F] font-bold">
                {import.meta.env.VITE_API_BASE_URL || '/api (Same origin / Proxy)'}
              </span>
            </p>
            <p className="text-xs text-[#626763] mt-1 max-w-md leading-relaxed">
              SkillPath communicates with your backend services via normalized JWT headers and standardized REST endpoints.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#D8E8DE]/50 border border-[#C2D8C9] text-xs font-semibold text-[#1F6B4F]">
            <span className="w-2 h-2 rounded-full bg-[#1F6B4F] animate-pulse" />
            Live Backend Connected
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 sm:p-7 bg-white border-[#E5E5DF]">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E5DF]">
          <div className="w-9 h-9 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-[#171918]">Learning Reminders</h3>
            <p className="text-xs text-[#626763]">Weekly progress digests and roadmap step notifications</p>
          </div>
        </div>

        <div className="pt-4 space-y-3.5 text-xs">
          <label className="flex items-center gap-3 text-[#171918] cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-[#E5E5DF] text-[#1F6B4F] focus:ring-[#1F6B4F] h-4 w-4"
            />
            <span>Receive weekly email summary of closed skill gaps and roadmap milestones</span>
          </label>
          <label className="flex items-center gap-3 text-[#171918] cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-[#E5E5DF] text-[#1F6B4F] focus:ring-[#1F6B4F] h-4 w-4"
            />
            <span>Enable streak reminders when daily practice has not been completed</span>
          </label>
        </div>
      </Card>
    </div>
  )
}
