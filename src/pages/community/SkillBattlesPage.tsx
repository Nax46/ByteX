import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { skillBattlesApi } from '@/api/endpoints/battles.api'
import { SkillBattle, BattleCategory, BattleEvaluationResult } from '@/types/battle.types'
import { Swords, Zap, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'

// Import Skill Battle Subcomponents
import { BattleOverviewHeader } from '@/components/skill-battles/BattleOverviewHeader'
import { BattleCard } from '@/components/skill-battles/BattleCard'
import { BattleWorkspaceModal } from '@/components/skill-battles/BattleWorkspaceModal'
import { BattleResultModal } from '@/components/skill-battles/BattleResultModal'
import { BattleFilters } from '@/components/skill-battles/BattleFilters'

export const SkillBattlesPage: React.FC = () => {
  const [battles, setBattles] = useState<SkillBattle[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'COMPLETED'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | BattleCategory>('ALL')

  const [activeWorkspaceBattle, setActiveWorkspaceBattle] = useState<SkillBattle | null>(null)
  const [selectedResultBattle, setSelectedResultBattle] = useState<SkillBattle | null>(null)
  const [lastEvaluationResult, setLastEvaluationResult] = useState<BattleEvaluationResult | null>(null)

  const fetchBattles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await skillBattlesApi.getBattles()
      setBattles(data || [])
    } catch (err) {
      console.error('Failed to fetch battles:', err)
      setError('Unable to load Skill Battles. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBattles()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading practical Skill Battle arena..." minHeight="min-h-[400px]" />
  }

  const availableBattles = battles.filter((b) => b.status === 'AVAILABLE')
  const completedBattles = battles.filter((b) => b.status === 'COMPLETED' || b.status === 'SUBMITTED')
  const winCount = battles.filter((b) => b.resultOutcome === 'WON').length

  const filteredBattles = battles.filter((b) => {
    const isComp = b.status === 'COMPLETED' || b.status === 'SUBMITTED'
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'AVAILABLE' && b.status === 'AVAILABLE') ||
      (statusFilter === 'COMPLETED' && isComp)

    const matchesCategory = categoryFilter === 'ALL' || b.category === categoryFilter
    return matchesStatus && matchesCategory
  })

  const handleCompleteBattle = (result: BattleEvaluationResult) => {
    if (activeWorkspaceBattle) {
      const updatedList = battles.map((b) =>
        b.id === activeWorkspaceBattle.id
          ? {
              ...b,
              status: 'COMPLETED' as const,
              score: result.score,
              opponentScore: result.opponentScore,
              resultOutcome: result.resultOutcome,
              feedback: result.feedback,
            }
          : b
      )
      setBattles(updatedList)
      setSelectedResultBattle({
        ...activeWorkspaceBattle,
        status: 'COMPLETED',
        score: result.score,
        opponentScore: result.opponentScore,
        resultOutcome: result.resultOutcome,
        feedback: result.feedback,
      })
      setLastEvaluationResult(result)
      setActiveWorkspaceBattle(null)
    }
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Skill Battles & Timed Drills"
        subtitle="Demonstrate your practical skill problem-solving capability in timed engineering drills matched against peer benchmarks."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Career Mission', href: ROUTES.CAREER_MISSION },
          { label: 'Skill Battles' },
        ]}
      />

      {/* 2. ERROR STATE HANDLER */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200 text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchBattles} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </Card>
      )}

      {/* 3. OVERVIEW HEADER */}
      <BattleOverviewHeader
        totalAvailable={availableBattles.length}
        totalCompleted={completedBattles.length}
        totalWins={winCount || 1}
        targetRole={battles[0]?.targetRole || 'Full Stack Developer'}
        topSkillGap={battles[0]?.skillName || 'Node.js'}
      />

      {/* 4. FILTERS BAR */}
      <BattleFilters
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* 5. BATTLES GRID */}
      {filteredBattles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBattles.map((battle) => (
            <BattleCard
              key={battle.id}
              battle={battle}
              onStart={(b) => setActiveWorkspaceBattle(b)}
              onViewResult={(b) => setSelectedResultBattle(b)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 bg-white border-[#E5E5DF] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D8E8DE]/70 text-[#1F6B4F] flex items-center justify-center mx-auto">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-[#171918]">
            No Skill Battles Match Selected Filters
          </h3>
          <p className="text-xs sm:text-sm text-[#626763] max-w-md mx-auto">
            Adjust your status or category filters to discover active timed drills.
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
            <h4 className="text-sm font-bold text-[#171918]">Looking for today's highest-priority career task?</h4>
            <p className="text-xs text-[#626763]">Execute your daily action to close top skill gaps and boost readiness.</p>
          </div>
        </div>
        <Link to={ROUTES.TODAY}>
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Today's Action →
          </Button>
        </Link>
      </Card>

      {/* 7. WORKSPACE MODAL */}
      <BattleWorkspaceModal
        battle={activeWorkspaceBattle}
        onClose={() => setActiveWorkspaceBattle(null)}
        onComplete={handleCompleteBattle}
      />

      {/* 8. RESULT MODAL */}
      <BattleResultModal
        battle={selectedResultBattle}
        result={lastEvaluationResult}
        onClose={() => {
          setSelectedResultBattle(null)
          setLastEvaluationResult(null)
        }}
      />
    </div>
  )
}

export default SkillBattlesPage
