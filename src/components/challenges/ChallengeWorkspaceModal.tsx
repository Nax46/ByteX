import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PracticalChallenge, ChallengeEvaluationResult } from '@/types/challenge.types'
import { challengesApi } from '@/api/endpoints/challenges.api'
import { X, Play, Clock, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Terminal, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface ChallengeWorkspaceModalProps {
  challenge: PracticalChallenge | null
  onClose: () => void
  onCompleted?: (challengeId: string) => void
}

export const ChallengeWorkspaceModal: React.FC<ChallengeWorkspaceModalProps> = ({
  challenge,
  onClose,
  onCompleted,
}) => {
  const [solutionCode, setSolutionCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<ChallengeEvaluationResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (challenge) {
      setSolutionCode(challenge.starterCode || '')
      setEvaluationResult(null)
      setErrorMsg(null)
    }
  }, [challenge])

  if (!challenge) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!solutionCode.trim()) {
      setErrorMsg('Please write your solution implementation before submitting.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      const result = await challengesApi.submitChallenge({
        challengeId: challenge.id,
        solutionCode,
      })
      setEvaluationResult(result)
      if (result.status === 'PASSED' && onCompleted) {
        onCompleted(challenge.id)
      }
    } catch (err) {
      console.error('Failed to submit challenge:', err)
      setErrorMsg('Failed to evaluate solution. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetWorkspace = () => {
    setSolutionCode(challenge.starterCode || '')
    setEvaluationResult(null)
    setErrorMsg(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl border border-[#E5E5DF] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5DF] bg-[#F8F7F3] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="forest" size="sm" className="font-bold">
              <Terminal className="w-3.5 h-3.5 inline mr-1" />
              {challenge.skillTag} Drill
            </Badge>

            <Badge
              variant={challenge.difficulty === 'ADVANCED' ? 'warning' : 'forest'}
              size="sm"
            >
              {challenge.difficulty}
            </Badge>

            <span className="text-xs text-[#626763] font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
              ~{challenge.estimatedMinutes} Mins
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#8E948F] hover:text-[#171918] p-1.5 rounded-lg hover:bg-[#E5E5DF] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split view (Problem Statement on Left, Workspace / Results on Right) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div className="space-y-2">
            <h2 className="font-heading text-xl font-bold text-[#171918]">
              {challenge.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
              {challenge.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Left Column: Problem Details & Requirements */}
            <div className="md:col-span-5 space-y-4">
              <Card className="p-4 bg-[#F8F7F3] border-[#E5E5DF] space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-[#171918] block uppercase tracking-wider text-[11px]">
                    Problem Statement
                  </span>
                  <p className="text-[#626763] leading-relaxed">
                    {challenge.problemStatement}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-[#E5E5DF]">
                  <span className="font-bold text-[#171918] block uppercase tracking-wider text-[11px]">
                    Requirements & Constraints
                  </span>
                  <ul className="list-disc list-inside text-[#626763] space-y-1">
                    {challenge.requirements?.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                {challenge.expectedOutput && (
                  <div className="space-y-1 pt-2 border-t border-[#E5E5DF]">
                    <span className="font-bold text-[#171918] block uppercase tracking-wider text-[11px]">
                      Expected Output Contract
                    </span>
                    <code className="block p-2 rounded bg-white text-[#1F6B4F] text-[11px] font-mono border border-[#E5E5DF]">
                      {challenge.expectedOutput}
                    </code>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column: Code Solution Workspace or Evaluation Results */}
            <div className="md:col-span-7 space-y-4">
              {!evaluationResult ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#171918]">
                      <span>Solution Implementation</span>
                      <button
                        type="button"
                        onClick={handleResetWorkspace}
                        className="text-[11px] text-[#1F6B4F] hover:underline cursor-pointer"
                      >
                        Reset Starter Code
                      </button>
                    </div>

                    <textarea
                      value={solutionCode}
                      onChange={(e) => setSolutionCode(e.target.value)}
                      placeholder="Write your solution implementation code here..."
                      rows={12}
                      className="w-full font-mono text-xs p-3.5 bg-[#171918] text-[#D8E8DE] rounded-xl border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#1F6B4F] resize-y"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" type="button" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      disabled={isSubmitting}
                      className="font-bold shadow-xs"
                      rightIcon={isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    >
                      {isSubmitting ? 'Evaluating Solution...' : 'Submit for Evaluation'}
                    </Button>
                  </div>
                </form>
              ) : (
                /* Evaluation Result Display */
                <Card className="p-5 border-[#1F6B4F]/40 bg-white space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E5E5DF] pb-3">
                    <div className="flex items-center gap-2">
                      {evaluationResult.status === 'PASSED' ? (
                        <CheckCircle2 className="w-5 h-5 text-[#1F6B4F]" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-[#D97706]" />
                      )}
                      <h4 className="font-heading text-base font-bold text-[#171918]">
                        Evaluation Result: {evaluationResult.status === 'PASSED' ? 'PASSED' : 'NEEDS WORK'}
                      </h4>
                    </div>

                    <span className="text-xs font-bold text-[#1F6B4F] bg-[#D8E8DE] px-3 py-1 rounded-md">
                      Score: {evaluationResult.score}%
                    </span>
                  </div>

                  {/* Skills Demonstrated */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#8E948F] uppercase tracking-wider">
                      Skills Demonstrated
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluationResult.skillsDemonstrated?.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded bg-[#E5F3EB] text-[#1F6B4F] text-xs font-semibold border border-[#1F6B4F]/20"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Positive Feedback */}
                  {evaluationResult.feedbackWell?.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] space-y-1 text-xs">
                      <span className="font-bold text-[#1F6B4F] block">
                        What You Did Well:
                      </span>
                      <ul className="list-disc list-inside text-[#626763] space-y-0.5">
                        {evaluationResult.feedbackWell.map((fb, idx) => (
                          <li key={idx}>{fb}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {evaluationResult.feedbackImprove?.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#FEF3C7]/40 border border-[#FEF3C7] space-y-1 text-xs">
                      <span className="font-bold text-[#D97706] block">
                        Areas to Improve:
                      </span>
                      <ul className="list-disc list-inside text-[#626763] space-y-0.5">
                        {evaluationResult.feedbackImprove.map((fb, idx) => (
                          <li key={idx}>{fb}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between gap-2 flex-wrap text-xs">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetWorkspace}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Try Again
                    </Button>

                    <div className="flex items-center gap-2">
                      <Link to={ROUTES.SKILL_EVIDENCE}>
                        <Button variant="outline" size="sm" leftIcon={<Award className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
                          Skill Evidence
                        </Button>
                      </Link>
                      <Button variant="primary" size="sm" onClick={onClose} rightIcon={<Sparkles className="w-3.5 h-3.5" />}>
                        Done
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
