import React, { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import {
  opportunitiesApi,
  StudentOpportunityContext,
} from '@/api/endpoints/opportunities.api'
import { Opportunity, OpportunityFilterOptions } from '@/types/opportunity.types'
import { OpportunityHeaderBanner } from '@/components/opportunities/OpportunityHeaderBanner'
import { OpportunityFilters } from '@/components/opportunities/OpportunityFilters'
import { OpportunityCard } from '@/components/opportunities/OpportunityCard'
import { OpportunityDetailModal } from '@/components/opportunities/OpportunityDetailModal'
import { Briefcase, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react'

export const OpportunitiesPage: React.FC = () => {
  const [context, setContext] = useState<StudentOpportunityContext | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [filters, setFilters] = useState<OpportunityFilterOptions>({
    searchQuery: '',
    type: 'ALL',
    workMode: 'ALL',
    onlyRecommended: false,
    onlySaved: false,
    onlyApplied: false,
  })

  // Load context and listings on mount
  const loadData = async () => {
    setIsLoading(true)
    try {
      const [ctxData, oppList] = await Promise.all([
        opportunitiesApi.getStudentContext(),
        opportunitiesApi.getOpportunities(),
      ])
      setContext(ctxData)
      setOpportunities(oppList)
    } catch {
      // Ignore fallback
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtered dataset calculation
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim()
        const matchTitle = opp.title.toLowerCase().includes(q)
        const matchOrg = opp.organization.toLowerCase().includes(q)
        const matchSkill = opp.requiredSkills.some((s) => s.name.toLowerCase().includes(q))
        if (!matchTitle && !matchOrg && !matchSkill) return false
      }

      // Type filter
      if (filters.type !== 'ALL' && opp.type !== filters.type) {
        return false
      }

      // Work mode filter
      if (filters.workMode !== 'ALL' && opp.workMode !== filters.workMode) {
        return false
      }

      // Recommended filter
      if (filters.onlyRecommended && !opp.isRecommended) {
        return false
      }

      // Saved filter
      if (filters.onlySaved && !opp.isSaved) {
        return false
      }

      // Applied filter
      if (filters.onlyApplied && opp.applicationStatus !== 'APPLIED') {
        return false
      }

      return true
    })
  }, [opportunities, filters])

  // Stat counters
  const totalCount = opportunities.length
  const recommendedCount = opportunities.filter((o) => o.isRecommended).length
  const savedCount = opportunities.filter((o) => o.isSaved).length
  const appliedCount = opportunities.filter((o) => o.applicationStatus === 'APPLIED').length

  const handleToggleSave = async (id: string) => {
    const res = await opportunitiesApi.toggleSaveOpportunity(id)
    if (res.success) {
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, isSaved: res.isSaved } : o))
      )
      if (selectedOpportunity && selectedOpportunity.id === id) {
        setSelectedOpportunity((prev) => (prev ? { ...prev, isSaved: res.isSaved } : null))
      }
    }
  }

  const handleApply = async (opp: Opportunity) => {
    const res = await opportunitiesApi.applyToOpportunity(opp.id)
    if (res.success) {
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === opp.id ? { ...o, applicationStatus: 'APPLIED', appliedAt: 'Today' } : o
        )
      )
      if (selectedOpportunity && selectedOpportunity.id === opp.id) {
        setSelectedOpportunity((prev) =>
          prev ? { ...prev, applicationStatus: 'APPLIED', appliedAt: 'Today' } : null
        )
      }

      setToastMessage(`Application submitted successfully for "${opp.title}"!`)
      setTimeout(() => setToastMessage(null), 4000)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn py-2 relative">
      <PageHeader
        title="Opportunities Intelligence & Career Matching"
        subtitle="Discover aligned internships, entry-level job roles, freelance projects, and hackathons derived from your live SkillPath state."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Opportunities' },
        ]}
      />

      {/* Success Notification Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-medium flex items-center justify-between shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setToastMessage(null)}
            className="text-xs border-emerald-300 text-emerald-800"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Live Context Banner */}
      <OpportunityHeaderBanner context={context} />

      {/* Search and Filters Bar */}
      <OpportunityFilters
        filters={filters}
        onChangeFilters={(newFilters) => setFilters(newFilters)}
        totalCount={totalCount}
        recommendedCount={recommendedCount}
        savedCount={savedCount}
        appliedCount={appliedCount}
      />

      {/* Opportunity Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[#626763] text-sm gap-2">
          <Sparkles className="w-5 h-5 animate-spin text-[#1F6B4F]" />
          <span>Analyzing SkillPath context & matching opportunities...</span>
        </div>
      ) : filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onOpenDetail={(o) => setSelectedOpportunity(o)}
              onToggleSave={(id) => handleToggleSave(id)}
              onApply={(o) => handleApply(o)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-12 text-center space-y-4 bg-white border-[#E5E5DF]">
          <div className="w-14 h-14 rounded-2xl bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-heading text-lg font-bold text-[#171918]">
              No Opportunities Found
            </h3>
            <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
              {filters.onlySaved
                ? 'You have not saved any opportunities yet. Click the bookmark icon on any opportunity card to save it for later.'
                : filters.onlyApplied
                ? 'You have not submitted any applications yet. Explore available listings and click "Apply Now".'
                : filters.onlyRecommended
                ? 'No personalized recommendations match your active filters right now.'
                : 'No opportunities match your search query or selected filters.'}
            </p>
          </div>
          {(filters.searchQuery || filters.type !== 'ALL' || filters.workMode !== 'ALL' || filters.onlySaved || filters.onlyApplied || filters.onlyRecommended) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  type: 'ALL',
                  workMode: 'ALL',
                  onlyRecommended: false,
                  onlySaved: false,
                  onlyApplied: false,
                })
              }
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs text-[#626763]"
            >
              Clear All Filters
            </Button>
          )}
        </Card>
      )}

      {/* Opportunity Detail Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onApply={(opp) => handleApply(opp)}
      />
    </div>
  )
}

export default OpportunitiesPage
