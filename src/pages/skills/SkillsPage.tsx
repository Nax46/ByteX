import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { TopSkillSpotlightCard } from '@/components/skills/TopSkillSpotlightCard'
import { SkillMatrixCard } from '@/components/skills/SkillMatrixCard'
import { skillsApi } from '@/api/endpoints/skills.api'
import { profileApi } from '@/api/endpoints/profile.api'
import { Skill, SkillGap } from '@/types/skill.types'
import { UserStats } from '@/types/user.types'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import {
  Target,
  ClipboardCheck,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Award,
  Compass,
} from 'lucide-react'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const SkillsPage: React.FC = () => {
  const { user } = useAuth()
  const targetRole = user?.careerGoal || user?.targetCareer || DEFAULT_CAREER_GOAL

  const [skills, setSkills] = useState<Skill[]>([])
  const [gaps, setGaps] = useState<SkillGap[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ON_TRACK' | 'DEVELOPING' | 'PRIORITY' | 'UNASSESSED'>('ALL')

  useEffect(() => {
    let isMounted = true

    const fetchSkillData = async () => {
      setIsLoading(true)
      try {
        const [skillsRes, gapsRes, statsRes] = await Promise.allSettled([
          skillsApi.getSkills(),
          skillsApi.getSkillGaps(),
          profileApi.getUserStats(),
        ])

        if (!isMounted) return

        if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value || [])
        if (gapsRes.status === 'fulfilled') setGaps(gapsRes.value || [])
        if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      } catch (err) {
        console.error('Failed to load skill intelligence data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchSkillData()
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading your career-aware skill intelligence profile..." minHeight="min-h-[350px]" />
  }

  // Derive categories from returned skill list
  const distinctCategories = [
    'ALL',
    ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean))),
  ]

  // Top skill gap to improve (bottleneck)
  const topGap = gaps.length > 0 ? gaps[0] : null
  const topGapSkill = topGap
    ? skills.find((s) => s.name.toLowerCase() === topGap.skillName.toLowerCase() || s.id === topGap.skillId) || {
        id: topGap.skillId,
        name: topGap.skillName,
        category: topGap.category || 'Core Competency',
        currentLevel: topGap.currentLevel,
        targetLevel: topGap.targetLevel,
        progress: topGap.currentLevel,
      }
    : skills[0]

  // Counts for summary metrics
  const totalSkillsCount = skills.length
  const onTrackCount = skills.filter((s) => (s.targetLevel ? s.currentLevel >= s.targetLevel : s.progress >= 70)).length
  const priorityGapsCount = gaps.filter((g) => g.priority === 'HIGH' || g.gap >= 30).length
  const avgMastery = skills.length > 0 ? Math.round(skills.reduce((sum, s) => sum + (s.progress || s.currentLevel || 0), 0) / skills.length) : 0

  // Filter skills collection
  const filteredSkills = skills.filter((sk) => {
    const matchesSearch =
      sk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sk.category && sk.category.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCat = selectedCategory === 'ALL' || sk.category === selectedCategory

    const targetLvl = sk.targetLevel || 90
    const currLvl = sk.currentLevel || sk.progress || 0
    const gapVal = Math.max(0, targetLvl - currLvl)

    let matchesStatus = true
    if (selectedStatus === 'ON_TRACK') {
      matchesStatus = currLvl >= targetLvl || gapVal <= 10
    } else if (selectedStatus === 'DEVELOPING') {
      matchesStatus = gapVal > 10 && gapVal <= 30
    } else if (selectedStatus === 'PRIORITY') {
      matchesStatus = gapVal > 30
    } else if (selectedStatus === 'UNASSESSED') {
      matchesStatus = currLvl === 0
    }

    return matchesSearch && matchesCat && matchesStatus
  })

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Skill Intelligence"
        subtitle="Career-aware skill profile evaluating your technical capabilities against your target role rubrics."
        actions={
          <div className="flex items-center gap-2.5">
            <Link to={ROUTES.SKILL_GAP}>
              <Button variant="outline" size="sm" leftIcon={<Target className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
                Skill Gap Matrix
              </Button>
            </Link>
            <Link to={ROUTES.ASSESSMENT}>
              <Button variant="primary" size="sm" leftIcon={<ClipboardCheck className="w-3.5 h-3.5" />}>
                Take Assessment
              </Button>
            </Link>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Skill Intelligence' },
        ]}
      />

      {/* 1. CAREER CONTEXT HEADER BANNER */}
      <Card glass="elevated" sheen className="p-6 sm:p-7 border-white/80 space-y-5 animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="forest" size="sm" className="flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-[#1F6B4F]" />
                Career Goal Anchor
              </Badge>
              <span className="text-xs text-[#626763]">
                Evaluated for: <strong className="text-[#171918]">{targetRole}</strong>
              </span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
              {targetRole} Skill Matrix
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] max-w-xl leading-relaxed">
              Your continuous skill evaluation mapped against real-world technical requirements for your target career path.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link to={ROUTES.CAREERS}>
              <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#626763]" />}>
                Change Goal
              </Button>
            </Link>
            <Link to={ROUTES.CAREER_READINESS}>
              <Button variant="primary" size="sm">
                {stats?.careerReadiness || 72}% Ready →
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Summary Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[#626763] block text-[11px] uppercase tracking-wider font-semibold">
              Tracked Skills
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
              Average Mastery
            </span>
            <span className="font-heading text-xl font-bold text-[#1F6B4F] mt-0.5 block">
              {avgMastery}% Score
            </span>
          </div>
        </div>
      </Card>

      {/* 2. TOP SKILL SPOTLIGHT (If priority gap exists) */}
      {topGapSkill && (
        <TopSkillSpotlightCard
          skillName={topGapSkill.name}
          category={topGapSkill.category}
          currentLevel={topGapSkill.currentLevel || topGapSkill.progress || 50}
          targetLevel={topGapSkill.targetLevel || 90}
          gap={Math.max(0, (topGapSkill.targetLevel || 90) - (topGapSkill.currentLevel || topGapSkill.progress || 50))}
          priority={topGap?.priority || 'HIGH'}
          targetRole={targetRole}
          recommendedAction={topGap?.recommendedAction}
        />
      )}

      {/* 3. CONTROLS: SEARCH & FILTER BAR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#626763] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skills or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white border border-[#E5E5DF] focus:outline-none focus:border-[#1F6B4F] text-[#171918]"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-[#626763] shrink-0" />
            <span className="text-xs font-semibold text-[#626763] shrink-0">Status:</span>
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'ON_TRACK', label: 'On Track' },
              { id: 'DEVELOPING', label: 'Developing' },
              { id: 'PRIORITY', label: 'Priority Gaps' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id as typeof selectedStatus)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  selectedStatus === st.id
                    ? 'bg-[#1F6B4F] text-white shadow-xs'
                    : 'bg-white border border-[#E5E5DF] text-[#626763] hover:text-[#171918]'
                }`}
              >
                {st.label}
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

      {/* 4. CAREER SKILL MAP GRID */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map((skill, index) => {
            const staggerClass = index % 3 === 0 ? 'stagger-1' : index % 3 === 1 ? 'stagger-2' : 'stagger-3'
            const targetLvl = skill.targetLevel || 90
            const currentLvl = skill.currentLevel || skill.progress || 0
            const gapVal = Math.max(0, targetLvl - currentLvl)

            // Match priority from gaps if available
            const matchingGap = gaps.find((g) => g.skillName.toLowerCase() === skill.name.toLowerCase() || g.skillId === skill.id)
            const priorityVal = matchingGap?.priority || (gapVal > 30 ? 'HIGH' : 'MEDIUM')

            return (
              <SkillMatrixCard
                key={skill.id || skill.name}
                id={skill.id}
                name={skill.name}
                category={skill.category || 'Core Competency'}
                currentLevel={currentLvl}
                targetLevel={targetLvl}
                gap={gapVal}
                priority={priorityVal}
                lastAssessed={skill.lastAssessed}
                className={`animate-slideUp ${staggerClass}`}
              />
            )
          })}
        </div>
      ) : (
        <Card className="p-8 text-center space-y-4 bg-white border-[#E5E5DF]">
          <Award className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No matching skills found</h3>
          <p className="text-xs text-[#626763] max-w-md mx-auto">
            Try adjusting your search query or filter settings, or complete a new diagnostic assessment to update your verified skill profile.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('ALL')
                setSelectedStatus('ALL')
              }}
            >
              Reset Filters
            </Button>
            <Link to={ROUTES.ASSESSMENT}>
              <Button variant="primary" size="sm" rightIcon={<Compass className="w-3.5 h-3.5" />}>
                Take Assessment
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
