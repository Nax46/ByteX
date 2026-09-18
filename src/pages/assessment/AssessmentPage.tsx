import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Award, RotateCcw } from 'lucide-react'

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
    number: 7,
    total: 10,
    category: 'Frontend Development & Responsive Design',
    question: 'You need to make a web layout fluid across mobile, tablet, and widescreen displays. Which approach represents modern best practice?',
    explanation: 'Mobile-first design with CSS custom properties and relative units (rem, em, %) prevents layout breaks and minimizes media query bloat.',
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
    number: 8,
    total: 10,
    category: 'Modern JavaScript (ES6+)',
    question: 'In JavaScript asynchronous programming, what is the primary benefit of async/await over raw Promise chains (.then/.catch)?',
    explanation: 'Async/await allows asynchronous code to be read and structured sequentially with standard try/catch error handling.',
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
    number: 9,
    total: 10,
    category: 'Git & Version Control',
    question: 'When collaborating with a development team, why is creating isolated feature branches preferred over committing directly to main?',
    explanation: 'Feature branches isolate ongoing work, facilitate thorough pull request code reviews, and keep the main branch stable and deployable.',
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
    number: 10,
    total: 10,
    category: 'Component Architecture & State',
    question: 'In modern React, what happens when state is lifted up to a shared common ancestor component?',
    explanation: 'Lifting state up establishes a single source of truth, enabling coordinated data flow between sibling components via props.',
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
  const [currentIdx, setCurrentIdx] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<number, number>>({ 0: 0 })
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right')

  const currentQ = ASSESSMENT_QUESTIONS[currentIdx]
  const selectedChoice = answers[currentIdx] ?? null
  const progressPercent = ((currentQ.number) / currentQ.total) * 100

  const handleSelectChoice = (choiceIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: choiceIdx,
    }))
  }

  const handleNext = () => {
    if (currentIdx < ASSESSMENT_QUESTIONS.length - 1) {
      setSlideDirection('right')
      setCurrentIdx((prev) => prev + 1)
    } else {
      setIsCompleted(true)
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

  const handleRestart = () => {
    setCurrentIdx(0)
    setAnswers({ 0: 0 })
    setIsCompleted(false)
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
            <ProgressBar
              value={progressPercent}
              size="sm"
              variant="forest"
            />
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
              disabled={selectedChoice === null}
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover-arrow" />}
            >
              {currentIdx === ASSESSMENT_QUESTIONS.length - 1 ? 'Submit Assessment' : 'Next Question'}
            </Button>
          </div>
        </Card>
      ) : (
        /* Completed State with Celebration & Animated Score Cards */
        <Card glass="elevated" sheen className="p-8 sm:p-12 text-center border-white/80 space-y-7 shadow-2xl animate-slideUp">
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
            <div className="inline-block px-3.5 py-1 rounded-full glass-pill text-[#1F6B4F] text-xs font-bold uppercase tracking-wider">
              Diagnostic Complete
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Assessment Verified & Calibrated
            </h2>
            <p className="text-sm text-[#626763] max-w-md mx-auto leading-relaxed">
              We've processed your responses across core engineering domains. Your competency profile has been updated in real-time.
            </p>
          </div>

          {/* Animated Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto pt-2">
            <div className="p-4 rounded-xl glass-panel border-white/80 space-y-1 hover-lift">
              <span className="text-[11px] text-[#626763] font-medium">Diagnostic Score</span>
              <div className="font-heading text-2xl font-bold text-[#1F6B4F] flex items-baseline gap-1">
                <AnimatedCounter end={90} duration={1200} suffix="%" />
              </div>
              <p className="text-[11px] text-[#1F6B4F] font-medium">Top quartile tier</p>
            </div>

            <div className="p-4 rounded-xl glass-panel border-white/80 space-y-1 hover-lift">
              <span className="text-[11px] text-[#626763] font-medium">Readiness Index</span>
              <div className="font-heading text-2xl font-bold text-[#171918] flex items-baseline gap-1">
                <AnimatedCounter end={72} duration={1400} suffix="%" />
              </div>
              <p className="text-[11px] text-[#1F6B4F] font-medium">+8% from last test</p>
            </div>

            <div className="p-4 rounded-xl glass-panel border-white/80 space-y-1 hover-lift">
              <span className="text-[11px] text-[#626763] font-medium">Next Focus Area</span>
              <div className="font-heading text-lg font-bold text-[#171918] truncate pt-0.5">
                Git & React
              </div>
              <p className="text-[11px] text-[#626763]">Stage 03 unlocks</p>
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
