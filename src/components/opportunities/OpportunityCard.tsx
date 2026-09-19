import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Opportunity } from '@/types/opportunity.types'
import {
  MapPin,
  Calendar,
  IndianRupee,
  Bookmark,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

interface OpportunityCardProps {
  opportunity: Opportunity
  onOpenDetail: (opportunity: Opportunity) => void
  onToggleSave: (id: string) => void
  onApply: (opportunity: Opportunity) => void
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onOpenDetail,
  onToggleSave,
  onApply,
}) => {
  const isApplied = opportunity.applicationStatus === 'APPLIED'

  return (
    <Card className="p-5 bg-white border-[#E5E5DF] hover:border-[#1F6B4F]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
      {/* Top Header Row */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Organization Logo */}
            {opportunity.organizationLogo ? (
              <img
                src={opportunity.organizationLogo}
                alt={opportunity.organization}
                className="w-10 h-10 rounded-xl object-cover border border-[#E5E5DF] shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#D8E8DE] text-[#1F6B4F] font-bold flex items-center justify-center shrink-0">
                {opportunity.organization.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#626763]">
                  {opportunity.organization}
                </span>
                {opportunity.isRecommended && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    Matched
                  </span>
                )}
              </div>
              <h3 className="font-heading text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors leading-snug">
                {opportunity.title}
              </h3>
            </div>
          </div>

          {/* Bookmark Toggle Icon */}
          <button
            type="button"
            onClick={() => onToggleSave(opportunity.id)}
            className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              opportunity.isSaved
                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                : 'text-[#626763] hover:bg-[#F8F7F3] border border-[#E5E5DF]'
            }`}
            title={opportunity.isSaved ? 'Remove Bookmark' : 'Save Opportunity'}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Badges and Logistics Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="forest" size="sm">
            {opportunity.typeLabel}
          </Badge>

          <div className="flex items-center gap-1 text-[#626763] px-2 py-0.5 rounded bg-[#F8F7F3] border border-[#E5E5DF]">
            <MapPin className="w-3 h-3 text-[#1F6B4F]" />
            <span>{opportunity.location}</span>
          </div>

          <div className="flex items-center gap-1 text-[#626763] px-2 py-0.5 rounded bg-[#F8F7F3] border border-[#E5E5DF]">
            <IndianRupee className="w-3 h-3 text-[#1F6B4F]" />
            <span>{opportunity.stipendOrSalary}</span>
          </div>

          <div className="flex items-center gap-1 text-[#626763] px-2 py-0.5 rounded bg-[#F8F7F3] border border-[#E5E5DF]">
            <Calendar className="w-3 h-3 text-amber-600" />
            <span>Deadline: {opportunity.deadline}</span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-[#626763] line-clamp-2 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Required Skills Matrix Bar */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-[#626763] uppercase tracking-wider block">
            Required Skills vs Your SkillPath:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {opportunity.requiredSkills.map((sk, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                  sk.isDemonstrated
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : sk.isGap
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {sk.isDemonstrated ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                )}
                <span>{sk.name}</span>
                <span className="text-[10px] opacity-75">
                  ({sk.isDemonstrated ? 'Verified' : 'Gap'})
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Match Reason Callout */}
        {opportunity.relevanceReason && (
          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/50 text-[11px] text-emerald-900 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1F6B4F] shrink-0 mt-0.5" />
            <span>{opportunity.relevanceReason}</span>
          </div>
        )}
      </div>

      {/* Card Footer CTAs */}
      <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenDetail(opportunity)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          View Details
        </Button>

        {isApplied ? (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Applied
          </span>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApply(opportunity)}
            rightIcon={
              opportunity.isPlatformApplication ? (
                <ArrowRight className="w-3.5 h-3.5" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5" />
              )
            }
            className="text-xs bg-[#1F6B4F] hover:bg-[#17523C] text-white"
          >
            {opportunity.isPlatformApplication ? 'Apply Now' : 'Apply Externally'}
          </Button>
        )}
      </div>
    </Card>
  )
}
