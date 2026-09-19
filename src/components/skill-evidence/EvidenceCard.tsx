import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkillEvidenceItem } from '@/types/evidence.types'
import { Link } from 'react-router-dom'
import { ShieldCheck, Calendar, ExternalLink, Award, Dumbbell, FolderGit2, Map, ClipboardCheck } from 'lucide-react'

interface EvidenceCardProps {
  item: SkillEvidenceItem
  staggerClass?: string
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ item, staggerClass = '' }) => {
  const getSourceIcon = (sourceType: SkillEvidenceItem['sourceType']) => {
    switch (sourceType) {
      case 'ASSESSMENT':
        return <ClipboardCheck className="w-3.5 h-3.5 text-[#1F6B4F] inline mr-1" />
      case 'CHALLENGE':
        return <Dumbbell className="w-3.5 h-3.5 text-[#1F6B4F] inline mr-1" />
      case 'PROJECT':
        return <FolderGit2 className="w-3.5 h-3.5 text-[#1F6B4F] inline mr-1" />
      case 'ROADMAP_MILESTONE':
        return <Map className="w-3.5 h-3.5 text-[#1F6B4F] inline mr-1" />
      default:
        return <Award className="w-3.5 h-3.5 text-[#1F6B4F] inline mr-1" />
    }
  }

  const getSourceLabel = (sourceType: SkillEvidenceItem['sourceType']) => {
    switch (sourceType) {
      case 'ASSESSMENT':
        return 'Skill Assessment'
      case 'CHALLENGE':
        return 'Practical Challenge'
      case 'PROJECT':
        return 'Portfolio Project'
      case 'ROADMAP_MILESTONE':
        return 'Roadmap Milestone'
      default:
        return 'Activity'
    }
  }

  const dateStr = item.completedAt
    ? new Date(item.completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent'

  return (
    <Card
      hoverEffect
      className={`p-5 sm:p-6 bg-white border-[#E5E5DF] flex flex-col justify-between space-y-4 hover-lift animate-slideUp ${staggerClass} group`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="forest" size="sm" className="font-semibold">
              {item.skillName}
            </Badge>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8F7F3] border border-[#E5E5DF] text-[#171918]">
              {getSourceIcon(item.sourceType)}
              {getSourceLabel(item.sourceType)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#1F6B4F] font-bold bg-[#D8E8DE]/60 px-2 py-0.5 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{item.verificationStatus || 'VERIFIED'}</span>
          </div>
        </div>

        <h3 className="font-heading text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors duration-200">
          {item.title}
        </h3>

        <p className="text-xs text-[#626763] leading-relaxed line-clamp-2">
          {item.description}
        </p>

        <div className="pt-1 flex items-center justify-between text-xs border-t border-[#E5E5DF]/70">
          <span className="text-[#626763] flex items-center gap-1 text-[11px] font-medium pt-1">
            <Calendar className="w-3.5 h-3.5 text-[#1F6B4F]" />
            {dateStr}
          </span>

          <span className="font-bold text-[#1F6B4F] bg-[#F8F7F3] px-2 py-0.5 rounded border border-[#E5E5DF] text-[11px]">
            {item.resultStatus}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between text-xs gap-2">
        <span className="text-[#626763] font-medium text-[11px]">Verified Proof Record</span>

        <Link to={item.sourceUrl || '#'}>
          <Button variant="outline" size="sm" className="text-xs font-semibold" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
            View Original
          </Button>
        </Link>
      </div>
    </Card>
  )
}
