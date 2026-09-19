import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { SquadMember } from '@/types/squad.types'
import { Users, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface SquadMemberListProps {
  members: SquadMember[]
}

export const SquadMemberList: React.FC<SquadMemberListProps> = ({
  members,
}) => {
  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]/70">
        <div>
          <h2 className="font-heading text-base sm:text-lg font-bold text-[#171918] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1F6B4F]" />
            Squad Team Members & Roles
          </h2>
          <p className="text-xs text-[#626763] mt-0.5">
            Role-based team responsibilities mapped to target project features
          </p>
        </div>
        <Badge variant="forest" size="sm">
          {members.length} Active Members
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((mem) => (
          <div
            key={mem.id}
            className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between transition-all ${
              mem.isCurrentUser
                ? 'bg-[#D8E8DE]/40 border-[#C2D8C9] shadow-xs'
                : 'bg-[#F8F7F3] border-[#E5E5DF]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar name={mem.name} size="md" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-sm text-[#171918]">{mem.name}</h3>
                    {mem.isCurrentUser && (
                      <span className="text-[10px] bg-[#1F6B4F] text-white px-2 py-0.5 rounded-full font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <Badge variant="forest" size="sm" className="mt-1">
                    {mem.roleLabel}
                  </Badge>
                </div>
              </div>

              {mem.skillsDemonstrated && mem.skillsDemonstrated.length > 0 && (
                <div className="pt-2 border-t border-[#E5E5DF]/60 space-y-1">
                  <span className="text-[11px] font-semibold text-[#626763] block">
                    Demonstrated Skills:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {mem.skillsDemonstrated.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-2 py-0.5 rounded bg-white text-[#1F6B4F] font-bold border border-[#C2D8C9]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-1 text-[11px] text-[#1F6B4F] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Evidence Linked</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default SquadMemberList
