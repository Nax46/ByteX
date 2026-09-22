import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/constants/routes'
import { mentorService } from '@/services/mentorService'
import { Mentor, MentorIntake, GOAL_LABELS } from '@/types/mentor.types'
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  MessageSquare,
  BadgeCheck,
  Lightbulb,
} from 'lucide-react'

export const MentorDemoPage: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>()
  const navigate = useNavigate()
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [intake, setIntake] = useState<MentorIntake | null>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!mentorId) { navigate(ROUTES.MENTOR_RECOMMENDATIONS); return }
    const found = mentorService.getMentorById(mentorId)
    if (!found) { navigate(ROUTES.MENTOR_RECOMMENDATIONS); return }
    setMentor(found)
    setIntake(mentorService.getMentorIntake())
  }, [mentorId, navigate])

  if (!mentor) return null

  const handleContinue = () => {
    mentorService.storeSelectedMentorId(mentor.id)
    navigate(`${ROUTES.MENTOR_CHECKOUT}?mentorId=${mentor.id}`)
  }

  const totalSteps = mentor.demoApproach.length
  const isComplete = step >= totalSteps

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      <PageHeader
        title={`Mentor Demo — ${mentor.name}`}
        subtitle="See how this mentor would approach your specific learning challenge before you commit."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Mentor Support', href: ROUTES.MENTOR },
          { label: 'Mentors', href: ROUTES.MENTOR_RECOMMENDATIONS },
          { label: mentor.name, href: `/mentor/${mentor.id}` },
          { label: 'Demo' },
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(`/mentor/${mentor.id}`)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Profile
          </Button>
        }
      />

      {/* Mentor intro bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Avatar name={mentor.name} size="md" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[#171918]">{mentor.name}</span>
              {mentor.verified && <BadgeCheck className="w-4 h-4 text-[#1F6B4F]" />}
            </div>
            <p className="text-xs text-[#626763]">{mentor.headline}</p>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-[11px] text-[#8E948F]">Demo session</p>
            <p className="text-[11px] font-medium text-[#1F6B4F]">Free introduction</p>
          </div>
        </div>
      </Card>

      {/* Student's problem */}
      {intake && (
        <Card className="p-5 bg-[#F8F7F3] border-[#E5E5DF]">
          <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-2">Your challenge</p>
          <p className="text-sm text-[#171918] italic leading-relaxed">"{intake.problemText}"</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="px-2 py-0.5 rounded-full bg-[#D8E8DE] text-[#1F6B4F] text-[10px] font-semibold">
              Goal: {GOAL_LABELS[intake.goal]}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E8E3F4] text-[#626763] text-[10px] font-semibold capitalize">
              Level: {intake.level}
            </span>
          </div>
        </Card>
      )}

      {/* Demo: How I'd approach your problem */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-5 h-5 text-[#E7A84B]" />
          <h3 className="font-heading font-semibold text-[#171918]">How I Would Approach Your Problem</h3>
        </div>
        <p className="text-xs text-[#8E948F] mb-5">Click each step to walk through the mentor's approach</p>

        <div className="space-y-3">
          {mentor.demoApproach.map((approachStep, idx) => {
            const isVisible = idx <= step
            const isCurrent = idx === step && !isComplete
            const isDone = idx < step || isComplete
            return (
              <button
                key={idx}
                type="button"
                onClick={() => { if (idx === step && !isComplete) setStep(step + 1) }}
                disabled={idx !== step || isComplete}
                className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  isDone
                    ? 'border-[#1F6B4F] bg-[#D8E8DE]/20'
                    : isCurrent
                    ? 'border-[#1F6B4F]/60 bg-[#F8F7F3] cursor-pointer hover:bg-[#D8E8DE]/10'
                    : isVisible
                    ? 'border-[#E5E5DF] opacity-40 cursor-not-allowed'
                    : 'border-[#E5E5DF] opacity-20 cursor-not-allowed'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                  isDone ? 'bg-[#1F6B4F] text-white' : isCurrent ? 'bg-[#1F6B4F]/20 text-[#1F6B4F]' : 'bg-[#E5E5DF] text-[#8E948F]'
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${isDone ? 'text-[#171918] font-medium' : isCurrent ? 'text-[#1F6B4F] font-semibold' : 'text-[#626763]'}`}>
                    {approachStep}
                  </p>
                  {isCurrent && (
                    <p className="text-[10px] text-[#8E948F] mt-1">Click to continue →</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="h-1.5 w-full bg-[#E5E5DF] rounded-full">
            <div
              className="h-1.5 bg-[#1F6B4F] rounded-full transition-all duration-500"
              style={{ width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-[#8E948F] mt-1">{Math.min(step, totalSteps)} of {totalSteps} steps</p>
        </div>
      </Card>

      {/* Sample feedback — shown after all steps */}
      {isComplete && (
        <Card className="p-5 bg-[#D8E8DE]/20 border-[#D8E8DE] animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1F6B4F]/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-[#1F6B4F]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1F6B4F] mb-1">Sample mentor feedback</p>
              <p className="text-sm text-[#171918] italic leading-relaxed">"{mentor.sampleFeedback}"</p>
              <p className="text-[11px] text-[#8E948F] mt-2">— {mentor.name}</p>
            </div>
          </div>
        </Card>
      )}

      {/* CTA */}
      {isComplete && (
        <Card className="p-5 animate-fadeIn">
          <p className="text-sm font-semibold text-[#171918] mb-1">
            Ready to start your journey with {mentor.name}?
          </p>
          <p className="text-xs text-[#626763] mb-4">
            {mentorService.formatPrice(mentor.priceMonthly)} · {mentor.sessionDuration} min sessions · {mentor.mentoringStyle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={handleContinue}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              className="sm:w-auto"
            >
              Continue with {mentor.name}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.MENTOR_RECOMMENDATIONS)}
              className="sm:w-auto"
            >
              View Other Mentors
            </Button>
          </div>
        </Card>
      )}

      {!isComplete && step === 0 && (
        <p className="text-center text-xs text-[#8E948F]">
          Click Step 1 above to walk through {mentor.name}'s approach to your challenge.
        </p>
      )}
    </div>
  )
}
