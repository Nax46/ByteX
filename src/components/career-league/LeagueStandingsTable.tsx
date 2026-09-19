import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { LeagueMember } from '@/types/league.types'
import { ShieldCheck, Trophy, Code, FolderGit2 } from 'lucide-react'

interface LeagueStandingsTableProps {
  members: LeagueMember[]
  targetCareer: string
}

export const LeagueStandingsTable: React.FC<LeagueStandingsTableProps> = ({
  members,
  targetCareer,
}) => {
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'DIAMOND':
        return <Badge variant="forest" size="sm">Diamond Tier</Badge>
      case 'GOLD':
        return <Badge variant="warning" size="sm">Gold Tier</Badge>
      case 'SILVER':
        return <Badge variant="outline" size="sm">Silver Tier</Badge>
      default:
        return <Badge variant="outline" size="sm">Bronze Tier</Badge>
    }
  }

  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5DF]/70">
        <div>
          <h2 className="font-heading text-base sm:text-lg font-bold text-[#171918] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#1F6B4F]" />
            {targetCareer} Peer Standings
          </h2>
          <p className="text-xs text-[#626763] mt-0.5">
            Rankings determined by verified evidence, practical drills, projects built, and career readiness scores
          </p>
        </div>
        <div className="text-xs text-[#626763] flex items-center gap-1 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#1F6B4F]" /> Verified Proof-of-Work System
        </div>
      </div>

      {/* Standings Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-[#E5E5DF] text-[11px] font-bold uppercase tracking-wider text-[#626763]">
              <th className="py-3 px-3 w-16">Rank</th>
              <th className="py-3 px-3">Student</th>
              <th className="py-3 px-3">Target Career</th>
              <th className="py-3 px-3 text-center">Readiness %</th>
              <th className="py-3 px-3 text-center">Evidence Proofs</th>
              <th className="py-3 px-3 text-center">Drills & Builds</th>
              <th className="py-3 px-3 text-right">Division Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5DF]/70 text-xs sm:text-sm">
            {members.map((m) => (
              <tr
                key={m.id}
                className={`transition-all ${
                  m.isCurrentUser
                    ? 'bg-[#D8E8DE]/40 font-semibold border-l-4 border-l-[#1F6B4F] shadow-xs'
                    : 'hover:bg-[#F8F7F3]'
                }`}
              >
                {/* Rank */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        m.rank === 1
                          ? 'bg-amber-400 text-amber-950 font-heading shadow-xs'
                          : m.rank === 2
                          ? 'bg-slate-300 text-slate-900 font-heading'
                          : m.rank === 3
                          ? 'bg-amber-700 text-white font-heading'
                          : m.isCurrentUser
                          ? 'bg-[#1F6B4F] text-white'
                          : 'bg-[#F8F7F3] text-[#171918] border border-[#E5E5DF]'
                      }`}
                    >
                      #{m.rank}
                    </span>
                  </div>
                </td>

                {/* Student */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size="sm" />
                    <div>
                      <span className={`font-bold text-[#171918] ${m.isCurrentUser ? 'text-[#1F6B4F]' : ''}`}>
                        {m.name}
                      </span>
                      {m.isCurrentUser && (
                        <span className="text-[10px] bg-[#1F6B4F] text-white px-2 py-0.5 rounded-full font-bold ml-2">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Target Career */}
                <td className="py-3.5 px-3 text-[#626763] font-medium">
                  {m.targetCareer}
                </td>

                {/* Readiness */}
                <td className="py-3.5 px-3 text-center">
                  <span className="font-bold text-[#1F6B4F] font-heading">
                    {m.readinessScore}%
                  </span>
                </td>

                {/* Evidence */}
                <td className="py-3.5 px-3 text-center">
                  <span className="inline-flex items-center gap-1 text-[#171918] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1F6B4F]" />
                    {m.verifiedEvidenceCount}
                  </span>
                </td>

                {/* Drills & Builds */}
                <td className="py-3.5 px-3 text-center">
                  <div className="inline-flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-[#626763]" title="Completed Drills">
                      <Code className="w-3.5 h-3.5 text-[#1F6B4F]" /> {m.completedChallengesCount}
                    </span>
                    <span className="flex items-center gap-1 text-[#626763]" title="Projects Built">
                      <FolderGit2 className="w-3.5 h-3.5 text-[#1F6B4F]" /> {m.projectsBuiltCount}
                    </span>
                  </div>
                </td>

                {/* Tier */}
                <td className="py-3.5 px-3 text-right">
                  {getTierBadge(m.tier)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default LeagueStandingsTable
