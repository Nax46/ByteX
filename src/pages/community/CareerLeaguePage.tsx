import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { careerLeagueApi } from '@/api/endpoints/league.api'
import { LeagueMember, LeagueSummary } from '@/types/league.types'
import { CAREER_GOAL_LABELS } from '@/data'
import { Briefcase, RefreshCw, AlertCircle } from 'lucide-react'

// Import Career League Subcomponents
import { LeagueOverviewHeader } from '@/components/career-league/LeagueOverviewHeader'
import { LeagueStandingsTable } from '@/components/career-league/LeagueStandingsTable'
import { LeagueBreakdownCard } from '@/components/career-league/LeagueBreakdownCard'
import { LeagueNextMoveCard } from '@/components/career-league/LeagueNextMoveCard'

export const CareerLeaguePage: React.FC = () => {
  const [summary, setSummary] = useState<LeagueSummary | null>(null)
  const [members, setMembers] = useState<LeagueMember[]>([])
  const [selectedCareer, setSelectedCareer] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeagueData = async (career?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await careerLeagueApi.getLeagueData(career)
      setSummary(data.summary)
      setMembers(data.members)
    } catch (err) {
      console.error('Failed to load Career League data:', err)
      setError('Unable to load Career League standings. Please check your network connection.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeagueData(selectedCareer || undefined)
  }, [selectedCareer])

  if (isLoading && !summary) {
    return <LoadingState message="Calculating Career League standings..." minHeight="min-h-[400px]" />
  }

  const defaultSummary: LeagueSummary = summary || {
    currentRank: 4,
    totalMembers: 7,
    percentile: 57,
    tier: 'GOLD',
    seasonName: 'Q3 2026 Career Sprint',
    targetCareer: selectedCareer || 'Full Stack Developer',
    userReadinessScore: 68,
    userVerifiedEvidenceCount: 8,
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="Career League"
        subtitle="Benchmark your verified skills, project builds, and readiness velocity alongside peers in your target career cohort."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Career Mission', href: ROUTES.CAREER_MISSION },
          { label: 'Career League' },
        ]}
      />

      {/* 2. ERROR STATE HANDLER */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200 text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchLeagueData(selectedCareer)} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </Card>
      )}

      {/* 3. OVERVIEW HEADER */}
      <LeagueOverviewHeader summary={defaultSummary} />

      {/* 4. CAREER COHORT FILTER BAR */}
      <Card className="p-4 bg-white border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-[#D8E8DE] text-[#1F6B4F]">
            <Briefcase className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-[#171918]">Filter League by Career Track:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CAREER_GOAL_LABELS.map((career) => (
            <button
              key={career}
              onClick={() => setSelectedCareer(career === selectedCareer ? '' : career)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCareer === career || (!selectedCareer && career === defaultSummary.targetCareer)
                  ? 'bg-[#1F6B4F] text-white font-bold shadow-xs'
                  : 'bg-[#F8F7F3] text-[#626763] hover:text-[#171918] border border-[#E5E5DF]'
              }`}
            >
              {career}
            </button>
          ))}
        </div>
      </Card>

      {/* 5. LEAGUE STANDINGS TABLE */}
      <LeagueStandingsTable members={members} targetCareer={defaultSummary.targetCareer} />

      {/* 6. LEAGUE BREAKDOWN */}
      <LeagueBreakdownCard
        readinessScore={defaultSummary.userReadinessScore}
        evidenceCount={defaultSummary.userVerifiedEvidenceCount}
      />

      {/* 7. NEXT MOVE CALLOUT */}
      <LeagueNextMoveCard
        targetCareer={defaultSummary.targetCareer}
        currentRank={defaultSummary.currentRank}
      />
    </div>
  )
}

export default CareerLeaguePage
