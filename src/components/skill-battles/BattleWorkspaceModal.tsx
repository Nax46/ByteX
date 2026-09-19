import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SkillBattle, BattleEvaluationResult } from '@/types/battle.types'
import { skillBattlesApi } from '@/api/endpoints/battles.api'
import { Clock, CheckCircle2, X, Code, AlertTriangle, Send, Loader2, Target } from 'lucide-react'

interface BattleWorkspaceModalProps {
  battle: SkillBattle | null
  onClose: () => void
  onComplete: (result: BattleEvaluationResult) => void
}

export const BattleWorkspaceModal: React.FC<BattleWorkspaceModalProps> = ({
  battle,
  onClose,
  onComplete,
}) => {
  const [solutionText, setSolutionText] = useState<string>('')
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorNotice, setErrorNotice] = useState<string | null>(null)

  useEffect(() => {
    if (battle) {
      setSolutionText(battle.starterCode || '')
      setSecondsRemaining(battle.timeLimitMinutes * 60)
      setErrorNotice(null)
    }
  }, [battle])

  // Live Timer Countdown
  useEffect(() => {
    if (!battle || secondsRemaining <= 0) return
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [battle, secondsRemaining])

  if (!battle) return null

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const handleSubmit = async () => {
    if (!solutionText.trim()) {
      setErrorNotice('Please provide your implementation before submitting.')
      return
    }

    setIsSubmitting(true)
    setErrorNotice(null)
    try {
      const result = await skillBattlesApi.submitBattle({
        battleId: battle.id,
        solutionText,
      })
      onComplete(result)
    } catch (err) {
      console.error('Battle submission error:', err)
      setErrorNotice('Submission failed. Your code has been preserved. Please retry.')
    } finally {
      setIsLoadingFalse()
    }
  }

  const setIsLoadingFalse = () => {
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <Card className="w-full max-w-3xl p-6 bg-white border-[#E5E5DF] space-y-5 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-[#D8E8DE] text-[#1F6B4F]">
                <Code className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
                Active Skill Battle Workspace
              </span>
              <Badge variant="forest" size="sm">
                {battle.category}
              </Badge>
            </div>
            <h2 className="font-heading text-xl font-bold text-[#171918] mt-1">
              {battle.title}
            </h2>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-bold text-sm shrink-0">
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{formatTime(secondsRemaining)} Remaining</span>
          </div>
        </div>

        {/* Error Notice */}
        {errorNotice && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-700" />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Problem & Requirements Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-6 space-y-3">
            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F] flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Problem Statement
              </span>
              <p className="text-xs text-[#171918] leading-relaxed">
                {battle.problemStatement}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#626763]">
                Requirements Checklist
              </span>
              <ul className="space-y-1.5 text-xs text-[#626763]">
                {battle.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6B4F] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Code Solution Editor Area */}
          <div className="md:col-span-6 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[#171918]">Your Implementation Solution</label>
              <span className="text-[#626763]">Target: {battle.skillName}</span>
            </div>
            <textarea
              rows={12}
              value={solutionText}
              onChange={(e) => setSolutionText(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl border border-[#E5E5DF] bg-[#1E1E1E] text-green-400 focus:outline-none focus:ring-2 focus:ring-[#1F6B4F] leading-relaxed resize-none"
              placeholder="// Write your code or solution here..."
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-[#E5E5DF] flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel Battle
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={isSubmitting}
            leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          >
            {isSubmitting ? 'Evaluating Submission...' : 'Submit Battle Solution'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default BattleWorkspaceModal
