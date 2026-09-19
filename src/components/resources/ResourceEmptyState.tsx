import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, RefreshCw, Target, Map } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface ResourceEmptyStateProps {
  hasFilters: boolean
  onResetFilters: () => void
}

export const ResourceEmptyState: React.FC<ResourceEmptyStateProps> = ({
  hasFilters,
  onResetFilters,
}) => {
  return (
    <Card className="p-8 sm:p-12 text-center space-y-5 bg-white border-[#E5E5DF]">
      <div className="w-16 h-16 rounded-2xl bg-[#F8F7F3] border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center mx-auto shadow-xs">
        <BookOpen className="w-8 h-8 opacity-80" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="font-heading text-lg font-bold text-[#171918]">
          {hasFilters ? 'No resources match your active filters' : 'No learning resources available yet'}
        </h3>

        <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
          {hasFilters
            ? 'Try adjusting your search keywords, clearing specific skill tags, or resetting filters to view all curated resources.'
            : 'Your career path is ready, but resources for this specific topic are currently being curated by our intelligence engine.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {hasFilters ? (
          <Button
            variant="primary"
            size="sm"
            onClick={onResetFilters}
            className="text-xs font-bold"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset All Filters
          </Button>
        ) : null}

        <Link to={ROUTES.SKILL_GAP}>
          <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Target className="w-3.5 h-3.5" />}>
            View Skill Gaps
          </Button>
        </Link>

        <Link to={ROUTES.ROADMAP}>
          <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Map className="w-3.5 h-3.5" />}>
            View Learning Roadmap
          </Button>
        </Link>
      </div>
    </Card>
  )
}
