import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { ShieldCheck, CheckCircle2, ArrowRight, ExternalLink, Code, BookOpen, FolderGit2, FileText } from 'lucide-react'
import { SkillEvidenceItem } from '@/types/evidence.types'

interface PassportEvidenceSectionProps {
  evidenceList: SkillEvidenceItem[]
}

export const PassportEvidenceSection: React.FC<PassportEvidenceSectionProps> = ({
  evidenceList,
}) => {
  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]/70">
        <div>
          <h2 className="font-heading text-base sm:text-lg font-bold text-[#171918] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1F6B4F]" />
            Verified Skill Evidence Proofs
          </h2>
          <p className="text-xs text-[#626763] mt-0.5">
            Immutable proof-of-work items aggregated from proctored assessments, practical drills, and builds
          </p>
        </div>
        <Link to={ROUTES.SKILL_EVIDENCE} className="print:hidden">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            All Evidence ({evidenceList.length})
          </Button>
        </Link>
      </div>

      {evidenceList.length > 0 ? (
        <div className="space-y-3">
          {evidenceList.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#C2D8C9] transition-all"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="p-2 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] shrink-0 mt-0.5">
                  {item.sourceType === 'CHALLENGE' ? (
                    <Code className="w-4 h-4" />
                  ) : item.sourceType === 'PROJECT' ? (
                    <FolderGit2 className="w-4 h-4" />
                  ) : item.sourceType === 'ASSESSMENT' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                </span>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-sm font-bold text-[#171918]">{item.title}</h3>
                    <Badge variant="forest" size="sm">
                      {item.sourceType}
                    </Badge>
                    {item.score !== undefined && (
                      <span className="text-xs font-bold text-[#1F6B4F]">
                        Score: {item.score}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#626763] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#626763] pt-0.5">
                    <span>Focus Skill: <strong className="text-[#1F6B4F]">{item.skillName}</strong></span>
                    <span>•</span>
                    <span>Status: <strong>{item.resultStatus || 'Verified'}</strong></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#1F6B4F] bg-[#D8E8DE]/60 px-2.5 py-1 rounded-full border border-[#C2D8C9] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Proof
                </span>
                {item.sourceUrl && (
                  <Link to={item.sourceUrl} className="print:hidden">
                    <Button variant="ghost" size="sm" className="p-1.5 h-auto text-[#626763] hover:text-[#1F6B4F]">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-[#626763] space-y-3">
          <p>No verified evidence recorded yet. Complete challenges or projects to generate proof.</p>
          <Link to={ROUTES.CHALLENGES} className="print:hidden">
            <Button variant="outline" size="sm">
              Start Practical Challenge
            </Button>
          </Link>
        </div>
      )}
    </Card>
  )
}

export default PassportEvidenceSection
