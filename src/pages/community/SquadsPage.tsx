import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { squadsApi } from '@/api/endpoints/squads.api'
import { Squad, SquadRole, SquadTaskStatus } from '@/types/squad.types'
import { Users, Zap, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'

// Import Squad Subcomponents
import { SquadOverviewHeader } from '@/components/squads/SquadOverviewHeader'
import { SquadCard } from '@/components/squads/SquadCard'
import { SquadMemberList } from '@/components/squads/SquadMemberList'
import { SquadTaskList } from '@/components/squads/SquadTaskList'
import { SquadFilters } from '@/components/squads/SquadFilters'

export const SquadsPage: React.FC = () => {
  const [squads, setSquads] = useState<Squad[]>([])
  const [activeSquad, setActiveSquad] = useState<Squad | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<'MY_SQUAD' | 'ALL_SQUADS'>('MY_SQUAD')
  const [roleFilter, setRoleFilter] = useState<'ALL' | SquadRole>('ALL')

  const fetchSquadsData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await squadsApi.getSquads()
      setSquads(data || [])
      const active = data.find((s) => s.isUserMember) || data[0] || null
      setActiveSquad(active)
    } catch (err) {
      console.error('Failed to load squads:', err)
      setError('Unable to load Career Squads. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSquadsData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading your active Career Squad workspace..." minHeight="min-h-[400px]" />
  }

  const handleJoinRole = async (squadId: string, role: SquadRole) => {
    try {
      await squadsApi.joinSquad(squadId, role)
      const updated = squads.map((s) =>
        s.id === squadId
          ? { ...s, isUserMember: true, userRole: role }
          : { ...s, isUserMember: false }
      )
      setSquads(updated)
      const newActive = updated.find((s) => s.id === squadId) || null
      setActiveSquad(newActive)
      setViewMode('MY_SQUAD')
      setNotice(`Joined squad as ${role} Developer! Tasks & workspace updated.`)
      setTimeout(() => setNotice(null), 3500)
    } catch (err) {
      console.error('Failed to join squad:', err)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: SquadTaskStatus) => {
    try {
      await squadsApi.updateTaskStatus(taskId, status)
      if (activeSquad) {
        const updatedTasks = activeSquad.tasks.map((t) =>
          t.id === taskId ? { ...t, status, completedAt: status === 'COMPLETED' ? new Date().toISOString() : undefined } : t
        )
        const completedCount = updatedTasks.filter((t) => t.status === 'COMPLETED').length
        const progressPercent = Math.round((completedCount / (updatedTasks.length || 1)) * 100)

        const updatedSquad = {
          ...activeSquad,
          tasks: updatedTasks,
          progressPercent,
        }

        setActiveSquad(updatedSquad)
        setSquads(squads.map((s) => (s.id === activeSquad.id ? updatedSquad : s)))

        if (status === 'COMPLETED') {
          setNotice('Task completed! Verified evidence recorded in your Skill Evidence.')
          setTimeout(() => setNotice(null), 3500)
        }
      }
    } catch (err) {
      console.error('Failed to update task status:', err)
    }
  }

  const filteredSquads = squads.filter((s) => {
    if (roleFilter === 'ALL') return true
    return (
      s.userRole === roleFilter ||
      s.openRoles.some((r) => r.role === roleFilter) ||
      s.members.some((m) => m.role === roleFilter)
    )
  })

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Career Squads & Team Collaboration"
        subtitle="Work with peer engineering teams on production project builds while earning role-specific skill evidence."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Career Mission', href: ROUTES.CAREER_MISSION },
          { label: 'Squads' },
        ]}
      />

      {/* 2. NOTICE BAR */}
      {notice && (
        <div className="p-3.5 rounded-xl border border-[#1F6B4F]/30 bg-[#D8E8DE]/80 text-[#1F6B4F] text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1F6B4F]" />
          <span>{notice}</span>
        </div>
      )}

      {/* 3. ERROR STATE HANDLER */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200 text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSquadsData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </Card>
      )}

      {/* 4. OVERVIEW HEADER */}
      <SquadOverviewHeader activeSquad={activeSquad} />

      {/* 5. FILTERS BAR */}
      <SquadFilters
        viewMode={viewMode}
        roleFilter={roleFilter}
        onViewModeChange={setViewMode}
        onRoleChange={setRoleFilter}
      />

      {/* 6. MAIN CONTENT AREA */}
      {viewMode === 'MY_SQUAD' && activeSquad ? (
        <div className="space-y-7">
          {/* Active Teammates */}
          <SquadMemberList members={activeSquad.members} />

          {/* Project Task Checklist */}
          <SquadTaskList
            tasks={activeSquad.tasks}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        </div>
      ) : (
        /* Explore Squads Directory Grid */
        <div className="space-y-5">
          {filteredSquads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredSquads.map((squad) => (
                <SquadCard
                  key={squad.id}
                  squad={squad}
                  onJoinRole={handleJoinRole}
                  onSelectSquad={(s) => {
                    setActiveSquad(s)
                    setViewMode('MY_SQUAD')
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 bg-white border-[#E5E5DF] text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D8E8DE]/70 text-[#1F6B4F] flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#171918]">
                No Squads Found Matching Selected Role
              </h3>
              <p className="text-xs sm:text-sm text-[#626763] max-w-md mx-auto">
                Adjust your role filter or explore all available project squads.
              </p>
              <Button variant="outline" size="sm" onClick={() => setRoleFilter('ALL')}>
                Clear Filters
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* 7. BOTTOM ACTION FOOTER */}
      <Card className="p-6 bg-white border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#D8E8DE] text-[#1F6B4F]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#171918]">Need individual practice before joining team tasks?</h4>
            <p className="text-xs text-[#626763]">Execute today's action or complete practical drills to strengthen your skills.</p>
          </div>
        </div>
        <Link to={ROUTES.TODAY}>
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Today's Action →
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default SquadsPage
