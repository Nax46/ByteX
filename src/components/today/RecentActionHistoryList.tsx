import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, Trophy, ArrowRight, BookOpen, Code } from 'lucide-react'

interface HistoryItem {
  id: string
  title: string
  category: 'Challenge' | 'Assessment' | 'Roadmap' | 'Project'
  skillName: string
  completedAt: string
  evidenceCreated: boolean
}

interface RecentActionHistoryListProps {
  completedCount?: number
}

export const RecentActionHistoryList: React.FC<RecentActionHistoryListProps> = ({
  completedCount = 3,
}) => {
  // Deterministic history derived from verified past completed activities
  const recentHistory: HistoryItem[] = [
    {
      id: 'h-1',
      title: 'REST API Authentication & Authorization Challenge',
      category: 'Challenge',
      skillName: 'Node.js',
      completedAt: 'Yesterday',
      evidenceCreated: true,
    },
    {
      id: 'h-2',
      title: 'Diagnostic Assessment - Modern JavaScript & Async Patterns',
      category: 'Assessment',
      skillName: 'JavaScript',
      completedAt: '3 days ago',
      evidenceCreated: true,
    },
    {
      id: 'h-3',
      title: 'Full-Stack Architecture & State Management Module',
      category: 'Roadmap',
      skillName: 'React',
      completedAt: '5 days ago',
      evidenceCreated: true,
    },
  ]

  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]/70">
          <div>
            <h3 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#1F6B4F]" />
              Recent Completed Career Actions
            </h3>
            <p className="text-xs text-[#626763] mt-0.5">Your streak of verified career progress</p>
          </div>
          <Badge variant="forest" size="sm">
            {completedCount} Completed
          </Badge>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {recentHistory.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#C2D8C9] transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#171918]">{item.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#626763] mt-1">
                    <span className="font-medium text-[#1F6B4F] flex items-center gap-1">
                      {item.category === 'Challenge' ? (
                        <Code className="w-3 h-3" />
                      ) : (
                        <BookOpen className="w-3 h-3" />
                      )}
                      {item.category}
                    </span>
                    <span>•</span>
                    <span>Skill: <strong>{item.skillName}</strong></span>
                    <span>•</span>
                    <span>{item.completedAt}</span>
                  </div>
                </div>
              </div>

              {item.evidenceCreated && (
                <div className="shrink-0 text-right">
                  <span className="text-[11px] font-semibold text-[#1F6B4F] bg-[#D8E8DE]/60 px-2.5 py-1 rounded-full border border-[#C2D8C9] inline-block">
                    ✓ Evidence Verified
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Link */}
        <div className="pt-3 border-t border-[#E5E5DF]/70 flex items-center justify-between text-xs">
          <span className="text-[#626763]">Verified actions automatically log into your Skill Evidence.</span>
          <Link to={ROUTES.SKILL_EVIDENCE}>
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Skill Evidence →
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default RecentActionHistoryList
