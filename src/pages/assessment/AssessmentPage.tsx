import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { Modal } from '@/components/ui/Modal'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import {
  AssessmentQuestion,
  AssessmentResult,
  SafeAssessmentAttempt,
  AssessmentHistoryResponse,
} from '@/types/assessment.types'
import { DEMO_ASSESSMENT_QUESTIONS } from '@/data/demo.assessment'
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
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  EyeOff,
  Maximize2,
  Minimize2,
  AlertTriangle,
} from 'lucide-react'

const SECONDS_PER_QUESTION = 45
const MAX_VIOLATIONS = 3

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const paramAttemptId = searchParams.get('attemptId')

  // Real backend attempt state (Task 13)
  const [attempt, setAttempt] = useState<SafeAssessmentAttempt | null>(null)
  const [isExisting, setIsExisting] = useState<boolean>(false)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Question & Diagnostic state
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submissionResult, setSubmissionResult] = useState<AssessmentResult | null>(null)
  const [startTime] = useState<number>(() => Date.now())

  // History section state (Task 13)
  const [history, setHistory] = useState<AssessmentHistoryResponse | null>(null)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false)

  // Proctoring & Security State
  const [timeLeft, setTimeLeft] = useState<number>(SECONDS_PER_QUESTION)
  const [violationsCount, setViolationsCount] = useState<number>(0)
  const [showViolationModal, setShowViolationModal] = useState<boolean>(false)
  const [latestViolationReason, setLatestViolationReason] = useState<string>('')
  const [isWindowBlurred, setIsWindowBlurred] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [screenshotToast, setScreenshotToast] = useState<string | null>(null)

  const isSubmittingRef = useRef(false)
  isSubmittingRef.current = isSubmitting

  const violationsCountRef = useRef(violationsCount)
  violationsCountRef.current = violationsCount

  // Load real attempt and questions on mount
  const initializeAssessment = useCallback(
    async (isMounted: () => boolean) => {
      setIsLoading(true)
      setError(null)
      setSubmitError(null)

      try {
        // 1. Fetch questions
        const fetchedQuestions = await assessmentApi.getQuestions()
        if (isMounted()) {
          setQuestions(
            fetchedQuestions && fetchedQuestions.length > 0
              ? fetchedQuestions
              : DEMO_ASSESSMENT_QUESTIONS
          )
        }

        // 2. Fetch or start real attempt
        if (paramAttemptId) {
          const fetchedAttempt = await assessmentApi.getAttempt(paramAttemptId)
          if (isMounted()) {
            setAttempt(fetchedAttempt)
            if (fetchedAttempt.status === 'SUBMITTED' || fetchedAttempt.status === 'COMPLETED') {
              setIsCompleted(true)
              const latestResult = await assessmentApi.getLatestResult()
              if (isMounted()) setSubmissionResult(latestResult)
            } else {
              setIsExisting(true)
              setIsCompleted(false)
            }
          }
        } else {
          const { attempt: startedAttempt, isExisting: activeFound } =
            await assessmentApi.startAssessment()
          if (isMounted()) {
            setAttempt(startedAttempt)
            setIsExisting(activeFound)
            if (startedAttempt.status === 'SUBMITTED' || startedAttempt.status === 'COMPLETED') {
              setIsCompleted(true)
              const latestResult = await assessmentApi.getLatestResult()
              if (isMounted()) setSubmissionResult(latestResult)
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

  // Force Submission on Max Violations
  const handleForceSubmit = useCallback(
    async (violations: number) => {
      if (isSubmittingRef.current) return
      setIsSubmitting(true)
      setSubmitError(null)

      const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000))
      const mappedAnswers = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }))

      try {
        if (attempt?.id) {
          const submittedAttempt = await assessmentApi.submitAssessment(attempt.id, {
            answers: mappedAnswers,
          })
          setAttempt(submittedAttempt)
        }

        const res = await assessmentApi.submitAssessment({
          assessmentId: attempt?.id || 'diag_assessment',
          answers,
          timeSpentSeconds,
          tabSwitches: violations,
          violations,
        })
        setSubmissionResult(res as AssessmentResult)
        setIsCompleted(true)
      } catch (err) {
        console.error('Failed to force submit assessment:', err)
      } finally {
        setIsSubmitting(false)
        setShowViolationModal(false)
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {})
        }
      }
    },
    [answers, attempt, startTime]
  )

  // Normal Submission
  const handleFinalSubmit = useCallback(
    async (currentAnswers: Record<string, string>) => {
      if (isSubmittingRef.current) return
      setIsSubmitting(true)
      setSubmitError(null)

      const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000))
      const mappedAnswers = Object.entries(currentAnswers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }))

      try {
        if (attempt?.id) {
          const submittedAttempt = await assessmentApi.submitAssessment(attempt.id, {
            answers: mappedAnswers,
          })
          setAttempt(submittedAttempt)
        }

        const res = await assessmentApi.submitAssessment({
          assessmentId: attempt?.id || 'diag_assessment',
          answers: currentAnswers,
          timeSpentSeconds,
          tabSwitches: violationsCountRef.current,
          violations: violationsCountRef.current,
        })
        setSubmissionResult(res as AssessmentResult)
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
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {})
        }
      }
    },
    [attempt, startTime]
  )

  // Next Question or Submit
  const handleNext = useCallback(async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setTimeLeft(SECONDS_PER_QUESTION)
    } else {
      await handleFinalSubmit(answers)
    }
  }, [currentIdx, questions.length, handleFinalSubmit, answers])

  // Per-Question Countdown Timer
  useEffect(() => {
    if (!hasStarted || submissionResult || isCompleted || isSubmitting || showViolationModal) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext()
          return SECONDS_PER_QUESTION
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasStarted, submissionResult, isCompleted, isSubmitting, showViolationModal, handleNext])

  // Trigger a Violation Strike
  const triggerViolation = useCallback(
    (reason: string) => {
      if (!hasStarted || submissionResult || isCompleted || isSubmittingRef.current) return

      setLatestViolationReason(reason)
      const nextCount = violationsCountRef.current + 1
      setViolationsCount(nextCount)

      if (nextCount >= MAX_VIOLATIONS) {
        handleForceSubmit(nextCount)
      } else {
        setShowViolationModal(true)
      }
    },
    [hasStarted, submissionResult, isCompleted, handleForceSubmit]
  )

  // Anti-Screenshot & Tab Switch Detection
  useEffect(() => {
    if (!hasStarted || submissionResult || isCompleted || isSubmitting) return

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerViolation('Tab switch detected! You navigated away from the active assessment tab.')
      }
    }

    const handleWindowBlur = () => {
      setIsWindowBlurred(true)
      triggerViolation('Screen focus lost! Navigating outside the assessment window is restricted.')
    }

    const handleWindowFocus = () => {
      setIsWindowBlurred(false)
    }

    const handleFullscreenChange = () => {
      const inFull = Boolean(document.fullscreenElement)
      setIsFullscreen(inFull)
      if (!inFull && hasStarted && !submissionResult && !isCompleted && !isSubmittingRef.current) {
        triggerViolation('Fullscreen exited! Proctored assessments must remain in full screen.')
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        flashScreenshotToast('PrintScreen capture blocked under test integrity rules.')
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        flashScreenshotToast('Snipping Tool shortcut blocked.')
        return
      }

      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault()
        flashScreenshotToast('Screen recording / screenshot shortcut blocked.')
        return
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        flashScreenshotToast('Printing exam questions is disabled.')
        return
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault()
        flashScreenshotToast('Copying question text is disabled.')
        return
      }

      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'i' || e.key === 'I'))
      ) {
        e.preventDefault()
        flashScreenshotToast('Source viewing and developer tools are disabled.')
        return
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [hasStarted, submissionResult, isCompleted, isSubmitting, triggerViolation])

  const flashScreenshotToast = (msg: string) => {
    setScreenshotToast(msg)
    setTimeout(() => setScreenshotToast(null), 3500)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  const handleStartExam = async (enterFull: boolean) => {
    if (enterFull) {
      try {
        await document.documentElement.requestFullscreen?.()
        setIsFullscreen(true)
      } catch {
        // Browser rejected or permission denied; proceed anyway
      }
    }
    setHasStarted(true)
    setCurrentIdx(0)
    setTimeLeft(SECONDS_PER_QUESTION)
    setViolationsCount(0)
  }

  const handleSelectOption = (optionId: string) => {
    const q = questions[currentIdx]
    if (!q) return
    const qId = q.id || q._id || `q_${currentIdx}`
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionId,
    }))
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1)
      setTimeLeft(SECONDS_PER_QUESTION)
    } else {
      if (window.confirm('Are you sure you want to leave the assessment? Your progress will be discarded.')) {
        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
        navigate(ROUTES.DASHBOARD)
      }
    }
  }

  const handleRestart = async () => {
    setIsLoading(true)
    setError(null)
    setSubmitError(null)
    setHasStarted(false)
    setCurrentIdx(0)
    setAnswers({})
    setSubmissionResult(null)
    setIsCompleted(false)
    setViolationsCount(0)
    setShowViolationModal(false)
    setTimeLeft(SECONDS_PER_QUESTION)

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

  if (questions.length === 0 && !submissionResult && !isCompleted) {
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
        <Card className="p-8 text-center space-y-4 bg-white border-[#E5E5DF]">
          <HelpCircle className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No assessment questions available</h3>
          <p className="text-xs text-[#626763] max-w-md mx-auto">
            Assessment questions for your selected domain are currently being prepared by the curriculum system.
          </p>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="outline" size="sm">
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentIdx]
  const currentQId = currentQ?.id || currentQ?._id || `q_${currentIdx}`
  const selectedChoice = currentQ ? answers[currentQId] : null
  const progressPercent = currentQ ? Math.round(((currentIdx + 1) / questions.length) * 100) : 100
  const timerPercent = Math.round((timeLeft / SECONDS_PER_QUESTION) * 100)

  return (
    <div
      className="max-w-3xl mx-auto space-y-6 animate-fadeIn py-4 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Toast alert for screenshot / copy prevention */}
      {screenshotToast && (
        <div className="fixed top-6 right-6 z-[99999] bg-red-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fadeIn border border-red-500">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-300" />
          <span>{screenshotToast}</span>
        </div>
      )}

      <PageHeader
        title="Diagnostic Skill Assessment"
        subtitle="Calibrate your verified abilities across core engineering benchmarks with real-time proctoring."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Assessment' },
        ]}
      />

      {/* Resumed Attempt Notice (Task 13) */}
      {isExisting && !isCompleted && !submissionResult && (
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

      {/* 1. Pre-Assessment Briefing / Proctoring Agreement Screen */}
      {!hasStarted && !submissionResult && !isCompleted && (
        <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF] shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1F6B4F]/10 border border-[#1F6B4F]/20 text-[#1F6B4F] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-[#171918]">
                Proctored Assessment Instructions
              </h2>
              <p className="text-xs text-[#626763] mt-1">
                Please review the integrity guidelines below before beginning your examination.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171918]">
                <Clock className="w-4 h-4 text-[#1F6B4F]" />
                <span>Fixed Question Timer</span>
              </div>
              <p className="text-[11px] text-[#626763] leading-relaxed">
                You have <strong>{SECONDS_PER_QUESTION} seconds</strong> per question. When the timer expires, your response is locked and the exam automatically advances.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171918]">
                <ShieldAlert className="w-4 h-4 text-[#D9534F]" />
                <span>Anti-Screenshot Protection</span>
              </div>
              <p className="text-[11px] text-[#626763] leading-relaxed">
                Screenshots, screen snipping tools, copy shortcuts, and print keys are blocked to preserve evaluation integrity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171918]">
                <EyeOff className="w-4 h-4 text-[#E7A84B]" />
                <span>Tab & Screen Switch Lock</span>
              </div>
              <p className="text-[11px] text-[#626763] leading-relaxed">
                Navigating away from this tab or minimizing the window triggers violation strikes. Reaching <strong>3 strikes</strong> automatically submits your test.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171918]">
                <Award className="w-4 h-4 text-[#1F6B4F]" />
                <span>Accurate Skill Calibration</span>
              </div>
              <p className="text-[11px] text-[#626763] leading-relaxed">
                Your score and personalized roadmap adjustments are computed directly from verified answer keys across {questions.length} questions.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#D8E8DE]/40 border border-[#D8E8DE] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1F6B4F]">Total Questions: {questions.length}</span>
            <span className="text-[#171918]">Estimated Time: ~{Math.ceil((questions.length * SECONDS_PER_QUESTION) / 60)} mins</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#E5E5DF]">
            <Button
              variant="outline"
              size="md"
              onClick={() => handleStartExam(false)}
            >
              Start in Standard Mode
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Maximize2 className="w-4 h-4" />}
              onClick={() => handleStartExam(true)}
            >
              Start in Fullscreen Proctored Mode
            </Button>
          </div>
        </Card>
      )}

      {/* 2. Active Assessment Question Card */}
      {hasStarted && !submissionResult && !isCompleted && currentQ && (
        <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF] shadow-xl relative overflow-hidden space-y-6">
          {/* Out-of-Focus Privacy Shield */}
          {isWindowBlurred && (
            <div className="absolute inset-0 z-40 bg-[#171918]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-fadeIn">
              <EyeOff className="w-12 h-12 text-[#E7A84B] mb-3 animate-pulse" />
              <h4 className="text-lg font-bold">Assessment Content Hidden</h4>
              <p className="text-xs text-[#8E948F] max-w-sm mt-1">
                Window focus was lost. Click anywhere in this window to resume your examination.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setIsWindowBlurred(false)}
              >
                Return to Assessment
              </Button>
            </div>
          )}

          {/* Top Proctoring Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E5E5DF]">
            <div className="flex items-center gap-2">
              <Badge variant="forest" size="sm" className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Proctored Exam Active</span>
              </Badge>

              <Badge
                variant={violationsCount === 0 ? 'outline' : violationsCount === 1 ? 'warning' : 'danger'}
                size="sm"
                className="flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Violations: {violationsCount}/{MAX_VIOLATIONS}</span>
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold transition-colors ${
                  timeLeft <= 10
                    ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                    : timeLeft <= 20
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-[#D8E8DE]/40 border-[#D8E8DE] text-[#1F6B4F]'
                }`}
                title="Time remaining for this question"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>00:{timeLeft.toString().padStart(2, '0')}</span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg border border-[#E5E5DF] text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Question Progression Bar & Per-Question Timer Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1F6B4F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1F6B4F] animate-pulse" />
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-[#626763] font-medium truncate max-w-xs text-right">
                {currentQ.category} {currentQ.difficulty ? `• ${currentQ.difficulty}` : ''}
              </span>
            </div>

            <ProgressBar value={progressPercent} size="sm" variant="forest" />

            <div className="w-full bg-[#F1EFEA] h-1 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-[#1F6B4F]'
                }`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>
          </div>

          {/* Question Content */}
          <div key={currentQId} className="space-y-5 animate-fadeIn">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#171918] leading-snug">
              {currentQ.text || currentQ.question}
            </h3>

            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-xl bg-[#1E201E] text-[#D8E8DE] text-xs font-mono overflow-x-auto select-none border border-slate-700">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* Answer Choices */}
            <div className="space-y-3 pt-1">
              {currentQ.options?.map((opt, optIdx) => {
                const optId = opt.id || opt.optionId || String(optIdx)
                const isSelected = selectedChoice === optId
                return (
                  <button
                    key={optId}
                    type="button"
                    onClick={() => handleSelectOption(optId)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-150 flex items-start justify-between gap-4 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#D8E8DE]/60 border-2 border-[#1F6B4F] text-[#171918] shadow-xs'
                        : 'bg-[#F8F7F3] border border-[#E5E5DF] text-[#626763] hover:text-[#171918] hover:border-[#D0D0C8] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#1F6B4F] text-white'
                            : 'bg-white border border-[#E5E5DF] text-[#626763]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {opt.text}
                      </span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5" />
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
          <div className="flex items-center justify-between pt-6 border-t border-[#E5E5DF]">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={handlePrev}
              disabled={isSubmitting}
            >
              {currentIdx === 0 ? 'Cancel Exam' : 'Previous'}
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                disabled={selectedChoice === null || isSubmitting}
                isLoading={isSubmitting}
                onClick={handleNext}
                rightIcon={
                  !isSubmitting ? (
                    <ArrowRight className="w-3.5 h-3.5 group-hover-arrow" />
                  ) : undefined
                }
              >
                {currentIdx === questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 3. Completed State with Real Attempt & Diagnostic Evaluation Results */}
      {(isCompleted || submissionResult) && (
        <Card className="p-8 sm:p-12 text-center bg-white border-[#E5E5DF] space-y-7 shadow-xl animate-fadeIn">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center border border-[#C2D8C9]">
              <Award className="w-8 h-8 text-[#1F6B4F]" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E7A84B] text-white flex items-center justify-center text-xs shadow-xs">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D8E8DE]/60 text-[#1F6B4F] text-xs font-bold uppercase tracking-wider">
              <span>Assessment {attempt?.status || 'SUBMITTED'}</span>
              {attempt?.id && (
                <span className="font-mono opacity-70">#{attempt.id.slice(-6)}</span>
              )}
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Assessment Verified & Evaluated
            </h2>
            <p className="text-sm text-[#626763] max-w-md mx-auto leading-relaxed">
              Your responses have been evaluated against verified curriculum answer keys. Your demonstrated score and skill gaps have been recorded in the database.
            </p>
            {attempt?.submittedAt && (
              <p className="text-xs text-[#626763]">
                Submitted on {new Date(attempt.submittedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto pt-2">
            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
              <span className="text-[11px] text-[#626763] font-medium">Demonstrated Score</span>
              <div className="font-heading text-2xl font-bold text-[#1F6B4F] flex items-baseline gap-1">
                {submissionResult ? (
                  <AnimatedCounter value={submissionResult.score} suffix="%" />
                ) : (
                  <span>Verified</span>
                )}
              </div>
              <p className="text-[11px] text-[#1F6B4F] font-semibold">
                {submissionResult
                  ? `${submissionResult.correctQuestions} of ${submissionResult.totalQuestions} correct`
                  : 'Recorded in database'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
              <span className="text-[11px] text-[#626763] font-medium">Proctoring Status</span>
              <div className="font-heading text-sm font-bold pt-1">
                {submissionResult?.integrityStatus === 'VERIFIED' || violationsCount === 0 ? (
                  <span className="text-[#1F6B4F]">Verified Clean</span>
                ) : submissionResult?.integrityStatus === 'WARNING_ISSUED' || violationsCount === 1 ? (
                  <span className="text-amber-600">Warnings Noted</span>
                ) : (
                  <span className="text-red-600">Violation Strike</span>
                )}
              </div>
              <p className="text-[11px] text-[#626763]">
                {submissionResult?.violations ?? violationsCount} violation strike(s)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
              <span className="text-[11px] text-[#626763] font-medium">Next Milestone</span>
              <div className="font-heading text-xs font-bold text-[#171918] truncate pt-1">
                {submissionResult?.identifiedGaps?.[0] || 'Skill Gap Matrix'}
              </div>
              <p className="text-[11px] text-[#626763]">Roadmap updated</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="md"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleRestart}
            >
              Retake Assessment
            </Button>

            {submissionResult && (
              <Button
                variant="primary"
                size="md"
                onClick={() =>
                  navigate(ROUTES.ASSESSMENT_RESULTS, { state: { result: submissionResult } })
                }
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Full Skill Report
              </Button>
            )}

            <Link to={ROUTES.SKILL_GAP}>
              <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
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

      {/* 4. Collapsible Attempt History (Task 13) */}
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
                    className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] flex items-center justify-between text-xs hover:bg-[#F1EFEA] transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#171918]">Attempt #{h.id.slice(-6)}</span>
                        <Badge
                          variant={
                            h.status === 'COMPLETED' || h.status === 'SUBMITTED'
                              ? 'forest'
                              : h.status === 'IN_PROGRESS'
                              ? 'warning'
                              : 'outline'
                          }
                          size="sm"
                        >
                          {h.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[#626763]">
                        Started: {new Date(h.startedAt).toLocaleString()}
                        {h.submittedAt && ` • Submitted: ${new Date(h.submittedAt).toLocaleString()}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {h.status === 'IN_PROGRESS' ? (
                        <Link to={`${ROUTES.ASSESSMENT}?attemptId=${h.id}`}>
                          <Button variant="primary" size="sm">
                            Resume
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`${ROUTES.ASSESSMENT}?attemptId=${h.id}`}>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#626763] py-2">No past attempts found.</p>
            )}
          </div>
        )}
      </div>

      {/* Violation Warning Modal */}
      <Modal
        isOpen={showViolationModal}
        onClose={() => setShowViolationModal(false)}
        title="Security Violation Detected"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">Strike {violationsCount} of {MAX_VIOLATIONS}</p>
              <p className="text-[11px] mt-0.5">{latestViolationReason}</p>
            </div>
          </div>
          <p className="text-xs text-[#626763] leading-relaxed">
            Please remain in the assessment window in full screen until you have submitted your answers.
            Reaching <strong>{MAX_VIOLATIONS} violations</strong> will automatically submit your assessment.
          </p>
          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowViolationModal(false)}
            >
              I Understand, Resume Exam
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
