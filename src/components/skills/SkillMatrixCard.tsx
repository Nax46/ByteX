import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react'

export interface SkillMatrixCardProps {
  id?: string
  name: string
  category: string
  currentLevel: number
  targetLevel: number
  gap: number
  importance?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | string
  lastAssessed?: string
  onSelect?: () => void
  className?: string
}

export const SkillMatrixCard: React.FC<SkillMatrixCardProps> = ({
  name,
  category,
  currentLevel,
  targetLevel,
  gap,
  importance,
  priority,
  lastAssessed,
  onSelect,
  className = '',
}) => {
  const getStatusBadge = () => {
    if (currentLevel === 0) {
      return (
        <Badge variant="outline" size="sm" className="bg-slate-100 text-slate-600 border-slate-200">
          Not Assessed
        </Badge>
      )
    }

    if (gap <= 10 || currentLevel >= targetLevel) {
      return (
        <Badge variant="forest" size="sm" className="flex items-center gap-1 font-semibold">
          <CheckCircle2 className="w-3 h-3" />
          On Track
        </Badge>
      )
    }

    if (priority === 'HIGH' || gap >= 35 || importance === 'CRITICAL') {
      return (
        <Badge variant="outline" size="sm" className="border-amber-400 text-amber-800 bg-amber-50 flex items-center gap-1 font-semibold">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          Priority Gap
        </Badge>
      )
    }

    return (
      <Badge variant="warning" size="sm" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Developing
      </Badge>
    )
  }

  const getImportanceBadge = () => {
    if (!importance) return null
    const imp = importance.toUpperCase()
    if (imp === 'CRITICAL') {
      return <Badge variant="outline" size="sm" className="border-red-400 text-red-700 bg-red-50 font-bold">Critical</Badge>
    }
    if (imp === 'HIGH') {
      return <Badge variant="outline" size="sm" className="border-amber-400 text-amber-800 bg-amber-50 font-medium">High</Badge>
    }
    return <Badge variant="default" size="sm">{importance}</Badge>
  }

  return (
    <Card
      hoverEffect
      className={`p-5 flex flex-col justify-between bg-white border-[#E5E5DF] hover:border-[#1F6B4F]/50 transition-all space-y-4 ${className}`}
    >
      <div className="space-y-3">
        {/* Category & Status Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="forest" size="sm">{category || 'General'}</Badge>
            {getImportanceBadge()}
          </div>
          {getStatusBadge()}
        </div>

        {/* Skill Title & Score */}
        <div>
          <h4 className="font-heading text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
            {name}
          </h4>
          <div className="flex items-center justify-between text-xs text-[#626763] mt-1">
            <span>Score: <strong className="text-[#171918]">{currentLevel}%</strong></span>
            <span>Target: <strong className="text-[#1F6B4F]">{targetLevel}%</strong></span>
            <span>Gap: <strong className={gap > 30 ? 'text-amber-700' : 'text-[#1F6B4F]'}>{gap} pts</strong></span>
          </div>
        </div>

        {/* Comparative Progress Bar */}
        <div className="space-y-1">
          <ProgressBar
            value={currentLevel}
            variant={currentLevel >= targetLevel ? 'forest' : gap > 30 ? 'warning' : 'primary'}
            size="sm"
          />
        </div>
      </div>

      {/* Footer & Action */}
      <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between text-xs text-[#626763]">
        <span className="text-[11px] text-[#626763]">
          {lastAssessed ? `Assessed ${lastAssessed}` : 'Verified Baseline'}
        </span>

        {onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            className="text-[#1F6B4F] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Analyze Gap <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            to={ROUTES.SKILL_GAP}
            className="text-[#1F6B4F] font-semibold hover:underline flex items-center gap-1"
          >
            Analyze Gap <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </Card>
  )
}
