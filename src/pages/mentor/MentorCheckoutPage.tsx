import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/constants/routes'
import { mentorService } from '@/services/mentorService'
import { Mentor, MentorPaymentRecord, PaymentMethod } from '@/types/mentor.types'
import {
  Shield,
  CheckCircle2,
  ArrowLeft,
  BadgeCheck,
  AlertTriangle,
  CreditCard,
  Building2,
  Smartphone,
  Check,
  RefreshCw,
  XCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

type CheckoutStep = 'review' | 'payment' | 'processing' | 'success' | 'cancelled'
type UPIAppOption = 'google_pay' | 'phonepe' | 'paytm' | 'other'

const UPI_APPS: { id: UPIAppOption; name: string; iconLabel: string; bgClass: string }[] = [
  { id: 'google_pay', name: 'Google Pay', iconLabel: 'GPay', bgClass: 'bg-white border-blue-200 text-blue-600' },
  { id: 'phonepe', name: 'PhonePe', iconLabel: 'Pe', bgClass: 'bg-[#5f259f]/10 border-[#5f259f]/30 text-[#5f259f]' },
  { id: 'paytm', name: 'Paytm', iconLabel: 'Paytm', bgClass: 'bg-sky-50 border-sky-200 text-sky-700' },
  { id: 'other', name: 'Other UPI', iconLabel: 'UPI', bgClass: 'bg-neutral-100 border-neutral-300 text-neutral-700' },
]

export const MentorCheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Data state
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [step, setStep] = useState<CheckoutStep>('review')

  // Payment configuration
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [selectedUpiApp, setSelectedUpiApp] = useState<UPIAppOption>('google_pay')
  const [upiMode, setUpiMode] = useState<'app' | 'id'>('app')
  const [upiIdInput, setUpiIdInput] = useState('')
  const [upiIdVerified, setUpiIdVerified] = useState(false)
  const [upiIdError, setUpiIdError] = useState<string | null>(null)

  // Demo agreement & processing state
  const [demoAgreed, setDemoAgreed] = useState(true)
  const [completedPayment, setCompletedPayment] = useState<MentorPaymentRecord | null>(null)

  const mentorId = searchParams.get('mentorId') ?? mentorService.getSelectedMentorId()
  const intake = mentorService.getMentorIntake()

  useEffect(() => {
    if (!mentorId) {
      navigate(ROUTES.MENTOR_RECOMMENDATIONS)
      return
    }
    const found = mentorService.getMentorById(mentorId)
    if (!found) {
      navigate(ROUTES.MENTOR_RECOMMENDATIONS)
      return
    }
    setMentor(found)
    mentorService.storeSelectedMentorId(found.id)
  }, [mentorId, navigate])

  if (!mentor) return null

  const planTitle = `${mentor.expertise[0] || 'SkillPath'} Career Mentorship`
  const formattedPrice = `₹${mentor.priceMonthly.toLocaleString('en-IN')}`

  // UPI ID validation: format name@bank
  const handleVerifyUpiId = () => {
    const trimmed = upiIdInput.trim()
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/

    if (!trimmed) {
      setUpiIdError('Please enter a UPI ID (e.g. yourname@okhdfcbank or student@upi).')
      setUpiIdVerified(false)
      return
    }

    if (!upiRegex.test(trimmed)) {
      setUpiIdError('Invalid UPI ID format. Expected format: name@bank (e.g. user@okaxis).')
      setUpiIdVerified(false)
      return
    }

    setUpiIdError(null)
    setUpiIdVerified(true)
  }

  const isUpiValid = upiMode === 'app' ? !!selectedUpiApp : upiIdVerified

  // Proceed to simulated payment processing
  const handlePaySecurely = async () => {
    if (!demoAgreed || !isUpiValid) return

    setStep('processing')

    // Simulate realistic payment provider delay (1.8 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1800))

    const upiAppOrId = upiMode === 'app'
      ? UPI_APPS.find((a) => a.id === selectedUpiApp)?.name || 'Google Pay'
      : upiIdInput.trim()

    // Complete demo payment & activate mentorship
    const fallbackIntake = intake || {
      problemText: 'Mentorship in ' + mentor.expertise[0],
      goal: mentor.goals[0] || 'job_ready',
      level: mentor.levels[0] || 'beginner',
      skillAreas: mentor.skills.slice(0, 3),
    }

    const { payment } = mentorService.completeDemoPayment(
      mentor,
      fallbackIntake,
      'upi',
      upiMode === 'app' ? upiAppOrId : undefined,
      upiMode === 'id' ? upiAppOrId : undefined
    )

    setCompletedPayment(payment)
    setStep('success')
  }

  const handleCancelPayment = () => {
    mentorService.cancelPayment(mentor.id)
    setStep('cancelled')
  }

  // ─── Step 3: Processing Screen ───────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 animate-fadeIn shadow-lg border-[#1F6B4F]/20">
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-[#1F6B4F]/20 border-t-[#1F6B4F] animate-spin" />
            <Smartphone className="w-6 h-6 text-[#1F6B4F]" />
          </div>

          <div className="space-y-2">
            <h3 className="font-heading text-lg font-bold text-[#171918]">Processing Payment...</h3>
            <p className="text-xs text-[#626763] animate-pulse">Connecting to payment provider...</p>
            <p className="text-[11px] text-[#8E948F]">
              Simulating secure UPI authorization with {upiMode === 'app' ? UPI_APPS.find((a) => a.id === selectedUpiApp)?.name : upiIdInput}...
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] text-[11px] text-[#626763]">
            <p className="font-semibold text-[#1F6B4F]">Demo Payment Simulation</p>
            <p className="text-[#8E948F] mt-0.5">Please do not refresh or close the page.</p>
          </div>
        </Card>
      </div>
    )
  }

  // ─── Step 4: Demo Payment Success Screen ──────────────────────────────────
  if (step === 'success' && completedPayment) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn py-4">
        <Card className="p-6 sm:p-8 text-center space-y-6 shadow-md border-green-200 bg-white">
          {/* Success Check Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 ring-8 ring-green-50">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E7A84B]/15 text-[#b97a22] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Demo Transaction — No Money Charged
            </span>
            <h2 className="font-heading text-2xl font-bold text-[#171918]">Payment Successful</h2>
            <p className="text-sm text-[#626763]">
              Your mentorship with <strong className="text-[#171918]">{mentor.name}</strong> has been activated!
            </p>
          </div>

          {/* Receipt Card */}
          <div className="rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] p-5 text-left space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E5DF]">
              <span className="text-xs text-[#626763]">Demo Payment ID</span>
              <span className="text-xs font-mono font-bold text-[#171918] bg-white px-2 py-0.5 rounded border border-[#E5E5DF]">
                {completedPayment.paymentId}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-[#626763]">Mentor</span>
              <span className="font-semibold text-[#171918]">{mentor.name}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-[#626763]">Mentorship Plan</span>
              <span className="font-medium text-[#171918]">{completedPayment.planName}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-[#626763]">Duration</span>
              <span className="text-[#171918]">{completedPayment.duration}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-[#626763]">Payment Method</span>
              <span className="text-[#171918] font-medium">
                UPI ({completedPayment.upiApp || completedPayment.upiId || 'Verified'})
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-[#626763]">Mentorship Status</span>
              <span className="inline-flex items-center gap-1 font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" /> Active
              </span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#E5E5DF]">
              <span className="text-sm font-bold text-[#171918]">Total Amount</span>
              <span className="text-base font-bold text-[#1F6B4F]">₹{completedPayment.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Value Unlocked */}
          <div className="text-left p-4 rounded-xl bg-[#D8E8DE]/20 border border-[#D8E8DE] space-y-2">
            <p className="text-xs font-bold text-[#1F6B4F] uppercase tracking-wider">What happens next</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#626763]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5" />
                <span>Personalized 4-week roadmap ready</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5" />
                <span>Mentor messaging unlocked</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5" />
                <span>First session scheduling open</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              id="start-mentor-journey-btn"
              variant="primary"
              size="lg"
              className="flex-1"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              onClick={() => navigate(ROUTES.MENTOR_JOURNEY)}
            >
              Start Mentor Journey
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="sm:w-auto"
              onClick={() => navigate(`/mentor/${mentor.id}`)}
            >
              View Mentor Profile
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ─── Step 5: Cancelled Screen ─────────────────────────────────────────────
  if (step === 'cancelled') {
    return (
      <div className="max-w-md mx-auto py-8 space-y-6 animate-fadeIn">
        <Card className="p-8 text-center space-y-5 shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <XCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-heading text-xl font-bold text-[#171918]">Payment Cancelled</h3>
            <p className="text-sm text-[#626763]">
              Your payment was cancelled. Your mentorship has not been activated.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] text-xs text-[#8E948F]">
            No charges were applied. You can retry checkout anytime or choose a different mentor.
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Button
              variant="primary"
              className="flex-1"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => setStep('payment')}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(ROUTES.MENTOR_RECOMMENDATIONS)}
            >
              Back to Mentors
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // ─── Main Checkout View (Step 1: Review & Step 2: Payment) ────────────────
  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
      <PageHeader
        title={step === 'review' ? 'Review Mentorship Plan' : 'Complete Your Mentorship'}
        subtitle={
          step === 'review'
            ? 'Review your selected mentor and learning plan details before proceeding to payment.'
            : 'Select your preferred payment method to activate your mentorship.'
        }
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Mentor Support', href: ROUTES.MENTOR },
          { label: 'Checkout' },
        ]}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === 'payment') {
                setStep('review')
              } else {
                navigate(ROUTES.MENTOR_RECOMMENDATIONS)
              }
            }}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            {step === 'payment' ? 'Back to Plan Review' : 'Back to Mentors'}
          </Button>
        }
      />

      {/* Prominent and honest DEMO payment notice */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#E7A84B]/10 border border-[#E7A84B]/40">
        <AlertTriangle className="w-4 h-4 text-[#E7A84B] shrink-0" />
        <p className="text-xs text-[#626763] leading-relaxed">
          <span className="font-bold text-[#E7A84B]">Demo Payment Notice:</span> This is a frontend demo checkout. No real money will be charged, and no real UPI transaction will occur.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT / MAIN COLUMN (3 of 5 cols on desktop) */}
        <div className="lg:col-span-3 space-y-5">
          {step === 'review' ? (
            /* ─── STEP 1: REVIEW MENTORSHIP PLAN ─── */
            <>
              {/* Mentor Profile Overview */}
              <Card className="p-5 sm:p-6">
                <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-4">
                  Selected Mentor
                </p>
                <div className="flex items-start gap-4">
                  <Avatar name={mentor.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base font-bold text-[#171918]">{mentor.name}</span>
                      {mentor.verified && <BadgeCheck className="w-4 h-4 text-[#1F6B4F] shrink-0" />}
                    </div>
                    <p className="text-xs text-[#626763] mt-0.5">{mentor.headline}</p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {mentor.expertise.map((exp) => (
                        <span key={exp} className="px-2 py-0.5 rounded-full bg-[#F8F7F3] border border-[#E5E5DF] text-[10px] text-[#626763]">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Selected Plan Details */}
              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider">
                      Selected Plan
                    </p>
                    <h3 className="font-heading text-lg font-bold text-[#171918] mt-1">{planTitle}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#D8E8DE] text-[#1F6B4F] text-xs font-bold">
                    1 Month
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#E5E5DF] text-xs">
                  <div>
                    <span className="text-[#8E948F]">Duration</span>
                    <p className="font-semibold text-[#171918] mt-0.5">1 Month (4 weeks)</p>
                  </div>
                  <div>
                    <span className="text-[#8E948F]">Session Duration</span>
                    <p className="font-semibold text-[#171918] mt-0.5">{mentor.sessionDuration} minutes / session</p>
                  </div>
                  <div>
                    <span className="text-[#8E948F]">Mentoring Style</span>
                    <p className="font-semibold text-[#171918] mt-0.5">{mentor.mentoringStyle}</p>
                  </div>
                  <div>
                    <span className="text-[#8E948F]">Response Time</span>
                    <p className="font-semibold text-[#171918] mt-0.5">{mentor.responseTime}</p>
                  </div>
                </div>

                {/* Plan Benefits Checklist */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-[#171918]">Included in this mentorship:</p>
                  {[
                    'Personalized learning guidance',
                    'Mentor feedback on assignments',
                    'Learning roadmap support',
                    'Project guidance & architecture tips',
                    'Progress reviews and milestone checks',
                    'Mentor messaging support',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-xs text-[#626763]">
                      <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            /* ─── STEP 2: PAYMENT METHOD & UPI INTERFACE ─── */
            <>
              {/* Payment Method Selector */}
              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider">
                    Choose Payment Method
                  </p>
                  <span className="text-[11px] text-[#1F6B4F] font-semibold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Secure Checkout
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* UPI (Active) */}
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#1F6B4F] bg-[#D8E8DE]/20 shadow-sm'
                        : 'border-[#E5E5DF] hover:border-[#1F6B4F]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#1F6B4F]/10 text-[#1F6B4F] flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#171918]">UPI</span>
                          <span className="text-[10px] font-semibold bg-[#1F6B4F] text-white px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-[#626763]">Google Pay, PhonePe, Paytm, Any UPI ID</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'upi' ? 'border-[#1F6B4F]' : 'border-[#8E948F]'
                    }`}>
                      {paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-[#1F6B4F]" />}
                    </div>
                  </label>

                  {/* Card (Coming Soon) */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-neutral-200 text-neutral-500 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[#171918]">Credit / Debit Card</span>
                        <p className="text-[11px] text-[#8E948F]">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">
                      Coming soon
                    </span>
                  </div>

                  {/* Net Banking (Coming Soon) */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-neutral-200 text-neutral-500 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[#171918]">Net Banking</span>
                        <p className="text-[11px] text-[#8E948F]">All major Indian banks</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">
                      Coming soon
                    </span>
                  </div>
                </div>
              </Card>

              {/* Dedicated UPI Payment Interface */}
              <Card className="p-5 sm:p-6 space-y-5 border-[#1F6B4F]/40 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]">
                  <div>
                    <h4 className="font-heading font-bold text-[#171918]">Pay with UPI</h4>
                    <p className="text-xs text-[#626763]">Instant demo authorization</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#8E948F]">Amount to pay</span>
                    <p className="text-base font-bold text-[#1F6B4F]">{formattedPrice}</p>
                  </div>
                </div>

                {/* Sub-mode selector: Choose App vs Enter UPI ID */}
                <div className="flex rounded-lg bg-[#F8F7F3] p-1 border border-[#E5E5DF]">
                  <button
                    type="button"
                    onClick={() => setUpiMode('app')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      upiMode === 'app'
                        ? 'bg-white text-[#171918] shadow-sm'
                        : 'text-[#626763] hover:text-[#171918]'
                    }`}
                  >
                    Select UPI App
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMode('id')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      upiMode === 'id'
                        ? 'bg-white text-[#171918] shadow-sm'
                        : 'text-[#626763] hover:text-[#171918]'
                    }`}
                  >
                    Enter UPI ID
                  </button>
                </div>

                {upiMode === 'app' ? (
                  /* UPI App Selection */
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[#171918]">Select your UPI app:</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {UPI_APPS.map((app) => {
                        const isSelected = selectedUpiApp === app.id
                        return (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-[#1F6B4F] bg-[#D8E8DE]/30 ring-1 ring-[#1F6B4F]'
                                : 'border-[#E5E5DF] bg-white hover:border-[#1F6B4F]/40'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${app.bgClass}`}>
                              {app.iconLabel}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#171918] truncate">{app.name}</p>
                              <span className="text-[10px] text-[#8E948F]">Instant Pay</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-[#1F6B4F]' : 'border-[#8E948F]'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-[#1F6B4F]" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  /* UPI ID Input Option */
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-[#171918]">
                      Enter your Virtual Payment Address (UPI ID):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiIdInput}
                        onChange={(e) => {
                          setUpiIdInput(e.target.value)
                          setUpiIdVerified(false)
                          setUpiIdError(null)
                        }}
                        placeholder="e.g. yourname@okhdfcbank"
                        className={`flex-1 rounded-lg border px-3.5 py-2 text-xs text-[#171918] placeholder-[#8E948F] focus:outline-none transition-colors ${
                          upiIdError
                            ? 'border-red-400 bg-red-50/30'
                            : upiIdVerified
                            ? 'border-green-500 bg-green-50/20'
                            : 'border-[#E5E5DF] bg-white focus:border-[#1F6B4F]'
                        }`}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleVerifyUpiId}
                        className="text-xs whitespace-nowrap"
                      >
                        Verify UPI ID
                      </Button>
                    </div>

                    {/* Verification Feedback */}
                    {upiIdVerified && (
                      <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 p-2 rounded-lg border border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span>UPI ID format verified. (Format check only — demo mode).</span>
                      </div>
                    )}
                    {upiIdError && (
                      <p className="text-xs text-red-600">{upiIdError}</p>
                    )}

                    <p className="text-[11px] text-[#8E948F]">
                      Common suffixes: @okhdfcbank, @okaxis, @oksbi, @paytm, @ybl, @upi
                    </p>
                  </div>
                )}

                {/* Simulated payment disclaimer */}
                <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] text-[11px] text-[#626763] space-y-1">
                  <p className="font-semibold text-[#171918]">Demo Simulation Notice</p>
                  <p>
                    Clicking "Pay Securely" will simulate a successful demo authorization without launching external apps or deducting any funds.
                  </p>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* RIGHT / SUMMARY COLUMN (2 of 5 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 sticky top-24 space-y-4 shadow-sm border-[#E5E5DF]">
            <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider">
              Order Summary
            </p>

            {/* Price breakdown */}
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#626763]">Mentorship Plan</span>
                <span className="text-[#171918] font-medium">{formattedPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#626763]">Duration</span>
                <span className="text-[#171918]">1 Month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#626763]">Platform Fee</span>
                <span className="text-[#1F6B4F] font-medium">₹0 (Free)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#626763]">GST / Tax</span>
                <span className="text-[#1F6B4F] font-medium">₹0 (Included)</span>
              </div>

              <div className="pt-3 border-t border-[#E5E5DF] flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold text-[#171918]">Total Amount</span>
                  <p className="text-[10px] text-[#8E948F]">One-time demo payment</p>
                </div>
                <span className="text-xl font-bold text-[#1F6B4F]">{formattedPrice}</span>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-2 border-t border-[#E5E5DF]">
              <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[#626763] leading-relaxed">
                <input
                  type="checkbox"
                  checked={demoAgreed}
                  onChange={(e) => setDemoAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-[#E5E5DF] text-[#1F6B4F] focus:ring-[#1F6B4F]"
                />
                <span>
                  I understand this is a <strong>demo payment simulation</strong>. No real money will be charged.
                </span>
              </label>
            </div>

            {/* Primary Action Button */}
            {step === 'review' ? (
              <Button
                id="proceed-to-payment-btn"
                variant="primary"
                size="lg"
                className="w-full"
                rightIcon={<ChevronRight className="w-4 h-4" />}
                onClick={() => setStep('payment')}
                disabled={!demoAgreed}
              >
                Proceed to Payment
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  id="pay-securely-btn"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handlePaySecurely}
                  disabled={!demoAgreed || (upiMode === 'id' && !upiIdVerified)}
                  leftIcon={<Shield className="w-4 h-4" />}
                >
                  Pay Securely {formattedPrice}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-neutral-500 hover:text-red-600"
                  onClick={handleCancelPayment}
                >
                  Cancel Payment
                </Button>
              </div>
            )}

            {/* Security Assurance */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#8E948F]">
              <Shield className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <span>SkillPath Demo Sandbox • 256-bit SSL Simulated</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
