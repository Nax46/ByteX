import React, { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/hooks/useAuth'

import { evidenceApi } from '@/api/endpoints/evidence.api'
import { SkillEvidenceItem } from '@/types/evidence.types'
import { ROUTES } from '@/constants/routes'
import { Link } from 'react-router-dom'
import { Compass, Map, Target, Calendar, AlertTriangle, RefreshCw, ShieldCheck, Dumbbell } from 'lucide-react'

// Subcomponents
import { EvidenceHeaderBanner } from '@/components/skill-evidence/EvidenceHeaderBanner'
import { EvidenceVSClaimCard } from '@/components/skill-evidence/EvidenceVSClaimCard'
import { EvidenceFiltersBar } from '@/components/skill-evidence/EvidenceFiltersBar'
import { EvidenceCard } from '@/components/skill-evidence/EvidenceCard'
import { EvidenceEmptyState } from '@/components/skill-evidence/EvidenceEmptyState'

export const SkillEvidencePage: React.FC = () => {
  const { user } = useAuth()
  const careerGoal = user?.careerGoal || user?.targetCareer || 'Full Stack Developer'

  const [evidenceItems, setEvidenceItems] = useState<SkillEvidenceItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL')
  const [selectedSource, setSelectedSource] = useState<string>('ALL')

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await evidenceApi.getSkillEvidence()
      setEvidenceItems(data || [])
    } catch (err: unknown) {
      console.error('Failed to load skill evidence:', err)
      setError('Failed to load skill evidence. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Derived Summary Counts
  const verifiedCount = useMemo(() => {
    return evidenceItems.filter((i) => i.verificationStatus === 'VERIFIED').length
  }, [evidenceItems])

  const assessmentCount = useMemo(() => {
    return evidenceItems.filter((i) => i.sourceType === 'ASSESSMENT').length
  }, [evidenceItems])

  const challengeCount = useMemo(() => {
    return evidenceItems.filter((i) => i.sourceType === 'CHALLENGE').length
  }, [evidenceItems])

  const projectCount = useMemo(() => {
    return evidenceItems.filter((i) => i.sourceType === 'PROJECT').length
  }, [evidenceItems])

  // Derived Filter Options
  const skillsList = useMemo(() => {
    const uniqueSkills = Array.from(new Set(evidenceItems.map((i) => i.skillName).filter(Boolean)))
    return ['ALL', ...uniqueSkills]
  }, [evidenceItems])

  const sourcesList = ['ALL', 'ASSESSMENT', 'CHALLENGE', 'PROJECT', 'ROADMAP_MILESTONE']

  // Filter Computation
  const filteredEvidence = useMemo(() => {
    return evidenceItems.filter((item) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.skillName.toLowerCase().includes(query) ||
        item.resultStatus.toLowerCase().includes(query)

      const matchesSkill =
        selectedSkill === 'ALL' || item.skillName.toLowerCase() === selectedSkill.toLowerCase()

      const matchesSource =
        selectedSource === 'ALL' || item.sourceType === selectedSource

      return matchesSearch && matchesSkill && matchesSource
    })
  }, [evidenceItems, searchQuery, selectedSkill, selectedSource])

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedSkill !== 'ALL' || selectedSource !== 'ALL'

  const resetAllFilters = () => {
    setSearchQuery('')
    setSelectedSkill('ALL')
    setSelectedSource('ALL')
  }

  if (isLoading) {
    return <LoadingState message="Aggregating verified skill evidence & proof of work..." minHeight="min-h-[400px]" />
  }

  if (error) {
    return (
      <Card className="p-8 text-center space-y-4 max-w-lg mx-auto my-12 border-red-200 bg-red-50/50">
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="font-heading text-base font-bold text-red-900">{error}</h3>
        <Button variant="primary" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Try Again
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Skill Evidence & Proof of Work"
        subtitle="Audit-ready records of demonstrated capability from proctored diagnostic assessments, scenario micro-drills, and submitted repository deliverables."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Skill Evidence' },
        ]}
      />

      {/* 1. Header Banner */}
      <EvidenceHeaderBanner
        careerGoal={careerGoal}
        totalItems={evidenceItems.length}
        verifiedCount={verifiedCount}
        assessmentCount={assessmentCount}
        challengeCount={challengeCount}
        projectCount={projectCount}
      />

      {/* 2. Philosophy Callout Banner */}
      <EvidenceVSClaimCard />

      {/* 3. Cross-Page Navigation Integration Bar */}
      <Card className="p-4 bg-[#F8F7F3] border-[#E5E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-[#626763]">
          <Compass className="w-4 h-4 text-[#1F6B4F] shrink-0" />
          <span>
            Verified evidence feeds directly into your <strong className="text-[#171918]">Career Readiness</strong> score and shareable <strong className="text-[#171918]">Career Passport</strong>.
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
          <Link to={ROUTES.CAREER_PASSPORT}>
            <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
              Career Passport
            </Button>
          </Link>

          <Link to={ROUTES.CHALLENGES}>
            <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Dumbbell className="w-3.5 h-3.5" />}>
              Add Challenge Proof
            </Button>
          </Link>

          <Link to={ROUTES.PROGRESS}>
            <Button variant="primary" size="sm" className="text-xs font-bold" rightIcon={<Map className="w-3.5 h-3.5" />}>
              Progress Timeline
            </Button>
          </Link>
        </div>
      </Card>

      {/* 4. Complete Evidence Catalog & Filters */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-0.5">
            <h2 className="font-heading text-lg font-bold text-[#171918]">
              Verified Proof Records
            </h2>
            <p className="text-xs text-[#626763]">
              Browse demonstrated capability proof by skill topic or activity source.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link to={ROUTES.TODAY}>
              <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Calendar className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
                Today&apos;s Focus Action
              </Button>
            </Link>
          </div>
        </div>

        <EvidenceFiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedSkill={selectedSkill}
          onSkillChange={setSelectedSkill}
          skillsList={skillsList}
          selectedSource={selectedSource}
          onSourceChange={setSelectedSource}
          sourcesList={sourcesList}
          totalCount={evidenceItems.length}
          filteredCount={filteredEvidence.length}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetAllFilters}
        />

        {/* Evidence Cards Grid */}
        {filteredEvidence.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvidence.map((item, index) => {
              const staggerClass =
                index % 3 === 0 ? 'stagger-1' : index % 3 === 1 ? 'stagger-2' : 'stagger-3'

              return (
                <EvidenceCard
                  key={item.id}
                  item={item}
                  staggerClass={staggerClass}
                />
              )
            })}
          </div>
        ) : (
          <EvidenceEmptyState
            hasFilters={hasActiveFilters}
            onResetFilters={resetAllFilters}
          />
        )}
      </section>
    </div>
  )
}

export default SkillEvidencePage
