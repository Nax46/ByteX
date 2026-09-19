import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkillBattle, BattleEvaluationResult } from '@/types/battle.types'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, ShieldCheck, Zap, ArrowRight, X, Trophy } from 'lucide-react'

interface BattleResultModalProps {
  battle: SkillBattle | null
  result: BattleEvaluationResult | null
  onClose: () => void
}

export const BattleResultModal: React.FC<BattleResultModalProps> = ({
  battle,
  result,
  onClose,
}) => {
  if (!battle && !result) return null

  const userScore = result?.score ?? battle?.score ?? 88
  const opponentScore = result?.opponentScore ?? battle?.opponentScore ?? 80
  const isWon = (result?.resultOutcome || battle?.resultOutcome) === 'WON'
  const feedbackList = result?.feedback || battle?.feedback || [
    'Passed automated syntax and logic verification tests.',
    'Registered as verified skill evidence proof in your passport.',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <Card className="w-full max-w-lg p-6 bg-white border-[#E5E5DF] space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Outcome Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center mx-auto shadow-xs">
            {isWon ? <Trophy className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
          </div>
          <Badge variant={isWon ? 'forest' : 'outline'} size="md">
            {isWon ? '★ Victory — Battle Won!' : '✓ Battle Completed'}
          </Badge>
          <h3 className="font-heading text-xl font-bold text-[#171918]">
            {battle?.title || 'Battle Evaluation Result'}
          </h3>
          <p className="text-xs text-[#626763]">
            Focus Skill: <strong className="text-[#1F6B4F]">{battle?.skillName || 'Engineering'}</strong>
          </p>
        </div>

        {/* Score Comparison Box */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#1F6B4F] uppercase tracking-wider block">Your Score</span>
            <span className="text-2xl font-bold text-[#1F6B4F] font-heading block">{userScore}%</span>
            <span className="text-[10px] text-[#626763]">Passed Evaluation</span>
          </div>
          <div className="space-y-1 border-l border-[#E5E5DF]">
            <span className="text-xs font-bold text-[#626763] uppercase tracking-wider block">Opponent Benchmark</span>
            <span className="text-2xl font-bold text-[#171918] font-heading block">{opponentScore}%</span>
            <span className="text-[10px] text-[#626763]">{battle?.opponentName || 'Peer Benchmark'}</span>
          </div>
        </div>

        {/* Feedback Bullet Points */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#171918] uppercase tracking-wider block">
            Evaluation Feedback
          </span>
          <div className="space-y-1.5 text-xs text-[#626763]">
            {feedbackList.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#E5E5DF] flex flex-wrap items-center justify-between gap-3">
          <Link to={ROUTES.SKILL_EVIDENCE} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Skill Evidence
            </Button>
          </Link>
          <Link to={ROUTES.TODAY} className="flex-1">
            <Button variant="primary" size="sm" className="w-full text-xs" leftIcon={<Zap className="w-3.5 h-3.5" />} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Today's Action
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default BattleResultModal
