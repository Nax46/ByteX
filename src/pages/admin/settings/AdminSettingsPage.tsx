import React, { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { analyticsService } from '@/services/analyticsService'
import { ROUTES } from '@/constants/routes'
import {
  ShieldCheck,
  RotateCcw,
  Bell,
  Sun,
  Database,
  CheckCircle2,
} from 'lucide-react'

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth()

  // Profile Form
  const [adminName, setAdminName] = useState(user?.name || 'SkillPath Admin')
  const [adminEmail, setAdminEmail] = useState(user?.email || 'admin@skillpath.demo')
  const [profileSaved, setProfileSaved] = useState(false)

  // Notification Toggles
  const [notifyAssessment, setNotifyAssessment] = useState(true)
  const [notifyEnrollment, setNotifyEnrollment] = useState(true)
  const [notifyDigest, setNotifyDigest] = useState(false)

  // Reset Confirmation Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  const handleConfirmReset = async () => {
    setIsResetting(true)
    try {
      await analyticsService.resetAllDemoData()
      setResetSuccess(true)
      setIsResetModalOpen(false)
      setTimeout(() => setResetSuccess(false), 4000)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Admin Settings"
        subtitle="Manage administrative profile, notification triggers, appearance preferences, and demo data state."
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Settings' },
        ]}
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            Platform Configuration
          </Badge>
        }
      />

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Demo datasets have been successfully restored to their original platform states.</span>
        </div>
      )}

      {/* 1. Admin Profile */}
      <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5DF]">
          <ShieldCheck className="w-4 h-4 text-[#1F6B4F]" />
          <h3 className="font-heading text-base font-semibold text-[#171918]">Administrator Profile</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
          <Input
            id="admin-name"
            label="Display Name"
            size="sm"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="SkillPath Admin"
            required
          />

          <Input
            id="admin-email"
            label="Email Address"
            type="email"
            size="sm"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@skillpath.demo"
            required
          />

          <div className="flex items-center gap-3 pt-2">
            <Button variant="primary" size="sm" type="submit">
              Save Profile
            </Button>
            {profileSaved && (
              <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Profile updated
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* 2. Platform Notifications */}
      <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5DF]">
          <Bell className="w-4 h-4 text-[#1F6B4F]" />
          <h3 className="font-heading text-base font-semibold text-[#171918]">Administrative Alerts</h3>
        </div>

        <div className="space-y-3 max-w-lg">
          <label className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] cursor-pointer hover:bg-[#F3F2EC] transition-colors">
            <div>
              <p className="text-xs font-semibold text-[#171918]">Learner Assessment Completions</p>
              <p className="text-[11px] text-[#626763]">Receive notification when a student submits a graded benchmark test</p>
            </div>
            <input
              type="checkbox"
              checked={notifyAssessment}
              onChange={(e) => setNotifyAssessment(e.target.checked)}
              className="rounded border-[#E5E5DF] text-[#1F6B4F] focus:ring-[#1F6B4F] h-4 w-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] cursor-pointer hover:bg-[#F3F2EC] transition-colors">
            <div>
              <p className="text-xs font-semibold text-[#171918]">Cohort Track Enrollments</p>
              <p className="text-[11px] text-[#626763]">Instant alert when new students register for career roadmaps</p>
            </div>
            <input
              type="checkbox"
              checked={notifyEnrollment}
              onChange={(e) => setNotifyEnrollment(e.target.checked)}
              className="rounded border-[#E5E5DF] text-[#1F6B4F] focus:ring-[#1F6B4F] h-4 w-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] cursor-pointer hover:bg-[#F3F2EC] transition-colors">
            <div>
              <p className="text-xs font-semibold text-[#171918]">Weekly Executive Telemetry Digest</p>
              <p className="text-[11px] text-[#626763]">Summarized email digest of student progress and engagement</p>
            </div>
            <input
              type="checkbox"
              checked={notifyDigest}
              onChange={(e) => setNotifyDigest(e.target.checked)}
              className="rounded border-[#E5E5DF] text-[#1F6B4F] focus:ring-[#1F6B4F] h-4 w-4 cursor-pointer"
            />
          </label>
        </div>
      </Card>

      {/* 3. Appearance */}
      <Card className="p-6 bg-white border-[#E5E5DF] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5DF]">
          <Sun className="w-4 h-4 text-[#1F6B4F]" />
          <h3 className="font-heading text-base font-semibold text-[#171918]">Display & Theme</h3>
        </div>

        <div className="p-3.5 rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] flex items-center justify-between max-w-lg">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-[#171918]">Active Theme: SkillPath Warm Canvas</span>
            <p className="text-[11px] text-[#626763]">Engineered for educator readability and long-duration analytical workflows.</p>
          </div>
          <Badge variant="forest" size="sm">
            Default
          </Badge>
        </div>
      </Card>

      {/* 4. Demo Data Management & Reset */}
      <Card className="p-6 bg-white border-red-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5DF]">
          <Database className="w-4 h-4 text-red-600" />
          <h3 className="font-heading text-base font-semibold text-[#171918]">Demo Data Management</h3>
        </div>

        <p className="text-xs text-[#626763] max-w-xl leading-relaxed">
          During the frontend demo phase, edits and newly created records are stored in browser memory and local storage. You can restore all student rosters, assessments, skills, and roadmap datasets to their canonical starting state at any time.
        </p>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset Demo Data
          </Button>
        </div>
      </Card>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        isLoading={isResetting}
        variant="danger"
        title="Reset Platform Demo Data?"
        description="This action will restore all student rosters, assessments, competencies, and learning paths to their original Hackathon demo dataset. Any temporary changes will be replaced."
        confirmText="Confirm Reset"
        cancelText="Cancel"
      />
    </div>
  )
}
