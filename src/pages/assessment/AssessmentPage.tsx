import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { LoadingState } from '@/components/common/LoadingState'
import { Modal } from '@/components/ui/Modal'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { AssessmentQuestion, AssessmentResult } from '@/types/assessment.types'
import { ROUTES } from '@/constants/routes'
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  RotateCcw,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Clock,
  EyeOff,
  Maximize2,
  Minimize2,
  AlertTriangle,
} from 'lucide-react'

const SECONDS_PER_QUESTION = 45
const MAX_VIOLATIONS = 3

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submissionResult, setSubmissionResult] = useState<AssessmentResult | null>(null)
  const [startTime] = useState<number>(() => Date.now())

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

  // Load questions
  useEffect(() => {
    let isMounted = true
    const loadQuestions = async () => {
      setIsLoading(true)
      try {
        const data = await assessmentApi.getQuestions()
        if (isMounted) {
          setQuestions(data || [])
        }
      } catch (err) {
        console.error('Failed to load assessment questions:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadQuestions()
    return () => {
      isMounted = false
    }
  }, [])

  // Force Submission on Max Violations
  const handleForceSubmit = useCallback(async (violations: number) => {
    if (isSubmittingRef.current) return
    setIsSubmitting(true)
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000))
    try {
      const res = await assessmentApi.submitAssessment({
        assessmentId: 'diag_assessment',
        answers,
        timeSpentSeconds,
        tabSwitches: violations,
        violations,
      })
      setSubmissionResult(res)
    } catch (err) {
      console.error('Failed to force submit assessment:', err)
    } finally {
      setIsSubmitting(false)
      setShowViolationModal(false)
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {})
      }
    }
  }, [answers, startTime])

  // Normal Submission
  const handleFinalSubmit = useCallback(async (currentAnswers: Record<string, string>) => {
    if (isSubmittingRef.current) return
    setIsSubmitting(true)
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000))
    try {
      const res = await assessmentApi.submitAssessment({
        assessmentId: 'diag_assessment',
        answers: currentAnswers,
        timeSpentSeconds,
        tabSwitches: violationsCountRef.current,
        violations: violationsCountRef.current,
      })
      setSubmissionResult(res)
    } catch (err) {
      console.error('Failed to submit assessment:', err)
    } finally {
      setIsSubmitting(false)
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {})
      }
    }
  }, [startTime])

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
    if (!hasStarted || submissionResult || isSubmitting || showViolationModal) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this question: auto-advance
          handleNext()
          return SECONDS_PER_QUESTION
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasStarted, submissionResult, isSubmitting, showViolationModal, handleNext])

  // Trigger a Violation Strike
  const triggerViolation = useCallback((reason: string) => {
    if (!hasStarted || submissionResult || isSubmittingRef.current) return

    setLatestViolationReason(reason)
    const nextCount = violationsCountRef.current + 1
    setViolationsCount(nextCount)

    if (nextCount >= MAX_VIOLATIONS) {
      handleForceSubmit(nextCount)
    } else {
      setShowViolationModal(true)
    }
  }, [hasStarted, submissionResult, handleForceSubmit])

  // Anti-Screenshot & Tab Switch Detection
  useEffect(() => {
    if (!hasStarted || submissionResult || isSubmitting) return

    // 1. Tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerViolation('Tab switch detected! You navigated away from the active assessment tab.')
      }
    }

    // 2. Window blur (switching monitors / apps / snipping overlay)
    const handleWindowBlur = () => {
      setIsWindowBlurred(true)
      triggerViolation('Screen focus lost! Navigating outside the assessment window is restricted.')
    }

    const handleWindowFocus = () => {
      setIsWindowBlurred(false)
    }

    // 3. Fullscreen exit detection
    const handleFullscreenChange = () => {
      const inFull = Boolean(document.fullscreenElement)
      setIsFullscreen(inFull)
      if (!inFull && hasStarted && !submissionResult && !isSubmittingRef.current) {
        triggerViolation('Fullscreen exited! Proctored assessments must remain in full screen.')
      }
    }

    // 4. Keyboard Shortcuts for Screenshot, Print, Copy, DevTools
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        flashScreenshotToast('PrintScreen capture blocked under test integrity rules.')
        return
      }

      // Ctrl+Shift+S or Cmd+Shift+S (Snipping Tool)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        flashScreenshotToast('Snipping Tool shortcut blocked.')
        return
      }

      // Mac screenshot combos: Cmd+Shift+3/4/5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault()
        flashScreenshotToast('Screen recording / screenshot shortcut blocked.')
        return
      }

      // Print: Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        flashScreenshotToast('Printing exam questions is disabled.')
        return
      }

      // Copy: Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault()
        flashScreenshotToast('Copying question text is disabled.')
        return
      }

      // View Source or DevTools: Ctrl+U, F12, Ctrl+Shift+I
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
  }, [hasStarted, submissionResult, isSubmitting, triggerViolation])

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
    if (!currentQ) return
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
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

  const handleRestart = () => {
    setHasStarted(false)
    setCurrentIdx(0)
    setAnswers({})
    setSubmissionResult(null)
    setViolationsCount(0)
    setShowViolationModal(false)
    setTimeLeft(SECONDS_PER_QUESTION)
  }

  if (isLoading) {
    return <LoadingState message="Loading diagnostic questions..." minHeight="min-h-[350px]" />
  }

  if (questions.length === 0 && !submissionResult) {
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
  const selectedChoice = currentQ ? answers[currentQ.id] : null
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

      {/* 1. Pre-Assessment Briefing / Proctoring Agreement Screen */}
      {!hasStarted && !submissionResult && (
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
      {hasStarted && !submissionResult && currentQ && (
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
            {/* Left: Security indicators */}
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

            {/* Right: Timer & Fullscreen Toggle */}
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
                {currentQ.category} • {currentQ.difficulty}
              </span>
            </div>
            <ProgressBar value={progressPercent} size="sm" variant="forest" />

            {/* Question countdown line */}
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
          <div key={currentQ.id} className="space-y-5 animate-fadeIn">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#171918] leading-snug">
              {currentQ.text}
            </h3>

            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-xl bg-[#1E201E] text-[#D8E8DE] text-xs font-mono overflow-x-auto select-none border border-slate-700">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* Answer Choices */}
            <div className="space-y-3 pt-1">
              {currentQ.options?.map((opt, optIdx) => {
                const isSelected = selectedChoice === opt.id
                return (
                  <button
                    key={opt.id || optIdx}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
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

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E5E5DF]">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={handlePrev}
            >
              {currentIdx === 0 ? 'Cancel Exam' : 'Previous'}
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                {currentIdx === questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 3. Completed State with Accurate Real Submitted Results */}
      {submissionResult && (
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
            <div className="inline-block px-3.5 py-1 rounded-full bg-[#D8E8DE]/60 text-[#1F6B4F] text-xs font-bold uppercase tracking-wider">
              Diagnostic Complete
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Assessment Verified & Evaluated
            </h2>
            <p className="text-sm text-[#626763] max-w-md mx-auto leading-relaxed">
              Your responses have been evaluated against verified curriculum answer keys. Your demonstrated score and skill gaps have been recorded.
            </p>
          </div>

          {/* Metrics Summary from API */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto pt-2">
            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
              <span className="text-[11px] text-[#626763] font-medium">Demonstrated Score</span>
              <div className="font-heading text-2xl font-bold text-[#1F6B4F] flex items-baseline gap-1">
                <AnimatedCounter value={submissionResult.score} suffix="%" />
              </div>
              <p className="text-[11px] text-[#1F6B4F] font-semibold">
                {submissionResult.correctQuestions} of {submissionResult.totalQuestions} correct
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
              <span className="text-[11px] text-[#626763] font-medium">Proctoring Status</span>
              <div className="font-heading text-sm font-bold pt-1">
                {submissionResult.integrityStatus === 'VERIFIED' ? (
                  <span className="text-[#1F6B4F]">Verified Clean</span>
                ) : submissionResult.integrityStatus === 'WARNING_ISSUED' ? (
                  <span className="text-amber-600">Warnings Noted</span>
                ) : (
                  <span className="text-red-600">Violation Strike</span>
                )}
              </div>
              <p className="text-[11px] text-[#626763]">
                {submissionResult.violations || 0} violation strike(s)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
              <span className="text-[11px] text-[#626763] font-medium">Identified Gap</span>
              <div className="font-heading text-xs font-bold text-[#171918] truncate pt-1">
                {submissionResult.identifiedGaps?.[0] || 'Core Mastery'}
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

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(ROUTES.ASSESSMENT_RESULTS, { state: { result: submissionResult } })}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Full Skill Report
            </Button>

            <Link to={ROUTES.ROADMAP}>
              <Button variant="secondary" size="md">
                Go to Roadmap
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 4. Tab / Screen Switch Proctoring Violation Warning Modal */}
      <Modal
        isOpen={showViolationModal}
        onClose={() => setShowViolationModal(false)}
        title="⚠️ Proctoring Alert: Tab / Screen Switch Detected"
        size="sm"
      >
        <div className="space-y-4 pt-1 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Violation Strike {violationsCount} of {MAX_VIOLATIONS}</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              {latestViolationReason || 'Navigating away from the exam window is strictly forbidden.'}
            </p>
            <p className="text-[11px] text-amber-700 font-semibold pt-1">
              Remaining warnings: {Math.max(0, MAX_VIOLATIONS - violationsCount)}. Reaching {MAX_VIOLATIONS} strikes will immediately terminate and submit your test.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5DF]">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowViolationModal(false)
                setIsWindowBlurred(false)
              }}
            >
              I Understand & Resume Assessment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
