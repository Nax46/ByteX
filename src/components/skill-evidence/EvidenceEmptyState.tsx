import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BadgeCheck, RefreshCw, Dumbbell, ClipboardCheck, FolderGit2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface EvidenceEmptyStateProps {
  hasFilters: boolean
  onResetFilters: () => void
}

export const EvidenceEmptyState: React.FC<EvidenceEmptyStateProps> = ({
  hasFilters,
  onResetFilters,
}) => {
  return (
    <Card className="p-8 sm:p-12 text-center space-y-5 bg-white border-[#E5E5DF]">
      <div className="w-16 h-16 rounded-2xl bg-[#F8F7F3] border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center mx-auto shadow-xs">
        <BadgeCheck className="w-8 h-8 opacity-80" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="font-heading text-lg font-bold text-[#171918]">
          {hasFilters ? 'No skill evidence matches your active filters' : 'No verified skill evidence items yet'}
        </h3>

        <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
          {hasFilters
            ? 'Try adjusting your search keywords, clearing specific skill tags, or resetting filters to view all verified proof records.'
            : 'Complete a proctored diagnostic assessment, practical micro-drill, or portfolio project to record audit-ready proof of capability.'}
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

        <Link to={ROUTES.CHALLENGES}>
          <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Dumbbell className="w-3.5 h-3.5" />}>
            Practical Challenges
          </Button>
        </Link>

        <Link to={ROUTES.ASSESSMENT}>
          <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<ClipboardCheck className="w-3.5 h-3.5" />}>
            Take Assessment
          </Button>
        </Link>

        <Link to={ROUTES.PROJECTS}>
          <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<FolderGit2 className="w-3.5 h-3.5" />}>
            View Projects
          </Button>
        </Link>
      </div>
    </Card>
  )
}
