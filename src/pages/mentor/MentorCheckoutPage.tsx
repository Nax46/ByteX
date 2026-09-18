import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/constants/routes'
import { mentorService } from '@/services/mentorService'
import { Mentor, GOAL_LABELS } from '@/types/mentor.types'
import {
  Shield,
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  BadgeCheck,
  AlertTriangle,
} from 'lucide-react'

type PaymentMethod = 'upi' | 'card' | 'netbanking'

export const MentorCheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const mentorId = searchParams.get('mentorId') ?? mentorService.getSelectedMentorId()
  const intake = mentorService.getMentorIntake()

  useEffect(() => {
    if (!mentorId) { navigate(ROUTES.MENTOR_RECOMMENDATIONS); return }
    const found = mentorService.getMentorById(mentorId)
    if (!found) { navigate(ROUTES.MENTOR_RECOMMENDATIONS); return }
    setMentor(found)
    mentorService.storeSelectedMentorId(found.id)
  }, [mentorId, navigate])

  if (!mentor) return null

  const handleDemoPayment = async () => {
    if (!agreed) return
    setIsProcessing(true)
    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 1800))
    if (intake) {
      mentorService.activateJourney(mentor, intake)
    }
    navigate(ROUTES.MENTOR_JOURNEY)
  }

  const paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'upi', label: 'UPI / PhonePe / GPay', icon: '⚡' },
    { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
    { value: 'netbanking', label: 'Net Banking', icon: '🏦' },
  ]

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl">
      <PageHeader
        title="Secure Checkout"
        subtitle="Review your mentorship plan and complete enrollment."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Mentor Support', href: ROUTES.MENTOR },
          { label: 'Checkout' },
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.MENTOR_RECOMMENDATIONS)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        }
      />

      {/* DEMO badge — prominent and honest */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E7A84B]/10 border border-[#E7A84B]/40">
        <AlertTriangle className="w-4 h-4 text-[#E7A84B] shrink-0" />
        <p className="text-xs text-[#626763]">
          <span className="font-bold text-[#E7A84B]">Demo Mode:</span> This is a demonstration checkout. No real payment will be processed. No actual money will be charged.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
        {/* Order Summary */}
        <div className="sm:col-span-3 space-y-4">
          {/* Mentor summary */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-3">Your Mentor</p>
            <div className="flex items-center gap-3">
              <Avatar name={mentor.name} size="md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#171918]">{mentor.name}</span>
                  {mentor.verified && <BadgeCheck className="w-4 h-4 text-[#1F6B4F]" />}
                </div>
                <p className="text-xs text-[#626763]">{mentor.headline}</p>
              </div>
            </div>
          </Card>

          {/* Plan details */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-3">Plan Details</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#626763]">Focus Area</span>
                <span className="text-[#171918] font-medium">{mentor.expertise[0]}</span>
              </div>
              {intake && (
                <div className="flex justify-between">
                  <span className="text-[#626763]">Your Goal</span>
                  <span className="text-[#171918] font-medium">{GOAL_LABELS[intake.goal]}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#626763]">Duration</span>
                <span className="text-[#171918] font-medium">1 Month (4 weeks)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#626763]">Session Length</span>
                <span className="text-[#171918] font-medium">{mentor.sessionDuration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#626763]">Mentoring Style</span>
                <span className="text-[#171918] font-medium">{mentor.mentoringStyle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#626763]">Response Time</span>
                <span className="text-[#171918] font-medium">{mentor.responseTime}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E5E5DF] space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-[#626763]">Mentorship</span>
                <span className="text-[#171918]">₹{mentor.priceMonthly.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#626763]">Platform fee</span>
                <span className="text-[#1F6B4F]">₹0</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-[#E5E5DF] pt-2 mt-2">
                <span className="text-[#171918]">Total</span>
                <span className="text-[#171918]">₹{mentor.priceMonthly.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Card>

          {/* What's included */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-3">What's Included</p>
            {[
              'Personalized 4-week learning plan',
              'Weekly mentor sessions',
              'Code reviews and project feedback',
              'Direct mentor messaging',
              'Progress tracking and milestones',
              'Resource recommendations',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6B4F] shrink-0" />
                <span className="text-xs text-[#626763]">{item}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Payment */}
        <div className="sm:col-span-2 space-y-4">
          <Card className="p-5">
            <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-3">
              <CreditCard className="w-3.5 h-3.5 inline mr-1" />
              Payment Method
            </p>
            <div className="space-y-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setPaymentMethod(pm.value)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-sm ${
                    paymentMethod === pm.value
                      ? 'border-[#1F6B4F] bg-[#D8E8DE]/20'
                      : 'border-[#E5E5DF] hover:border-[#1F6B4F]/40'
                  }`}
                >
                  <span className="text-base">{pm.icon}</span>
                  <span className="text-[#171918] font-medium text-xs">{pm.label}</span>
                  {paymentMethod === pm.value && (
                    <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] ml-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Demo input placeholder */}
            <div className="mt-3 p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] text-center">
              <p className="text-[11px] text-[#8E948F]">
                {paymentMethod === 'card' && 'Card details would appear here in production'}
                {paymentMethod === 'upi' && 'UPI ID or QR code would appear here in production'}
                {paymentMethod === 'netbanking' && 'Bank selection would appear here in production'}
              </p>
            </div>
          </Card>

          {/* Agreement */}
          <Card className="p-4">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-[#E5E5DF] text-[#1F6B4F] focus:ring-[#1F6B4F]"
              />
              <span className="text-[11px] text-[#626763] leading-relaxed">
                I understand this is a <strong>demo enrollment</strong> for demonstration purposes only. No real money will be charged.
              </span>
            </label>
          </Card>

          <Button
            id="mentor-checkout-btn"
            variant="primary"
            className="w-full"
            onClick={handleDemoPayment}
            isLoading={isProcessing}
            disabled={!agreed}
          >
            {isProcessing ? 'Processing demo enrollment…' : 'Complete Demo Enrollment'}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8E948F]">
            <Shield className="w-3.5 h-3.5" />
            <span>Demo checkout — no real payment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
