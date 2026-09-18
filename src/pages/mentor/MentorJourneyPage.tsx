import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/constants/routes'
import { mentorService } from '@/services/mentorService'
import { MentorJourney, GOAL_LABELS, Mentor } from '@/types/mentor.types'
import {
  CheckCircle2,
  Clock,
  Target,
  MessageSquare,
  TrendingUp,
  Book,
  ChevronRight,
  BadgeCheck,
  Zap,
  AlertTriangle,
} from 'lucide-react'

const ProgressRing: React.FC<{ percent: number; size?: number }> = ({ percent, size = 80 }) => {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const dash = (percent / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E5DF" strokeWidth="8" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="#1F6B4F" strokeWidth="8" fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  )
}

// Demo mentor feedback messages indexed by mentor
const MENTOR_MESSAGES: Record<string, string> = {
  mentor_arjun_001: "Welcome! Let's start by reviewing your React fundamentals this week. I've drafted a project idea that aligns perfectly with your goal. Check the Learning Plan tab.",
  mentor_priya_002: "Great to have you onboard! Your background is a real asset for this transition. Let's map your first week together — I've already reviewed your intake and have some exciting ideas.",
  mentor_kiran_003: "Let's get to work! I've looked at your profile and I know exactly what we need to target. First: a diagnostic mock interview so I can give you precise, personalized coaching.",
  mentor_sneha_004: "Welcome to your data science journey! Python fundamentals first — don't skip this, it's the foundation everything else builds on. I'll share some resources by end of today.",
  mentor_rahul_005: "Excited to work with you on your backend journey. I've reviewed your goals — let's start with API design patterns this week. Good backend devs are always in high demand.",
  mentor_ananya_006: "Let's transform your career story! I'll review your current resume tonight and share detailed feedback tomorrow. We'll have a strong personal brand ready within the first two weeks.",
}

export const MentorJourneyPage: React.FC = () => {
  const navigate = useNavigate()
  const [journey, setJourney] = useState<MentorJourney | null>(null)
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [msgDemoOpen, setMsgDemoOpen] = useState(false)
  const [simulatedProgress, setSimulatedProgress] = useState(0)

  useEffect(() => {
    const j = mentorService.getMentorJourney()
    if (!j) { navigate(ROUTES.MENTOR, { replace: true }); return }
    setJourney(j)
    const m = mentorService.getMentorById(j.mentorId)
    setMentor(m ?? null)
    // Animate progress ring
    const t = setTimeout(() => setSimulatedProgress(24), 400)
    return () => clearTimeout(t)
  }, [navigate])

  if (!journey || !mentor) return null

  const mentorMessage = MENTOR_MESSAGES[mentor.id] ?? mentor.sampleFeedback

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="My Mentor Journey"
        subtitle={`Active mentorship with ${mentor.name} — your personalized learning plan is ready.`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Mentor Support', href: ROUTES.MENTOR },
          { label: 'My Journey' },
        ]}
      />

      {/* Demo reminder */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E7A84B]/10 border border-[#E7A84B]/40">
        <AlertTriangle className="w-4 h-4 text-[#E7A84B] shrink-0" />
        <p className="text-xs text-[#626763]">
          <span className="font-bold text-[#E7A84B]">Demo Journey:</span> This is a demonstration of the mentorship journey experience. Mentor messages and sessions are simulated for demo purposes.
        </p>
      </div>

      {/* Hero: Mentor + Status */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            <Avatar name={mentor.name} size="xl" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h2 className="font-heading text-lg font-bold text-[#171918]">{mentor.name}</h2>
              {mentor.verified && <BadgeCheck className="w-4 h-4 text-[#1F6B4F]" />}
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
              </span>
            </div>
            <p className="text-sm text-[#626763]">{mentor.headline}</p>
            <p className="text-xs text-[#8E948F] mt-1">
              {mentor.mentoringStyle} · Responds {mentor.responseTime}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative">
              <ProgressRing percent={simulatedProgress} size={72} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-[#1F6B4F]">{simulatedProgress}%</span>
              </div>
            </div>
            <span className="text-[10px] text-[#8E948F]">Progress</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Goal', value: GOAL_LABELS[journey.goal] },
            { label: 'Level', value: journey.level.charAt(0).toUpperCase() + journey.level.slice(1) },
            { label: 'Current Focus', value: journey.currentFocus },
            { label: 'Status', value: 'Week 1 of 4' },
          ].map((s) => (
            <div key={s.label} className="p-2.5 rounded-lg bg-[#F8F7F3] text-center">
              <p className="text-xs font-semibold text-[#171918] truncate">{s.value}</p>
              <p className="text-[10px] text-[#626763] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Next Action */}
          <Card className="p-5 border-[#1F6B4F]/30 bg-[#D8E8DE]/10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[#E7A84B]" />
              <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider">Next Action</p>
            </div>
            <p className="text-sm font-semibold text-[#171918]">{journey.nextTask}</p>
            <p className="text-xs text-[#626763] mt-1">Assigned by {mentor.name} · Due this week</p>
            <Button variant="primary" size="sm" className="mt-3" rightIcon={<ChevronRight className="w-3 h-3" />}>
              View Task
            </Button>
          </Card>

          {/* Mentor Message */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#1F6B4F]" />
              <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider">Message from {mentor.name}</p>
            </div>
            <div className="flex items-start gap-3">
              <Avatar name={mentor.name} size="sm" />
              <div className="flex-1 p-3.5 rounded-2xl bg-[#F8F7F3] border border-[#E5E5DF] text-sm text-[#171918] leading-relaxed rounded-tl-none">
                {mentorMessage}
              </div>
            </div>
            <button
              onClick={() => setMsgDemoOpen(!msgDemoOpen)}
              className="mt-3 flex items-center gap-1.5 text-xs text-[#1F6B4F] hover:underline font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Reply to {mentor.name}
            </button>
            {msgDemoOpen && (
              <div className="mt-3 p-3 rounded-lg bg-[#E7A84B]/10 border border-[#E7A84B]/30 text-xs text-[#626763] animate-fadeIn">
                <span className="font-semibold text-[#E7A84B]">Demo:</span> Real-time messaging with your mentor would be available here in production. Messages are delivered directly to the mentor.
              </div>
            )}
          </Card>

          {/* 4-Week Learning Plan */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-4 h-4 text-[#1F6B4F]" />
              <h3 className="font-heading font-semibold text-[#171918]">Learning Plan</h3>
            </div>
            <div className="space-y-3">
              {mentor.weeklyPlan.map((week, idx) => {
                const isCurrentWeek = idx === 0
                const isUpcoming = idx > 0
                return (
                  <div key={week.week} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                    isCurrentWeek ? 'border-[#1F6B4F] bg-[#D8E8DE]/20' : 'border-[#E5E5DF]'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrentWeek ? 'bg-[#1F6B4F] text-white' : 'bg-[#E5E5DF] text-[#8E948F]'
                    }`}>
                      {isCurrentWeek ? <TrendingUp className="w-3 h-3" /> : week.week}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#171918]">Week {week.week}: {week.focus}</p>
                        {isCurrentWeek && (
                          <span className="px-2 py-0.5 rounded-full bg-[#1F6B4F] text-white text-[10px] font-semibold">Active</span>
                        )}
                        {isUpcoming && (
                          <span className="px-2 py-0.5 rounded-full bg-[#F8F7F3] text-[#8E948F] text-[10px] border border-[#E5E5DF]">Upcoming</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {week.activities.map((a) => (
                          <span key={a} className="text-[10px] text-[#626763] bg-[#F8F7F3] border border-[#E5E5DF] px-2 py-0.5 rounded">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Quick actions */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'View Learning Plan', icon: <Book className="w-4 h-4" />, href: ROUTES.ROADMAP },
                { label: 'Track Progress', icon: <TrendingUp className="w-4 h-4" />, href: ROUTES.PROGRESS },
                { label: 'Browse Resources', icon: <Target className="w-4 h-4" />, href: ROUTES.RESOURCES },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-medium text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors"
                >
                  <span className="text-[#1F6B4F]">{action.icon}</span>
                  {action.label}
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Upcoming session */}
          <Card className="p-5 bg-[#E8E3F4]/30 border-[#E8E3F4]">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#626763]" />
              <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider">Upcoming Session</p>
            </div>
            <p className="text-sm font-semibold text-[#171918]">Introduction & Goal Setting</p>
            <p className="text-xs text-[#626763] mt-0.5">Tomorrow · Scheduled by mentor</p>
            <p className="text-[11px] text-[#8E948F] mt-0.5">{mentor.sessionDuration} min • Video call</p>
            <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
              View Session Details
            </Button>
          </Card>

          {/* Mentor contact */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-3">Mentor Support</p>
            <div className="flex items-center gap-2 text-xs text-[#626763] mb-3">
              <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <span>Responds {mentor.responseTime}</span>
            </div>
            <div className="space-y-2">
              {mentor.helpsWith.slice(0, 3).map((item) => (
                <div key={item} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-[#1F6B4F] mt-0.5 shrink-0" />
                  <span className="text-[11px] text-[#626763]">{item}</span>
                </div>
              ))}
            </div>
            <Button
              variant="primary"
              size="sm"
              className="mt-4 w-full text-xs"
              onClick={() => setMsgDemoOpen(true)}
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            >
              Message Mentor
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
