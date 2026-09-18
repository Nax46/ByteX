import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { SafeAssessmentAttempt, AssessmentHistoryResponse } from '@/types/assessment.types'
import { ROUTES } from '@/constants/routes'
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  RotateCcw,
  Clock,
  History,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface QuestionItem {
  id: string
  number: number
  total: number
  category: string
  question: string
  explanation: string
  choices: string[]
  correctIndex: number
}

const ASSESSMENT_QUESTIONS: QuestionItem[] = [
  {
    id: 'q7',
    number: 1,
    total: 4,
    category: 'Frontend Development & Responsive Design',
    question:
      'You need to make a web layout fluid across mobile, tablet, and widescreen displays. Which approach represents modern best practice?',
    explanation:
      'Mobile-first design with CSS custom properties and relative units (rem, em, %) prevents layout breaks and minimizes media query bloat.',
    choices: [
      'Use a mobile-first CSS architecture with relative units (rem, em, %) and fluid media queries',
      'Create separate HTML files for desktop and mobile devices and redirect users via JavaScript',
      'Fix all container widths to 1200px and allow mobile browsers to zoom in automatically',
      'Rely exclusively on table layouts with pixel-based min-width constraints',
    ],
    correctIndex: 0,
  },
  {
    id: 'q8',
    number: 2,
    total: 4,
    category: 'Modern JavaScript (ES6+)',
    question:
      'In JavaScript asynchronous programming, what is the primary benefit of async/await over raw Promise chains (.then/.catch)?',
    explanation:
      'Async/await allows asynchronous code to be read and structured sequentially with standard try/catch error handling.',
    choices: [
      'It executes promises in parallel threads using native multi-core CPU workers',
      'It provides synchronous-looking syntax with native try/catch blocks, improving readability and debugging',
      'It prevents network requests from ever timing out or throwing uncaught exceptions',
      'It automatically caches all HTTP API responses in local browser storage',
    ],
    correctIndex: 1,
  },
  {
    id: 'q9',
    number: 3,
    total: 4,
    category: 'Git & Version Control',
    question:
      'When collaborating with a development team, why is creating isolated feature branches preferred over committing directly to main?',
    explanation:
      'Feature branches isolate ongoing work, facilitate thorough pull request code reviews, and keep the main branch stable and deployable.',
    choices: [
      'It permanently conceals unfinished commits from other contributors on GitHub',
      'It isolates new functionality for clean peer review and CI testing without risking main branch stability',
      'It speeds up local hard drive compilation times by halving the repository index size',
      'It bypasses Git merge conflict resolution by automatically overwriting divergent commits',
    ],
    correctIndex: 1,
  },
  {
    id: 'q10',
    number: 4,
    total: 4,
    category: 'Component Architecture & State',
    question:
      'In modern React, what happens when state is lifted up to a shared common ancestor component?',
    explanation:
      'Lifting state up establishes a single source of truth, enabling coordinated data flow between sibling components via props.',
    choices: [
      'It establishes a single source of truth so sibling components can share and synchronize data predictably',
      'It converts functional components back into legacy class components for backward compatibility',
      'It prevents child components from ever re-rendering when props change',
      'It automatically exports the component state to a backend database without an API call',
    ],
    correctIndex: 0,
  },
]

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const paramAttemptId = searchParams.get('attemptId')

  const [attempt, setAttempt] = useState<SafeAssessmentAttempt | null>(null)
  const [isExisting, setIsExisting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<number, number>>({ 0: 0 })
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right')

  // History section state
  const [history, setHistory] = useState<AssessmentHistoryResponse | null>(null)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false)

  const initializeAssessment = useCallback(
    async (isMounted: () => boolean) => {
      setIsLoading(true)
      setError(null)
      setSubmitError(null)

      try {
        if (paramAttemptId) {
          // Fetch specific attempt from route query
          const fetchedAttempt = await assessmentApi.getAttempt(paramAttemptId)
          if (isMounted()) {
            setAttempt(fetchedAttempt)
            if (fetchedAttempt.status === 'SUBMITTED' || fetchedAttempt.status === 'COMPLETED') {
              setIsCompleted(true)
            } else {
              setIsExisting(true)
              setIsCompleted(false)
            }
          }
        } else {
          // Start or resume active attempt via POST /api/assessment/start
          const { attempt: startedAttempt, isExisting: activeFound } =
            await assessmentApi.startAssessment()
          if (isMounted()) {
            setAttempt(startedAttempt)
            setIsExisting(activeFound)
            if (startedAttempt.status === 'SUBMITTED' || startedAttempt.status === 'COMPLETED') {
              setIsCompleted(true)
            } else {
              setIsCompleted(false)
            }
          }
        }
      } catch (err: unknown) {
        if (isMounted()) {
          const message =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: string }).message)
              : 'Unable to initialize assessment session.'
          setError(message)
          console.error('Assessment initialization failed:', err)
        }
      } finally {
        if (isMounted()) {
          setIsLoading(false)
        }
      }
    },
    [paramAttemptId]
  )

  useEffect(() => {
    let mounted = true
    initializeAssessment(() => mounted)
    return () => {
      mounted = false
    }
  }, [initializeAssessment])

  const handleRetry = () => {
    let mounted = true
    initializeAssessment(() => mounted)
  }

  const handleSelectChoice = (choiceIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: choiceIdx,
    }))
  }

  const handleSubmitAssessment = async () => {
    if (!attempt) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Map user answers for backend submission
      const mappedAnswers = Object.entries(answers).map(([idxStr, choiceIdx]) => {
        const qIndex = Number(idxStr)
        const q = ASSESSMENT_QUESTIONS[qIndex]
        return {
          questionId: q ? q.id : `q_${qIndex}`,
          selectedOptionId: `opt_${choiceIdx}`,
        }
      })

      const submittedAttempt = await assessmentApi.submitAssessment(attempt.id, {
        answers: mappedAnswers,
      })

      setAttempt(submittedAttempt)
      setIsCompleted(true)
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to submit assessment. Please try again.'
      setSubmitError(message)
      console.error('Assessment submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentIdx < ASSESSMENT_QUESTIONS.length - 1) {
      setSlideDirection('right')
      setCurrentIdx((prev) => prev + 1)
    } else {
      handleSubmitAssessment()
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setSlideDirection('left')
      setCurrentIdx((prev) => prev - 1)
    } else {
      navigate(ROUTES.DASHBOARD)
    }
  }

  const handleRestart = async () => {
    setIsLoading(true)
    setError(null)
    setSubmitError(null)
    setCurrentIdx(0)
    setAnswers({ 0: 0 })
    setIsCompleted(false)

    if (paramAttemptId) {
      setSearchParams({})
    }

    try {
      const { attempt: newAttempt, isExisting: activeFound } =
        await assessmentApi.startAssessment()
      setAttempt(newAttempt)
      setIsExisting(activeFound)
      if (newAttempt.status === 'SUBMITTED' || newAttempt.status === 'COMPLETED') {
        setIsCompleted(true)
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Unable to start new assessment.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleHistory = async () => {
    const nextState = !showHistory
    setShowHistory(nextState)
    if (nextState && !history) {
      setLoadingHistory(true)
      try {
        const res = await assessmentApi.getHistory(1, 10)
        setHistory(res)
      } catch (err) {
        console.error('Failed to load assessment history:', err)
      } finally {
        setLoadingHistory(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <LoadingState
          message="Preparing your diagnostic skill assessment..."
          minHeight="min-h-[350px]"
        />
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <ErrorState
          title="Assessment Session Unavailable"
          message={error || 'Unable to access assessment attempt.'}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  const currentQ = ASSESSMENT_QUESTIONS[currentIdx]
  const selectedChoice = answers[currentIdx] ?? null
  const progressPercent = (currentQ.number / currentQ.total) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn py-4">
      <PageHeader
        title="Skill Assessment"
        subtitle="Quick diagnostic evaluations to gauge practical ability and calibrate your personal learning roadmap."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Assessment' },
        ]}
      />

      {/* Resumed Attempt Notice */}
      {isExisting && !isCompleted && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#D8E8DE]/70 border border-[#C2D8C9] text-xs text-[#1F6B4F] animate-slideUp">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Resumed in-progress assessment started on{' '}
              {new Date(attempt.startedAt).toLocaleString()}.
            </span>
          </div>
          <Badge variant="forest" size="sm">
            Active Attempt
          </Badge>
        </div>
      )}

      {!isCompleted ? (
        <Card
          glass="elevated"
          className="p-6 sm:p-8 border-white/80 space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Progress Header with animated smooth bar */}
          <div className="space-y-2 pb-4 border-b border-[#E5E5DF]/70">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1F6B4F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1F6B4F] animate-pulse" />
                Question {currentQ.number} of {currentQ.total}
              </span>
              <span className="text-[#626763] font-medium truncate max-w-xs text-right">
                {currentQ.category}
              </span>
            </div>

            <ProgressBar value={progressPercent} size="sm" variant="forest" />
          </div>

          {/* Animated Question Content Container */}
          <div
            key={currentQ.id}
            className={slideDirection === 'right' ? 'animate-slideInRight' : 'animate-slideInLeft'}
          >
            {/* Question Text */}
            <div className="pt-1 pb-4">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#1F6B4F] bg-[#D8E8DE]/80 px-3 py-1 rounded-full mb-2.5 border border-[#C2D8C9]">
                Diagnostic Question #{currentQ.number}
              </span>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-[#171918] leading-relaxed">
                “{currentQ.question}”
              </h2>
            </div>

            {/* 4 Clean Answer Choices with instant micro-animation & frosted glass */}
            <div className="space-y-3 pt-1">
              {currentQ.choices.map((choice, idx) => {
                const isSelected = selectedChoice === idx
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectChoice(idx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-200 flex items-start justify-between gap-3 cursor-pointer group ${
                      isSelected
                        ? 'border-[#1F6B4F] bg-[#D8E8DE]/60 text-[#171918] font-medium shadow-sm scale-[1.008] ring-1 ring-[#1F6B4F]/30'
                        : 'glass-panel border-white/80 text-[#626763] hover:border-[#1F6B4F]/40 hover:text-[#171918] hover:bg-white/95'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-5.5 h-5.5 rounded-full border text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                          isSelected
                            ? 'border-[#1F6B4F] bg-[#1F6B4F] text-white shadow-xs scale-105'
                            : 'border-[#D0D0C8] text-[#626763] bg-white group-hover:border-[#1F6B4F]'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-relaxed">{choice}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5 animate-popIn" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Submission error message if applicable */}
          {submitError && (
            <div className="p-3.5 rounded-xl bg-[#FCE8E6] border border-[#F5D5D3] flex items-center gap-2 text-xs text-[#B83834] animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E5E5DF]/70">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={handlePrev}
              disabled={isSubmitting}
            >
              {currentIdx === 0 ? 'Back to Dashboard' : 'Previous'}
            </Button>

            <Button
              variant="primary"
              size="md"
              disabled={selectedChoice === null || isSubmitting}
              onClick={handleNext}
              rightIcon={
                !isSubmitting ? (
                  <ArrowRight className="w-3.5 h-3.5 group-hover-arrow" />
                ) : undefined
              }
            >
              {isSubmitting
                ? 'Submitting...'
                : currentIdx === ASSESSMENT_QUESTIONS.length - 1
                ? 'Submit Assessment'
                : 'Next Question'}
            </Button>
          </div>
        </Card>
      ) : (
        /* Completed State with Celebration & Real Attempt Metadata */
        <Card
          glass="elevated"
          sheen
          className="p-8 sm:p-12 text-center border-white/80 space-y-7 shadow-2xl animate-slideUp"
        >
          {/* Animated Glowing Ring Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center border border-[#C2D8C9] animate-ringPulse">
              <Award className="w-8 h-8 text-[#1F6B4F]" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E7A84B] text-white flex items-center justify-center text-xs animate-popIn shadow-xs">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-[#1F6B4F] text-xs font-bold uppercase tracking-wider">
              <span>Assessment {attempt.status}</span>
              <span className="font-mono opacity-70">#{attempt.id.slice(-6)}</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Assessment Verified & Calibrated
            </h2>
            <p className="text-sm text-[#626763] max-w-md mx-auto leading-relaxed">
              We've processed your responses across core engineering domains. Your competency profile
              has been recorded in real-time.
            </p>
            {attempt.submittedAt && (
              <p className="text-xs text-[#626763]">
                Submitted on {new Date(attempt.submittedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Real Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto pt-2">
            <div className="p-4 rounded-xl glass-panel border-white/80 space-y-1 hover-lift">
              <span className="text-[11px] text-[#626763] font-medium">Attempt Status</span>
              <div className="font-heading text-xl font-bold text-[#1F6B4F] flex items-baseline gap-1">
                {attempt.status}
              </div>
              <p className="text-[11px] text-[#1F6B4F] font-medium">Verified in database</p>
            </div>

            <div className="p-4 rounded-xl glass-panel border-white/80 space-y-1 hover-lift">
              <span className="text-[11px] text-[#626763] font-medium">Questions Answered</span>
              <div className="font-heading text-xl font-bold text-[#171918] flex items-baseline gap-1">
                {Object.keys(answers).length} of {ASSESSMENT_QUESTIONS.length}
              </div>
              <p className="text-[11px] text-[#1F6B4F] font-medium">100% completion rate</p>
            </div>

            <div className="p-4 rounded-xl glass-panel border-white/80 space-y-1 hover-lift">
              <span className="text-[11px] text-[#626763] font-medium">Next Milestone</span>
              <div className="font-heading text-lg font-bold text-[#171918] truncate pt-0.5">
                Skill Gap Matrix
              </div>
              <p className="text-[11px] text-[#626763]">Stage analysis active</p>
            </div>
          </div>

          {/* Next Steps Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="md"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleRestart}
            >
              Retake Assessment
            </Button>

            <Link to={ROUTES.SKILL_GAP}>
              <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Updated Skill Gap
              </Button>
            </Link>

            <Link to={ROUTES.ROADMAP}>
              <Button variant="secondary" size="md">
                Go to Roadmap
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Collapsible Attempt History */}
      <div className="pt-2">
        <button
          type="button"
          onClick={toggleHistory}
          className="flex items-center gap-2 text-xs font-semibold text-[#1F6B4F] hover:underline cursor-pointer py-2"
        >
          <History className="w-3.5 h-3.5" />
          <span>Past Assessment Attempts</span>
          {showHistory ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showHistory && (
          <div className="mt-3 space-y-2 animate-slideUp">
            {loadingHistory ? (
              <p className="text-xs text-[#626763] py-2">Loading attempt history...</p>
            ) : history && history.attempts.length > 0 ? (
              <div className="space-y-2">
                {history.attempts.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-xl bg-white border border-[#E5E5DF] flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-mono text-[11px] text-[#171918] font-semibold">
                        Attempt #{h.id.slice(-6)}
                      </span>
                      <p className="text-[11px] text-[#626763]">
                        Started: {new Date(h.startedAt).toLocaleString()}
                        {h.submittedAt && ` • Submitted: ${new Date(h.submittedAt).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          h.status === 'SUBMITTED' || h.status === 'COMPLETED'
                            ? 'forest'
                            : h.status === 'IN_PROGRESS'
                            ? 'warning'
                            : 'default'
                        }
                        size="sm"
                      >
                        {h.status}
                      </Badge>
                      {h.id !== attempt?.id && h.status === 'IN_PROGRESS' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchParams({ attemptId: h.id })
                          }}
                        >
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#626763] py-2">No prior assessment attempts found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
