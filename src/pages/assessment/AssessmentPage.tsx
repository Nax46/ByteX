import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { AssessmentQuestion, AssessmentResult } from '@/types/assessment.types'
import { useAuth } from '@/hooks/useAuth'
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
  AlertCircle,
  Briefcase,
} from 'lucide-react'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

const SECONDS_PER_QUESTION = 45
const MAX_VIOLATIONS = 3

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const targetRole = user?.careerGoal || user?.targetCareer || DEFAULT_CAREER_GOAL

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false)

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
    setSubmissionError(null)
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000))
    try {
      const res = await assessmentApi.submitAssessment({
        assessmentId: 'diag_assessment',
        answers,
        timeSpentSeconds,
        tabSwitches: violations,
        violations,
      })
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {})
      }
      navigate(ROUTES.ASSESSMENT_RESULTS, { state: { result: res } })
    } catch (err) {
      console.error('Failed to force submit assessment:', err)
      setSubmissionError('Automatic submission failed. Your answers have been preserved. Please try submitting again.')
    } finally {
      setIsSubmitting(false)
      setShowViolationModal(false)
    }
  }, [answers, startTime, navigate])

  // Normal Submission
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmittingRef.current) return
    setIsSubmitting(true)
    setSubmissionError(null)
    setShowSubmitConfirm(false)
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000))
    try {
      const res = await assessmentApi.submitAssessment({
        assessmentId: 'diag_assessment',
        answers,
        timeSpentSeconds,
        tabSwitches: violationsCountRef.current,
        violations: violationsCountRef.current,
      })
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {})
      }
      navigate(ROUTES.ASSESSMENT_RESULTS, { state: { result: res } })
    } catch (err) {
      console.error('Failed to submit assessment:', err)
      setSubmissionError('Failed to submit assessment. Your answers are preserved. Please click Try Again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [answers, startTime, navigate])

  const currentQ = questions[currentIdx]
  const qKey = currentQ ? (currentQ.id || currentQ._id || String(currentIdx)) : ''
  const selectedChoice = currentQ ? answers[qKey] : null

  // Next Question or Open Confirm Modal
  const handleNext = useCallback(() => {
    setValidationError(null)
    if (!selectedChoice) {
      setValidationError('Please select an answer before proceeding.')
      return
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1)
      setTimeLeft(SECONDS_PER_QUESTION)
    } else {
      setShowSubmitConfirm(true)
    }
  }, [currentIdx, questions.length, selectedChoice])

  // Per-Question Countdown Timer
  useEffect(() => {
    if (!hasStarted || isSubmitting || showViolationModal || showSubmitConfirm) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this question: auto-advance or open confirm
          if (currentIdx < questions.length - 1) {
            setCurrentIdx((idx) => idx + 1)
            return SECONDS_PER_QUESTION
          } else {
            setShowSubmitConfirm(true)
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [hasStarted, isSubmitting, showViolationModal, showSubmitConfirm, currentIdx, questions.length])

  // Trigger a Violation Strike
  const triggerViolation = useCallback((reason: string) => {
    if (!hasStarted || isSubmittingRef.current) return

    setLatestViolationReason(reason)
    const nextCount = violationsCountRef.current + 1
    setViolationsCount(nextCount)

    if (nextCount >= MAX_VIOLATIONS) {
      handleForceSubmit(nextCount)
    } else {
      setShowViolationModal(true)
    }
  }, [hasStarted, handleForceSubmit])

  // Anti-Screenshot & Tab Switch Detection
  useEffect(() => {
    if (!hasStarted || isSubmitting) return

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
      if (!inFull && hasStarted && !isSubmittingRef.current) {
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
  }, [hasStarted, isSubmitting, triggerViolation])

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
        // Fullscreen rejected or denied
      }
    }
    setHasStarted(true)
    setCurrentIdx(0)
    setTimeLeft(SECONDS_PER_QUESTION)
    setViolationsCount(0)
    setValidationError(null)
  }

  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return
    const key = currentQ.id || currentQ._id || String(currentIdx)
    setAnswers((prev) => ({
      ...prev,
      [key]: optionId,
    }))
    setValidationError(null)
  }

  const handlePrev = () => {
    setValidationError(null)
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

  if (isLoading) {
    return <LoadingState message="Loading diagnostic questions..." minHeight="min-h-[350px]" />
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn py-4">
        <PageHeader
          title="Skill Assessment"
          subtitle="Diagnostic evaluations measuring your practical technical capabilities for your target career."
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.DASHBOARD },
            { label: 'Assessment' },
          ]}
        />
        <Card className="p-8 text-center space-y-4 bg-white border-[#E5E5DF]">
          <HelpCircle className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No assessment questions available</h3>
          <p className="text-xs text-[#626763] max-w-md mx-auto">
            Assessment questions for your selected domain are currently being prepared. Select or change your target career to explore matching tracks.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to={ROUTES.CAREERS}>
              <Button variant="outline" size="sm">
                Explore Careers
              </Button>
            </Link>
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="primary" size="sm">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const answeredCount = Object.keys(answers).length
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

      {/* Target Career Context Header */}
      <PageHeader
        title="Diagnostic Skill Assessment"
        subtitle={`Measuring your practical capabilities for your target career: ${targetRole}`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Assessment' },
        ]}
      />

      {/* 1. Pre-Assessment Briefing / Career Context Anchor */}
      {!hasStarted && (
        <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF] shadow-md space-y-6 animate-fadeIn">
          {/* Target Career Anchor Badge */}
          <div className="p-4 rounded-xl bg-[#D8E8DE]/50 border border-[#1F6B4F]/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F6B4F] text-white flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F6B4F] block">
                  Target Career Benchmark
                </span>
                <h3 className="font-heading text-base font-bold text-[#171918]">
                  {targetRole} Diagnostic
                </h3>
              </div>
            </div>

            <Link to={ROUTES.CAREERS}>
              <Button variant="outline" size="sm" className="text-xs">
                Change Career
              </Button>
            </Link>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1F6B4F]/10 border border-[#1F6B4F]/20 text-[#1F6B4F] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-[#171918]">
                Proctored Assessment Guidelines
              </h2>
              <p className="text-xs text-[#626763] mt-1">
                Please review the evaluation rules below before starting your diagnostic exam.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171918]">
                <Clock className="w-4 h-4 text-[#1F6B4F]" />
                <span>Fixed Question Timer</span>
              </div>
              <p className="text-[11px] text-[#626763] leading-relaxed">
                You have <strong>{SECONDS_PER_QUESTION} seconds</strong> per question. When timer expires, current response is stored and exam advances.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171918]">
                <ShieldAlert className="w-4 h-4 text-[#D9534F]" />
                <span>Anti-Screenshot Protection</span>
              </div>
              <p className="text-[11px] text-[#626763] leading-relaxed">
                Screenshots, snipping shortcuts, copy commands, and print keys are restricted to protect evaluation integrity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171918]">
                <EyeOff className="w-4 h-4 text-[#E7A84B]" />
                <span>Tab & Window Lock</span>
              </div>
              <p className="text-[11px] text-[#626763] leading-relaxed">
                Navigating away from this tab triggers violation strikes. Reaching <strong>3 strikes</strong> automatically submits your test.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171918]">
                <Award className="w-4 h-4 text-[#1F6B4F]" />
                <span>Career Skill Calibration</span>
              </div>
              <p className="text-[11px] text-[#626763] leading-relaxed">
                Your score calibrates your skill matrix and calculates your top career bottleneck for {targetRole}.
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
              Start Standard Mode
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Maximize2 className="w-4 h-4" />}
              onClick={() => handleStartExam(true)}
            >
              Start Fullscreen Proctored Mode
            </Button>
          </div>
        </Card>
      )}

      {/* 2. Active Assessment Question Card */}
      {hasStarted && currentQ && (
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
                <span>Proctored Exam • {targetRole}</span>
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

          {/* Submission error alert */}
          {submissionError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{submissionError}</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={handleFinalSubmit}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Question Progression Bar & Per-Question Timer Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1F6B4F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1F6B4F] animate-pulse" />
                Question {currentIdx + 1} of {questions.length} ({answeredCount} answered)
              </span>
              <span className="text-[#626763] font-medium truncate max-w-xs text-right">
                {currentQ.category} • {currentQ.difficulty}
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
          <div key={qKey} className="space-y-5 animate-fadeIn">
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#171918] leading-snug">
              {currentQ.text || currentQ.question}
            </h3>

            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-xl bg-[#1E201E] text-[#D8E8DE] text-xs font-mono overflow-x-auto select-none border border-slate-700">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* Validation Notice */}
            {validationError && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{validationError}</span>
              </div>
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

      {/* 3. Final Submission Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleFinalSubmit}
        title="Submit Skill Assessment?"
        description={`You have answered ${answeredCount} of ${questions.length} questions for your ${targetRole} diagnostic. Once submitted, your scores will calibrate your skill matrix and learning roadmap.`}
        confirmText="Confirm & Submit"
        cancelText="Continue Assessment"
        variant="info"
        isLoading={isSubmitting}
      />

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

export default AssessmentPage
