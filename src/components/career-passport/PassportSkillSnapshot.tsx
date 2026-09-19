import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import { Sparkles, ArrowRight, Target } from 'lucide-react'
import { Skill, SkillGap } from '@/types/skill.types'

interface PassportSkillSnapshotProps {
  skills: Skill[]
  gaps: SkillGap[]
  targetRole: string
}

export const PassportSkillSnapshot: React.FC<PassportSkillSnapshotProps> = ({
  skills,
  gaps,
  targetRole,
}) => {
  // Map gaps into a map for fast lookup of target level and gap amount
  const gapMap = new Map<string, SkillGap>()
  gaps.forEach((g) => {
    gapMap.set(g.skillName.toLowerCase(), g)
  })

  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]/70">
        <div>
          <h2 className="font-heading text-base sm:text-lg font-bold text-[#171918] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1F6B4F]" />
            Verified Skill Competency Snapshot
          </h2>
          <p className="text-xs text-[#626763] mt-0.5">
            Current proficiency vs. {targetRole} industry benchmark targets
          </p>
        </div>
        <Link to={ROUTES.SKILLS} className="print:hidden">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Full Skill Matrix
          </Button>
        </Link>
      </div>

      {skills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => {
            const gapInfo = gapMap.get(skill.name.toLowerCase())
            const targetScore = gapInfo?.targetLevel ?? skill.targetLevel ?? 90
            const currentScore = skill.progress || skill.currentLevel || 50
            const gapAmount = gapInfo?.gap ?? Math.max(0, targetScore - currentScore)

            return (
              <div
                key={skill.id || skill.name}
                className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-2.5 hover:border-[#C2D8C9] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm font-bold text-[#171918]">
                    {skill.name}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-[#1F6B4F]">{currentScore}% Current</span>
                    <span className="text-[#626763]">/ {targetScore}% Target</span>
                  </div>
                </div>

                <ProgressBar
                  value={currentScore}
                  variant={currentScore >= 75 ? 'forest' : currentScore >= 50 ? 'primary' : 'warning'}
                  size="sm"
                />

                <div className="flex items-center justify-between text-[11px] text-[#626763] pt-0.5">
                  <span className="capitalize text-[#626763]">
                    Category: <strong>{skill.category || 'Engineering'}</strong>
                  </span>
                  {gapAmount > 0 ? (
                    <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Gap: {gapAmount} pts
                    </span>
                  ) : (
                    <span className="text-[#1F6B4F] font-semibold bg-[#D8E8DE] px-2 py-0.5 rounded border border-[#C2D8C9]">
                      ✓ Target Met
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-[#626763] space-y-3">
          <Target className="w-8 h-8 text-[#1F6B4F] mx-auto opacity-70" />
          <p>No verified skill scores recorded yet. Complete assessments or challenges to populate your passport.</p>
          <Link to={ROUTES.ASSESSMENT} className="print:hidden">
            <Button variant="outline" size="sm">
              Take Diagnostic Assessment
            </Button>
          </Link>
        </div>
      )}
    </Card>
  )
}

export default PassportSkillSnapshot
