import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Opportunity } from '@/types/opportunity.types'
import { ROUTES } from '@/constants/routes'
import {
  X,
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  BookOpen,
  Zap,
} from 'lucide-react'

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null
  onClose: () => void
  onApply: (opportunity: Opportunity) => void
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  onClose,
  onApply,
}) => {
  const navigate = useNavigate()

  if (!opportunity) return null

  const isApplied = opportunity.applicationStatus === 'APPLIED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <Card className="w-full max-w-2xl bg-white border-[#E5E5DF] shadow-xl max-h-[90vh] flex flex-col justify-between overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E5E5DF] flex items-start justify-between gap-4 bg-[#F8F7F3]">
          <div className="flex items-center gap-3">
            {opportunity.organizationLogo ? (
              <img
                src={opportunity.organizationLogo}
                alt={opportunity.organization}
                className="w-12 h-12 rounded-xl object-cover border border-[#E5E5DF] shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#D8E8DE] text-[#1F6B4F] font-bold text-lg flex items-center justify-center shrink-0">
                {opportunity.organization.charAt(0)}
              </div>
            )}

            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#626763]">
                {opportunity.organization}
              </span>
              <h2 className="font-heading text-lg font-bold text-[#171918]">
                {opportunity.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <Badge variant="forest" size="sm">
                  {opportunity.typeLabel}
                </Badge>
                <span className="text-xs text-[#626763] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#1F6B4F]" /> {opportunity.location} ({opportunity.workMode})
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#626763] hover:bg-gray-200 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm leading-relaxed">
          {/* Logistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-xs">
            <div>
              <span className="text-[#626763] block text-[11px]">Stipend / Compensation:</span>
              <span className="font-semibold text-[#171918] flex items-center gap-1 mt-0.5">
                <IndianRupee className="w-3.5 h-3.5 text-[#1F6B4F]" /> {opportunity.stipendOrSalary}
              </span>
            </div>

            <div>
              <span className="text-[#626763] block text-[11px]">Application Deadline:</span>
              <span className="font-semibold text-[#171918] flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> {opportunity.deadline}
              </span>
            </div>

            <div>
              <span className="text-[#626763] block text-[11px]">Target Career Path:</span>
              <span className="font-semibold text-[#1F6B4F] mt-0.5 block">
                {opportunity.targetCareer}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-heading text-sm font-bold text-[#171918]">
              Opportunity Overview
            </h3>
            <p className="text-[#626763] leading-relaxed">{opportunity.description}</p>
          </div>

          {/* Responsibilities */}
          {opportunity.responsibilities && opportunity.responsibilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-heading text-sm font-bold text-[#171918]">
                Key Responsibilities & Deliverables
              </h3>
              <ul className="list-disc list-inside space-y-1 text-[#626763]">
                {opportunity.responsibilities.map((res, idx) => (
                  <li key={idx}>{res}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skill Requirements & Student Match Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-[#171918]">
                Required Skills vs Your SkillPath
              </h3>
              {opportunity.isRecommended && (
                <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Aligned with your target role
                </span>
              )}
            </div>

            <div className="border border-[#E5E5DF] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7F3] border-b border-[#E5E5DF] text-[#626763]">
                  <tr>
                    <th className="p-2.5 font-semibold">Required Skill</th>
                    <th className="p-2.5 font-semibold">Priority</th>
                    <th className="p-2.5 font-semibold">Your Status</th>
                    <th className="p-2.5 font-semibold text-right">Action Bridge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DF]">
                  {opportunity.requiredSkills.map((sk, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F7F3]/50 transition-colors">
                      <td className="p-2.5 font-medium text-[#171918]">{sk.name}</td>
                      <td className="p-2.5 text-[11px] text-[#626763]">{sk.importance}</td>
                      <td className="p-2.5">
                        {sk.isDemonstrated ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-900 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-500" /> Active Gap
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        {sk.isGap ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onClose()
                              navigate(ROUTES.ROADMAP)
                            }}
                            leftIcon={<BookOpen className="w-3 h-3 text-[#1F6B4F]" />}
                            className="text-[11px] py-1 px-2 border-[#1F6B4F]/30 text-[#1F6B4F]"
                          >
                            Practice on Roadmap
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onClose()
                              navigate(ROUTES.CHALLENGES)
                            }}
                            leftIcon={<Zap className="w-3 h-3 text-amber-500" />}
                            className="text-[11px] py-1 px-2 text-[#626763]"
                          >
                            View Challenge
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer CTAs */}
        <div className="p-4 border-t border-[#E5E5DF] bg-[#F8F7F3] flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>

          {isApplied ? (
            <span className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Application Submitted
            </span>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (opportunity.externalUrl && !opportunity.isPlatformApplication) {
                  window.open(opportunity.externalUrl, '_blank', 'noopener,noreferrer')
                } else {
                  onApply(opportunity)
                }
              }}
              rightIcon={
                opportunity.isPlatformApplication ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )
              }
              className="text-xs bg-[#1F6B4F] hover:bg-[#17523C] text-white"
            >
              {opportunity.isPlatformApplication ? 'Confirm Application' : 'Open External Listing'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
