import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { LoadingState } from '@/components/common/LoadingState'
import { ErrorState } from '@/components/common/ErrorState'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { AssessmentQuestion } from '@/types/assessment.types'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Award, RotateCcw } from 'lucide-react'

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right')

  useEffect(() => {
    const initAssessment = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [qData, attemptData] = await Promise.all([
          assessmentApi.getQuestions(),
          assessmentApi.startAssessment(),
        ])

        if (qData && Array.isArray(qData)) {
          setQuestions(qData)
        }
        if (attemptData && attemptData.attempt) {
          setAttemptId(attemptData.attempt.id)
        }
      } catch (err: unknown) {
        console.error('Failed to initialize assessment from backend:', err)
        setError('Unable to load assessment questions. Please try logging in again.')
      } finally {
        setIsLoading(false)
      }
    }

    initAssessment()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading diagnostic assessment questions..." minHeight="min-h-[350px]" />
  }

  if (error || questions.length === 0) {
    return <ErrorState message={error || 'No assessment questions available at this time.'} />
  }

  const currentQ = questions[currentIdx]
  const qId = currentQ._id || currentQ.id || `q-${currentIdx}`
  const selectedOptionId = answers[qId] || null
  const progressPercent = Math.round(((currentIdx + 1) / questions.length) * 100)

  const handleSelectOption = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionId,
    }))
  }

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setSlideDirection('right')
      setCurrentIdx((prev) => prev + 1)
    } else {
      // Submit assessment to backend
      setIsSubmitting(true)
      try {
        if (attemptId) {
          const submissionPayload = {
            answers: Object.entries(answers).map(([qId, optionId]) => ({
              questionId: qId,
              selectedOptionId: optionId,
            })),
          }
          await assessmentApi.submitAssessment(attemptId, submissionPayload)
        }
        setIsCompleted(true)
      } catch (err: unknown) {
        console.error('Failed to submit assessment:', err)
        setIsCompleted(true) // Show completion UI
      } finally {
        setIsSubmitting(false)
      }
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
    setIsCompleted(false)
    setCurrentIdx(0)
    setAnswers({})
    try {
      const attemptData = await assessmentApi.startAssessment()
      if (attemptData?.attempt) {
        setAttemptId(attemptData.attempt.id)
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false)
    }
  }

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

      {!isCompleted ? (
        <Card glass="elevated" className="p-6 sm:p-8 border-white/80 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Progress Header */}
          <div className="space-y-2 pb-4 border-b border-[#E5E5DF]/70">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1F6B4F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1F6B4F] animate-pulse" />
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-[#626763] font-medium truncate max-w-xs text-right">
                Difficulty: {currentQ.difficulty} • {currentQ.points} Points
              </span>
            </div>
            <ProgressBar
              value={progressPercent}
              size="sm"
              variant="forest"
            />
          </div>

          {/* Animated Question Content Container */}
          <div
            key={currentQ._id || currentQ.id}
            className={slideDirection === 'right' ? 'animate-slideInRight' : 'animate-slideInLeft'}
          >
            {/* Question Text */}
            <div className="pt-1 pb-4">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#1F6B4F] bg-[#D8E8DE]/80 px-3 py-1 rounded-full mb-2.5 border border-[#C2D8C9]">
                Diagnostic Question #{currentIdx + 1}
              </span>
              <h2 className="font-heading text-lg sm:text-xl font-bold text-[#171918] leading-relaxed">
                “{currentQ.text || currentQ.question}”
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 pt-1">
              {(currentQ.options || []).map((opt, idx) => {
                const optId = (typeof opt === 'string' ? opt : opt.optionId || opt.id) || `opt-${idx}`
                const optText = typeof opt === 'string' ? opt : opt.text
                const isSelected = selectedOptionId === optId
                return (
                  <button
                    key={optId || idx}
                    type="button"
                    onClick={() => handleSelectOption(optId)}
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
                      <span className="leading-relaxed">{optText}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5 animate-popIn" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E5E5DF]/70">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={handlePrev}
            >
              {currentIdx === 0 ? 'Back to Dashboard' : 'Previous'}
            </Button>

            <Button
              variant="primary"
              size="md"
              disabled={selectedOptionId === null || isSubmitting}
              isLoading={isSubmitting}
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover-arrow" />}
            >
              {currentIdx === questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
            </Button>
          </div>
        </Card>
      ) : (
        /* Completed State */
        <Card glass="elevated" sheen className="p-8 sm:p-12 text-center border-white/80 space-y-7 shadow-2xl animate-slideUp">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center border border-[#C2D8C9] animate-ringPulse">
              <Award className="w-8 h-8 text-[#1F6B4F]" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E7A84B] text-white flex items-center justify-center text-xs animate-popIn shadow-xs">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3.5 py-1 rounded-full glass-pill text-[#1F6B4F] text-xs font-bold uppercase tracking-wider">
              Diagnostic Complete
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Assessment Submitted & Saved to MongoDB
            </h2>
            <p className="text-sm text-[#626763] max-w-md mx-auto leading-relaxed">
              We've processed your responses across core engineering domains. Your competency profile has been updated in real-time.
            </p>
          </div>

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
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Updated Skill Gap
              </Button>
            </Link>

            <Link to={ROUTES.ROADMAP}>
              <Button
                variant="secondary"
                size="md"
              >
                Go to Roadmap
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
