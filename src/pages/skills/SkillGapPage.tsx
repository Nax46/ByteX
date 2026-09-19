import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { skillsApi } from '@/api/endpoints/skills.api'
import { profileApi } from '@/api/endpoints/profile.api'
import { SkillGap } from '@/types/skill.types'
import { UserStats } from '@/types/user.types'
import { useAuth } from '@/hooks/useAuth'
import {
  ArrowRight,
  CheckCircle2,
  Target,
  Award,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Briefcase,
  Compass,
  Sparkles,
  Zap,
} from 'lucide-react'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const SkillGapPage: React.FC = () => {
  const { user } = useAuth()
  const targetRole = user?.careerGoal || user?.targetCareer || DEFAULT_CAREER_GOAL

  const [gaps, setGaps] = useState<SkillGap[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedPriority, setSelectedPriority] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'ON_TRACK'>('ALL')

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [gapsRes, statsRes] = await Promise.allSettled([
          skillsApi.getSkillGaps(),
          profileApi.getUserStats(),
        ])

        if (!isMounted) return
        if (gapsRes.status === 'fulfilled') setGaps(gapsRes.value || [])
        if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      } catch (err) {
        console.error('Failed to load skill gap intelligence:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <LoadingState message="Analyzing your skill gap matrix..." minHeight="min-h-[350px]" />
  }

  const readinessScore = stats?.careerReadiness ?? 72

  // Derive categories from gaps
  const distinctCategories = [
    'ALL',
    ...Array.from(new Set(gaps.map((g) => g.category).filter(Boolean))),
  ]

  // Strengths vs Focus Areas (sorted by largest gap magnitude first)
  const strengths = gaps.filter((g) => g.gap <= 0 || g.currentLevel >= g.targetLevel)
  const focusAreas = gaps.filter((g) => g.gap > 0).sort((a, b) => b.gap - a.gap)

  // Top Bottleneck Gap (#1 Priority)
  const topBottleneck = focusAreas.length > 0 ? focusAreas[0] : gaps[0]

  // Summary Metrics
  const totalSkillsCount = gaps.length
  const onTrackCount = gaps.filter((g) => g.gap <= 10 || g.currentLevel >= g.targetLevel).length
  const priorityGapsCount = gaps.filter((g) => g.priority === 'HIGH' || g.gap >= 30).length

  // Filtered Gaps Collection
  const filteredGaps = gaps.filter((item) => {
    const matchesSearch =
      item.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory

    let matchesPri = true
    if (selectedPriority === 'HIGH') {
      matchesPri = item.priority === 'HIGH' || item.gap >= 30
    } else if (selectedPriority === 'MEDIUM') {
      matchesPri = item.priority === 'MEDIUM' || (item.gap > 10 && item.gap < 30)
    } else if (selectedPriority === 'ON_TRACK') {
      matchesPri = item.gap <= 10 || item.currentLevel >= item.targetLevel
    }

    return matchesSearch && matchesCat && matchesPri
  })

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. HEADER & CAREER CONTEXT HERO */}
      <PageHeader
        title="Skill Gap Intelligence"
        subtitle={`Career gap matrix evaluating your verified skills against ${targetRole} hiring rubrics.`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'My Skills', href: ROUTES.SKILLS },
          { label: 'Skill Gap' },
        ]}
      />

      {/* Hero Callout Banner */}
      <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 space-y-6 animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E5E5DF]/70">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="forest" size="sm" className="flex items-center gap-1 font-semibold">
                <Briefcase className="w-3 h-3 text-[#1F6B4F]" />
                Target Role: {targetRole}
              </Badge>
              <span className="text-xs text-[#626763] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#1F6B4F]" />
                Verified Career Matrix
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Your skill gap is your career roadmap.
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] max-w-xl leading-relaxed">
              Targeted skill gap intelligence identifies the exact competencies separating your current abilities from {targetRole} benchmark requirements.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link to={ROUTES.CAREERS}>
              <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#626763]" />}>
                Change Goal
              </Button>
            </Link>
            <Link to={ROUTES.ASSESSMENT}>
              <Button variant="primary" size="sm" rightIcon={<Compass className="w-3.5 h-3.5" />}>
                Take Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Summary Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-semibold">
              Evaluated Skills
            </span>
            <span className="font-heading text-xl font-bold text-[#171918] mt-0.5 block">
              {totalSkillsCount} Competencies
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-semibold">
              Skills On Track
            </span>
            <span className="font-heading text-xl font-bold text-[#1F6B4F] mt-0.5 block">
              {onTrackCount} Verified
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-semibold">
              Priority Gaps
            </span>
            <span className="font-heading text-xl font-bold text-amber-700 mt-0.5 block">
              {priorityGapsCount} To Upgrade
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-semibold">
              Readiness Index
            </span>
            <span className="font-heading text-xl font-bold text-[#1F6B4F] mt-0.5 block">
              <AnimatedCounter value={readinessScore} suffix="%" />
            </span>
          </div>
        </div>
      </Card>

      {/* 2. CAREER BOTTLENECK SPOTLIGHT CARD */}
      {topBottleneck && (
        <Card className="p-6 sm:p-7 bg-gradient-to-br from-white via-[#F8F7F3] to-[#FFFDF9] border-amber-300/80 space-y-4 shadow-md animate-slideUp">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="warning" size="sm" className="flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  Primary Career Bottleneck
                </Badge>
                <span className="text-xs text-[#626763] font-semibold">
                  Target Career: {targetRole}
                </span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
                {topBottleneck.skillName}
              </h3>
              <p className="text-xs sm:text-sm text-[#626763] max-w-xl leading-relaxed">
                {topBottleneck.recommendedAction ||
                  `Current proficiency (${topBottleneck.currentLevel}%) is below target requirement (${topBottleneck.targetLevel}%) for your ${targetRole} path.`}
              </p>
            </div>

            {/* Gap Callout */}
            <div className="sm:text-right shrink-0 bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 min-w-40">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Gap Magnitude
              </span>
              <span className="font-heading text-2xl font-bold text-amber-900">
                -{topBottleneck.gap} pts
              </span>
              <span className="text-[11px] text-amber-700 block mt-0.5">
                Current {topBottleneck.currentLevel}% vs Target {topBottleneck.targetLevel}%
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 text-xs">
            <span className="text-[#626763]">
              Upgrading <strong>{topBottleneck.skillName}</strong> yields the highest immediate readiness score gain.
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link to={ROUTES.TODAY} className="flex-1 sm:flex-initial">
                <Button variant="outline" size="sm" className="w-full">
                  Today's Action
                </Button>
              </Link>
              <Link to={ROUTES.ROADMAP} className="flex-1 sm:flex-initial">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="w-full">
                  Work On This Bottleneck
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* 3. SEARCH & FILTER CONTROLS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#626763] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skill gap matrix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white border border-[#E5E5DF] focus:outline-none focus:border-[#1F6B4F] text-[#171918]"
            />
          </div>

          {/* Priority Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-[#626763] shrink-0" />
            <span className="text-xs font-semibold text-[#626763] shrink-0">Priority:</span>
            {[
              { id: 'ALL', label: 'All Gaps' },
              { id: 'HIGH', label: 'High Priority' },
              { id: 'MEDIUM', label: 'Medium Priority' },
              { id: 'ON_TRACK', label: 'On Track' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPriority(p.id as typeof selectedPriority)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedPriority === p.id
                    ? 'bg-[#1F6B4F] text-white shadow-xs'
                    : 'bg-white border border-[#E5E5DF] text-[#626763] hover:text-[#171918]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        {distinctCategories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            <span className="text-xs font-semibold text-[#626763] shrink-0">Category:</span>
            {distinctCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1F6B4F] text-white shadow-xs font-semibold scale-[1.02]'
                    : 'bg-white border border-[#E5E5DF] text-[#626763] hover:text-[#171918] hover:border-[#D0D0C8]'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. COMPLETE SKILL GAP VISUALIZATION MATRIX */}
      <Card className="p-6 bg-white border-[#E5E5DF] space-y-5">
        <div className="flex justify-between items-center text-xs font-semibold text-[#626763] uppercase tracking-wider pb-3 border-b border-[#E5E5DF]">
          <span>Skill Competency</span>
          <span>Current Score vs Target Benchmark</span>
        </div>

        {filteredGaps.length > 0 ? (
          <div className="space-y-3.5">
            {filteredGaps.map((item) => {
              const currentPct = Math.min(100, Math.round(item.currentLevel <= 5 ? item.currentLevel * 20 : item.currentLevel))
              const targetPct = Math.min(100, Math.round(item.targetLevel <= 5 ? item.targetLevel * 20 : item.targetLevel))
              const gapPct = Math.max(0, targetPct - currentPct)
              const isMet = currentPct >= targetPct || gapPct <= 10

              return (
                <div
                  key={item.skillId || item.skillName}
                  className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-3 transition-all hover:border-[#1F6B4F]/40 hover-lift group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading text-sm sm:text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
                          {item.skillName}
                        </span>
                        <Badge variant="forest" size="sm">{item.category || 'General'}</Badge>
                        <Badge variant={isMet ? 'forest' : item.priority === 'HIGH' ? 'warning' : 'outline'} size="sm">
                          {isMet ? 'On Track' : `${item.priority} Priority`}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#626763]">
                        {item.recommendedAction || `Upgrading ${item.skillName} strengthens your ${targetRole} path.`}
                      </p>
                    </div>

                    <div className="text-xs font-semibold sm:text-right shrink-0">
                      <span className="text-[#1F6B4F]">Current {currentPct}%</span>
                      <span className="text-[#8E948F] mx-2">→</span>
                      <span className="text-[#171918]">Target {targetPct}%</span>
                    </div>
                  </div>

                  {/* Overlaid Dual Bar */}
                  <div className="relative w-full h-2.5 bg-[#EAE8E1] rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-[#E5E5DF] rounded-full"
                      style={{ width: `${targetPct}%` }}
                    />
                    <div
                      className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-1000 ${
                        isMet
                          ? 'bg-[#1F6B4F]'
                          : gapPct > 30
                          ? 'bg-[#E7A84B] progress-shimmer'
                          : 'bg-[#1F6B4F]'
                      }`}
                      style={{ width: `${currentPct}%` }}
                    />
                  </div>

                  {/* Card Action footer */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E5E5DF]/60">
                    <span className={gapPct > 0 ? 'text-amber-800 font-semibold' : 'text-[#1F6B4F] font-semibold'}>
                      {gapPct > 0 ? `Gap: ${gapPct} points remaining` : 'Benchmark Met ✓'}
                    </span>

                    <Link to={ROUTES.ROADMAP} className="text-[#1F6B4F] font-semibold hover:underline flex items-center gap-1">
                      Work On Skill <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#626763] space-y-3">
            <Award className="w-10 h-10 text-[#1F6B4F] mx-auto opacity-75" />
            <p>No skill gaps match your filter settings.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('ALL')
                setSelectedPriority('ALL')
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </Card>

      {/* 5. TWO-COLUMN: VERIFIED STRENGTHS VS PRIORITIZED FOCUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Strengths */}
        <Card glass="interactive" className="p-6 border-white/80 space-y-4 hover-lift">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5DF]/70">
            <CheckCircle2 className="w-5 h-5 text-[#1F6B4F]" />
            <h3 className="font-heading text-base font-bold text-[#171918]">Verified Strengths</h3>
          </div>
          <p className="text-xs text-[#626763]">
            Competencies where you already meet or exceed target expectations for {targetRole}:
          </p>

          {strengths.length > 0 ? (
            <ul className="space-y-3 pt-1">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#171918]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B4F] mt-2 shrink-0" />
                  <span><strong>{str.skillName}</strong> ({str.currentLevel}% demonstrated score)</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#626763] pt-2 italic">Complete assessments to register verified strengths.</p>
          )}
        </Card>

        {/* Prioritized Focus Next */}
        <Card glass="interactive" className="p-6 border-white/80 space-y-4 hover-lift">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5DF]/70">
            <Target className="w-5 h-5 text-[#E7A84B]" />
            <h3 className="font-heading text-base font-bold text-[#171918]">Prioritized Focus Next</h3>
          </div>
          <p className="text-xs text-[#626763]">
            Highest-priority skills to study next to close your career gap:
          </p>

          {focusAreas.length > 0 ? (
            <div className="space-y-2.5 pt-1">
              {focusAreas.slice(0, 3).map((focus, idx) => (
                <div key={idx} className="p-3 rounded-xl glass-panel border-white/70 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#171918]">{focus.skillName}</span>
                    <Badge variant={focus.priority === 'HIGH' ? 'warning' : 'outline'} size="sm">
                      -{focus.gap} pts
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#626763]">
                    {focus.recommendedAction || `Focus on closing the ${focus.skillName} gap.`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#626763] pt-2 italic">No priority skill gaps identified.</p>
          )}
        </Card>
      </div>

      {/* 6. RECOMMENDED NEXT MOVE CALLOUT */}
      <Card className="p-6 sm:p-7 rounded-2xl bg-white border-[#C2D8C9] space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F] flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            Your Accelerated Learning Move
          </span>
          <p className="font-heading text-base sm:text-lg font-semibold text-[#171918] leading-relaxed">
            {topBottleneck
              ? `Closing your ${topBottleneck.skillName} gap (-${topBottleneck.gap} pts) unlocks immediate progress toward your ${targetRole} goal.`
              : 'Keep completing practice challenges and diagnostic assessments to verify your skills.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Link to={ROUTES.TODAY} className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full">
              Start Today's Action
            </Button>
          </Link>
          <Link to={ROUTES.ROADMAP} className="w-full sm:w-auto">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />} className="w-full">
              Build My Learning Path →
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
