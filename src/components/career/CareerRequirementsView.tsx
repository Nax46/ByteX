import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
  Search,
  Target,
  Sparkles,
  Award,
} from 'lucide-react'

export interface CareerSkillRequirement {
  skillId?: string
  name: string
  category?: string
  importance?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string
  currentLevel: number
  targetLevel: number
  gap?: number
  status?: 'MET' | 'DEVELOPING' | 'NEEDS_WORK' | 'NOT_ASSESSED' | 'On Track' | 'Needs Work' | 'Priority' | 'Strong' | string
}

export interface CareerRequirementsViewProps {
  careerTitle: string
  requiredSkills: CareerSkillRequirement[]
  isLoading?: boolean
  onWorkOnGap?: (skillName: string) => void
  className?: string
}

export const CareerRequirementsView: React.FC<CareerRequirementsViewProps> = ({
  careerTitle,
  requiredSkills,
  isLoading = false,
  onWorkOnGap,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [importanceFilter, setImportanceFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL')

  const filteredSkills = requiredSkills.filter((sk) => {
    const matchesSearch = sk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sk.category && sk.category.toLowerCase().includes(searchQuery.toLowerCase()))
    
    if (importanceFilter === 'ALL') return matchesSearch
    return matchesSearch && sk.importance?.toUpperCase() === importanceFilter
  })

  const getStatusBadge = (sk: CareerSkillRequirement) => {
    const current = sk.currentLevel
    const target = sk.targetLevel
    const gap = sk.gap !== undefined ? sk.gap : Math.max(0, target - current)

    if (current === 0) {
      return (
        <Badge variant="outline" size="sm" className="bg-slate-100 text-slate-600 border-slate-200">
          Not Assessed
        </Badge>
      )
    }

    if (gap <= 10 || current >= target) {
      return (
        <Badge variant="forest" size="sm" className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          On Track
        </Badge>
      )
    }

    if (gap <= 30) {
      return (
        <Badge variant="warning" size="sm" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Developing
        </Badge>
      )
    }

    return (
      <Badge variant="outline" size="sm" className="border-amber-500 text-amber-700 bg-amber-50 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        High Priority Gap
      </Badge>
    )
  }

  const getImportanceBadge = (importance?: string) => {
    const imp = importance?.toUpperCase()
    if (imp === 'CRITICAL') {
      return <Badge variant="outline" size="sm" className="border-red-400 text-red-700 bg-red-50 font-bold">Critical</Badge>
    }
    if (imp === 'HIGH') {
      return <Badge variant="outline" size="sm" className="border-amber-400 text-amber-800 bg-amber-50 font-medium">High</Badge>
    }
    if (imp === 'MEDIUM') {
      return <Badge variant="default" size="sm">Medium</Badge>
    }
    return <Badge variant="default" size="sm">Standard</Badge>
  }

  return (
    <Card className={`p-6 bg-white border-[#E5E5DF] space-y-6 ${className}`}>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Role Competency Rubric
            </span>
          </div>
          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#171918] mt-1">
            Required Skills for {careerTitle}
          </h3>
          <p className="text-xs text-[#626763] mt-0.5">
            Comparing your verified skill baselines against current industry requirements.
          </p>
        </div>

        <Link to={ROUTES.SKILL_GAP}>
          <Button variant="outline" size="sm" leftIcon={<Target className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
            Full Skill Matrix
          </Button>
        </Link>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#626763] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search required skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-[#F8F7F3] border border-[#E5E5DF] focus:outline-none focus:border-[#1F6B4F] text-[#171918]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#626763] shrink-0" />
          <span className="text-xs font-semibold text-[#626763]">Importance:</span>
          {(['ALL', 'CRITICAL', 'HIGH'] as const).map((imp) => (
            <button
              key={imp}
              type="button"
              onClick={() => setImportanceFilter(imp)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                importanceFilter === imp
                  ? 'bg-[#1F6B4F] text-white shadow-xs'
                  : 'bg-[#F8F7F3] border border-[#E5E5DF] text-[#626763] hover:text-[#171918]'
              }`}
            >
              {imp === 'ALL' ? 'All' : imp}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#626763] space-y-2">
          <div className="w-6 h-6 border-2 border-[#1F6B4F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Loading skill requirements matrix...</p>
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="space-y-3.5">
          {filteredSkills.map((sk) => {
            const gapVal = sk.gap !== undefined ? sk.gap : Math.max(0, sk.targetLevel - sk.currentLevel)
            return (
              <div
                key={sk.name}
                className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-3 hover:border-[#1F6B4F]/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading text-sm font-bold text-[#171918]">
                        {sk.name}
                      </h4>
                      {getImportanceBadge(sk.importance)}
                      {getStatusBadge(sk)}
                    </div>
                    {sk.category && (
                      <span className="text-[11px] text-[#626763]">
                        Category: {sk.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-[11px] text-[#626763] block">Target Level</span>
                      <span className="font-bold text-[#171918]">{sk.targetLevel}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#626763] block">Current Score</span>
                      <span className="font-bold text-[#1F6B4F]">{sk.currentLevel}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-[#626763] block">Skill Gap</span>
                      <span className={`font-bold ${gapVal > 30 ? 'text-amber-700' : 'text-[#1F6B4F]'}`}>
                        {gapVal} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparative Progress Bars */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#626763]">Current Baseline ({sk.currentLevel}%) vs Target ({sk.targetLevel}%)</span>
                    <span className="font-semibold text-[#1F6B4F]">
                      {sk.currentLevel >= sk.targetLevel ? 'Target Achieved' : `${gapVal}% points remaining`}
                    </span>
                  </div>

                  <div className="relative w-full h-2.5 bg-[#E5E5DF] rounded-full overflow-hidden">
                    {/* Target Level indicator line */}
                    <div
                      className="absolute top-0 bottom-0 bg-[#1F6B4F]/20 rounded-full"
                      style={{ width: `${Math.min(100, sk.targetLevel)}%` }}
                    />
                    {/* Current Level filled bar */}
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        sk.currentLevel >= sk.targetLevel
                          ? 'bg-[#1F6B4F]'
                          : gapVal > 30
                          ? 'bg-[#E7A84B]'
                          : 'bg-[#1F6B4F]'
                      }`}
                      style={{ width: `${Math.min(100, sk.currentLevel)}%` }}
                    />
                  </div>
                </div>

                {/* Card Action footer */}
                <div className="flex items-center justify-between pt-2 text-xs border-t border-[#E5E5DF]/60">
                  <span className="text-[11px] text-[#626763]">
                    {sk.currentLevel === 0
                      ? 'No verified assessment scores recorded.'
                      : gapVal > 0
                      ? `Upgrading ${sk.name} strengthens your ${careerTitle} readiness.`
                      : 'Proficiency requirements fulfilled.'}
                  </span>

                  {onWorkOnGap ? (
                    <button
                      type="button"
                      onClick={() => onWorkOnGap(sk.name)}
                      className="text-[#1F6B4F] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Work on Gap <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <Link
                      to={ROUTES.SKILL_GAP}
                      className="text-[#1F6B4F] font-semibold hover:underline flex items-center gap-1"
                    >
                      Work on Gap <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-[#626763] space-y-2">
          <Sparkles className="w-8 h-8 text-[#1F6B4F] mx-auto opacity-75" />
          <p>No skills match your current search criteria.</p>
        </div>
      )}
    </Card>
  )
}
