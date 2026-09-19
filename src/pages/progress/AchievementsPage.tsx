import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { achievementsApi } from '@/api/endpoints/achievements.api'
import { Achievement, AchievementSummary, AchievementStatus, AchievementCategory } from '@/types/achievement.types'
import { Award, Zap, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'

// Import Achievement Subcomponents
import { AchievementOverviewHeader } from '@/components/achievements/AchievementOverviewHeader'
import { AchievementCard } from '@/components/achievements/AchievementCard'
import { AchievementFilters } from '@/components/achievements/AchievementFilters'
import { AchievementDetailModal } from '@/components/achievements/AchievementDetailModal'

export const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [summary, setSummary] = useState<AchievementSummary | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<'ALL' | AchievementStatus>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | AchievementCategory>('ALL')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  const fetchAchievementsData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [listRes, summaryRes] = await Promise.all([
        achievementsApi.getAchievements(),
        achievementsApi.getSummary(),
      ])
      setAchievements(listRes || [])
      setSummary(summaryRes)
    } catch (err) {
      console.error('Failed to load achievements data:', err)
      setError('Unable to fetch career achievements. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAchievementsData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Evaluating your evidence-based achievements..." minHeight="min-h-[400px]" />
  }

  const filteredAchievements = achievements.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter
    return matchesStatus && matchesCategory
  })

  const defaultSummary: AchievementSummary = summary || {
    totalUnlocked: achievements.filter((a) => a.status === 'UNLOCKED').length,
    totalInProgress: achievements.filter((a) => a.status === 'IN_PROGRESS').length,
    totalLocked: achievements.filter((a) => a.status === 'LOCKED').length,
    totalAchievements: achievements.length,
    unlockedByCategory: {
      SKILL: 0,
      CHALLENGE: 0,
      PROJECT: 0,
      ASSESSMENT: 0,
      ROADMAP: 0,
      CAREER: 0,
    },
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Skill & Career Achievements"
        subtitle="Verified career accomplishments earned through proctored diagnostic tests, practical drills, project builds, and milestone progress."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Career Mission', href: ROUTES.CAREER_MISSION },
          { label: 'Achievements' },
        ]}
      />

      {/* 2. ERROR STATE HANDLER */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200 text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAchievementsData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </Card>
      )}

      {/* 3. OVERVIEW HEADER */}
      <AchievementOverviewHeader summary={defaultSummary} />

      {/* 4. FILTERS BAR */}
      <AchievementFilters
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* 5. ACHIEVEMENTS GRID */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onSelect={setSelectedAchievement}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 bg-white border-[#E5E5DF] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D8E8DE]/70 text-[#1F6B4F] flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-[#171918]">
            No Achievements Match Selected Filters
          </h3>
          <p className="text-xs sm:text-sm text-[#626763] max-w-md mx-auto">
            Try adjusting your status or category filters to view your other evidence-backed achievements.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter('ALL')
              setCategoryFilter('ALL')
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}

      {/* 6. BOTTOM ACTION FOOTER */}
      <Card className="p-6 bg-white border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#D8E8DE] text-[#1F6B4F]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#171918]">Ready to unlock your next career milestone?</h4>
            <p className="text-xs text-[#626763]">Execute today's high-impact action to advance your skill evidence.</p>
          </div>
        </div>
        <Link to={ROUTES.TODAY}>
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Today's Action →
          </Button>
        </Link>
      </Card>

      {/* 7. ACHIEVEMENT DETAIL MODAL */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  )
}

export default AchievementsPage
