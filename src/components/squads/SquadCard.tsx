import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Squad, SquadRole } from '@/types/squad.types'
import { Users, FolderGit2, ArrowRight, UserPlus } from 'lucide-react'

interface SquadCardProps {
  squad: Squad
  onJoinRole: (squadId: string, role: SquadRole) => void
  onSelectSquad: (squad: Squad) => void
}

export const SquadCard: React.FC<SquadCardProps> = ({
  squad,
  onJoinRole,
  onSelectSquad,
}) => {
  return (
    <Card
      glass="interactive"
      className={`p-5 border-white/80 animate-slideUp flex flex-col justify-between transition-all group ${
        squad.isUserMember
          ? 'bg-[#D8E8DE]/30 border-[#C2D8C9]'
          : 'bg-white border-[#E5E5DF]'
      }`}
    >
      <div className="space-y-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              {squad.targetCareer}
            </span>
          </div>

          <Badge variant={squad.isUserMember ? 'forest' : 'outline'} size="sm">
            {squad.isUserMember ? 'Active Squad' : `${squad.members.length} Members`}
          </Badge>
        </div>

        {/* Squad Title & Project */}
        <div>
          <h3 className="font-heading text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
            {squad.name}
          </h3>
          <p className="text-xs text-[#626763] mt-1 leading-relaxed line-clamp-2">
            {squad.description}
          </p>
        </div>

        {/* Target Project Box */}
        <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] text-xs space-y-1">
          <span className="text-[11px] font-bold text-[#1F6B4F] uppercase tracking-wider flex items-center gap-1">
            <FolderGit2 className="w-3.5 h-3.5" /> Target Project Build
          </span>
          <p className="font-bold text-[#171918]">{squad.projectName}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#626763]">MVP Completion:</span>
            <span className="font-bold text-[#1F6B4F]">{squad.progressPercent}%</span>
          </div>
          <ProgressBar value={squad.progressPercent} variant="forest" size="sm" />
        </div>

        {/* Open Roles Needed */}
        {squad.openRoles && squad.openRoles.length > 0 && !squad.isUserMember && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-[#626763] uppercase tracking-wider block">
              Open Roles Needed:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {squad.openRoles.map((roleObj) => (
                <button
                  key={roleObj.role}
                  onClick={() => onJoinRole(squad.id, roleObj.role)}
                  className="text-[11px] px-2.5 py-1 rounded bg-[#D8E8DE] text-[#1F6B4F] font-bold border border-[#C2D8C9] hover:bg-[#1F6B4F] hover:text-white transition-all flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" /> Join as {roleObj.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="pt-4 mt-4 border-t border-[#E5E5DF]/70 flex items-center justify-between gap-2">
        <Button
          variant={squad.isUserMember ? 'primary' : 'outline'}
          size="sm"
          className="w-full text-xs"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          onClick={() => onSelectSquad(squad)}
        >
          {squad.isUserMember ? 'Open Active Squad Workspace' : 'View Squad & Tasks'}
        </Button>
      </div>
    </Card>
  )
}

export default SquadCard
