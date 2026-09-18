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
  Lock,
  Send,
  X,
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

// Demo mentor initial messages
const MENTOR_MESSAGES: Record<string, string> = {
  mentor_arjun_001: "Welcome! Let's start by reviewing your React fundamentals this week. I've drafted a project idea that aligns perfectly with your goal. Check the Learning Plan tab.",
  mentor_priya_002: "Great to have you onboard! Your background is a real asset for this transition. Let's map your first week together — I've already reviewed your intake and have some exciting ideas.",
  mentor_kiran_003: "Let's get to work! I've looked at your profile and I know exactly what we need to target. First: a diagnostic mock interview so I can give you precise, personalized coaching.",
  mentor_sneha_004: "Welcome to your data science journey! Python fundamentals first — don't skip this, it's the foundation everything else builds on. I'll share some resources by end of today.",
  mentor_rahul_005: "Excited to work with you on your backend journey. I've reviewed your goals — let's start with API design patterns this week. Good backend devs are always in high demand.",
  mentor_ananya_006: "Let's transform your career story! I'll review your current resume tonight and share detailed feedback tomorrow. We'll have a strong personal brand ready within the first two weeks.",
}

interface ChatMessage {
  id: string
  sender: 'mentor' | 'student'
  text: string
  timestamp: string
}

export const MentorJourneyPage: React.FC = () => {
  const navigate = useNavigate()
  const [journey, setJourney] = useState<MentorJourney | null>(null)
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [lockedMentor, setLockedMentor] = useState<Mentor | null>(null)
  const [simulatedProgress, setSimulatedProgress] = useState(0)

  // Message Mentor Dialog state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isMentorTyping, setIsMentorTyping] = useState(false)

  useEffect(() => {
    // Check if mentorship is actively paid
    const active = mentorService.isJourneyActive()

    if (!active) {
      setIsLocked(true)
      const selId = mentorService.getSelectedMentorId()
      if (selId) {
        setLockedMentor(mentorService.getMentorById(selId) ?? null)
      } else {
        const matches = mentorService.getMatchedIds()
        if (matches.length > 0) {
          setLockedMentor(mentorService.getMentorById(matches[0]) ?? null)
        }
      }
      return
    }

    setIsLocked(false)
    const j = mentorService.getMentorJourney()
    if (!j) {
      navigate(ROUTES.MENTOR, { replace: true })
      return
    }
    setJourney(j)
    const m = mentorService.getMentorById(j.mentorId)
    setMentor(m ?? null)

    // Initialize chat with mentor's welcome message
    if (m) {
      setChatMessages([
        {
          id: 'welcome-1',
          sender: 'mentor',
          text: MENTOR_MESSAGES[m.id] ?? m.sampleFeedback,
          timestamp: 'Just now',
        },
      ])
    }

    // Animate progress ring
    const t = setTimeout(() => setSimulatedProgress(24), 400)
    return () => clearTimeout(t)
  }, [navigate])

  // Handle sending a message to mentor
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || !mentor) return

    const studentMsg: ChatMessage = {
      id: `std-${Date.now()}`,
      sender: 'student',
      text,
      timestamp: 'Just now',
    }

    setChatMessages((prev) => [...prev, studentMsg])
    setInputMessage('')
    setIsMentorTyping(true)

    // Simulate mentor reply after 1.2 seconds
    setTimeout(() => {
      setIsMentorTyping(false)
      const mentorReplies = [
        `Got your message! That sounds like a solid step forward. Let's discuss this further in our upcoming review call. Keep pushing!`,
        `Thanks for sharing! I've noted this down. I'll inspect your code repo and send tailored comments shortly.`,
        `Great question! The best approach is to start with a clean component boundary and lift state only when shared. Check week 1 milestones!`,
      ]
      const randomReply = mentorReplies[Math.floor(Math.random() * mentorReplies.length)]
      const replyMsg: ChatMessage = {
        id: `mnt-${Date.now()}`,
        sender: 'mentor',
        text: randomReply,
        timestamp: 'Just now',
      }
      setChatMessages((prev) => [...prev, replyMsg])
    }, 1200)
  }

  // ─── Locked State (Payment Not Completed) ─────────────────────────────────
  if (isLocked) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-6 animate-fadeIn">
        <PageHeader
          title="Mentor Journey"
          subtitle="Your personalized learning journey with your mentor."
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.DASHBOARD },
            { label: 'Mentor Support', href: ROUTES.MENTOR },
            { label: 'Journey' },
          ]}
        />

        <Card className="p-6 sm:p-8 text-center space-y-6 border-[#E7A84B]/40 bg-white shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#E7A84B]/15 flex items-center justify-center text-[#b97a22] ring-8 ring-[#E7A84B]/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E7A84B]/15 text-[#b97a22] text-xs font-semibold">
              Activation Required
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
              Mentorship Not Activated
            </h2>
            <p className="text-sm text-[#626763] max-w-md mx-auto leading-relaxed">
              {lockedMentor
                ? `Complete checkout to activate your mentorship journey with ${lockedMentor.name}.`
                : 'Select a mentor and complete checkout to activate your personalized mentorship journey.'}
            </p>
          </div>

          {lockedMentor && (
            <div className="p-4 rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] flex items-center gap-4 text-left">
              <Avatar name={lockedMentor.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#171918]">{lockedMentor.name}</span>
                  {lockedMentor.verified && <BadgeCheck className="w-4 h-4 text-[#1F6B4F]" />}
                </div>
                <p className="text-xs text-[#626763] truncate">{lockedMentor.headline}</p>
                <p className="text-xs font-bold text-[#1F6B4F] mt-1">
                  ₹{lockedMentor.priceMonthly.toLocaleString('en-IN')}/month
                </p>
              </div>
            </div>
          )}

          <div className="text-left p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2.5">
            <p className="font-bold text-[#171918] uppercase tracking-wider text-[11px]">
              Features locked until activation:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#626763]">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Direct 1:1 Mentor Messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Personalized 4-Week Roadmap</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Code Reviews & Assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Scheduled 1:1 Video Calls</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {lockedMentor ? (
              <Button
                id="locked-continue-checkout-btn"
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={() => navigate(`${ROUTES.MENTOR_CHECKOUT}?mentorId=${lockedMentor.id}`)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Continue to Checkout
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={() => navigate(ROUTES.MENTOR_RECOMMENDATIONS)}
              >
                Choose a Mentor
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(ROUTES.MENTOR)}
            >
              Back to Mentor Support
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!journey || !mentor) return null

  const mentorMessage = MENTOR_MESSAGES[mentor.id] ?? mentor.sampleFeedback

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="My Mentor Journey"
        subtitle={`Active mentorship with ${mentor.name} — your personalized learning plan is ready.`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Mentor Support', href: ROUTES.MENTOR },
          { label: 'My Journey' },
        ]}
      />

      {/* Demo reminder banner */}
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
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active Mentorship
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
              View Task Details
            </Button>
          </Card>

          {/* Mentor Message Card */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-[#1F6B4F]" />
              <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider">
                Message from {mentor.name}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Avatar name={mentor.name} size="sm" />
              <div className="flex-1 p-3.5 rounded-2xl bg-[#F8F7F3] border border-[#E5E5DF] text-sm text-[#171918] leading-relaxed rounded-tl-none">
                {mentorMessage}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                id="reply-mentor-btn"
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-1.5 text-xs text-[#1F6B4F] hover:underline font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reply to {mentor.name}
              </button>
              <span className="text-[10px] text-[#8E948F]">Online now</span>
            </div>
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
                  <div
                    key={week.week}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                      isCurrentWeek ? 'border-[#1F6B4F] bg-[#D8E8DE]/20' : 'border-[#E5E5DF]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCurrentWeek ? 'bg-[#1F6B4F] text-white' : 'bg-[#E5E5DF] text-[#8E948F]'
                      }`}
                    >
                      {isCurrentWeek ? <TrendingUp className="w-3 h-3" /> : week.week}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#171918]">
                          Week {week.week}: {week.focus}
                        </p>
                        {isCurrentWeek && (
                          <span className="px-2 py-0.5 rounded-full bg-[#1F6B4F] text-white text-[10px] font-semibold">
                            Active
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="px-2 py-0.5 rounded-full bg-[#F8F7F3] text-[#8E948F] text-[10px] border border-[#E5E5DF]">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {week.activities.map((a) => (
                          <span
                            key={a}
                            className="text-[10px] text-[#626763] bg-[#F8F7F3] border border-[#E5E5DF] px-2 py-0.5 rounded"
                          >
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
            <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-3">
              Quick Actions
            </p>
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
              <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider">
                Upcoming Session
              </p>
            </div>
            <p className="text-sm font-semibold text-[#171918]">Introduction & Goal Setting</p>
            <p className="text-xs text-[#626763] mt-0.5">Tomorrow · Scheduled by mentor</p>
            <p className="text-[11px] text-[#8E948F] mt-0.5">{mentor.sessionDuration} min • Video call</p>
            <Button variant="outline" size="sm" className="mt-3 w-full text-xs">
              View Session Details
            </Button>
          </Card>

          {/* Mentor contact & Message Mentor */}
          <Card className="p-5">
            <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-3">
              Mentor Support
            </p>
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
              id="message-mentor-btn"
              variant="primary"
              size="sm"
              className="mt-4 w-full text-xs"
              onClick={() => setChatOpen(true)}
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
            >
              Message Mentor
            </Button>
          </Card>
        </div>
      </div>

      {/* ─── Interactive Message Mentor Modal ─────────────────────────────── */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#E5E5DF] flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#171918] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={mentor.name} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#171918]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold">{mentor.name}</h4>
                    {mentor.verified && <BadgeCheck className="w-3.5 h-3.5 text-green-400" />}
                  </div>
                  <p className="text-[10px] text-[#8E948F]">Online • Responds {mentor.responseTime}</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F7F3]/50">
              <div className="text-center my-2">
                <span className="px-2.5 py-1 rounded-full bg-neutral-200/60 text-[10px] text-[#626763] font-medium">
                  Mentorship Active • Direct 1:1 Conversation
                </span>
              </div>

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    msg.sender === 'student' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {msg.sender === 'mentor' && (
                    <Avatar name={mentor.name} size="sm" />
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'student'
                        ? 'bg-[#1F6B4F] text-white rounded-tr-none'
                        : 'bg-white border border-[#E5E5DF] text-[#171918] rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p
                      className={`text-[9px] mt-1 text-right ${
                        msg.sender === 'student' ? 'text-green-100' : 'text-[#8E948F]'
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {isMentorTyping && (
                <div className="flex items-center gap-2 text-xs text-[#8E948F] italic">
                  <Avatar name={mentor.name} size="sm" />
                  <span>{mentor.name} is typing...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 bg-white border-t border-[#E5E5DF] flex gap-1.5 overflow-x-auto text-[11px]">
              {[
                "I started the Week 1 milestone!",
                "Can you review my project code?",
                "When is our first video session?",
              ].map((quick) => (
                <button
                  key={quick}
                  onClick={() => handleSendMessage(quick)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#F8F7F3] border border-[#E5E5DF] text-[#626763] hover:border-[#1F6B4F] hover:text-[#1F6B4F] transition-colors"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#E5E5DF] flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage()
                }}
                placeholder={`Message ${mentor.name}...`}
                className="flex-1 rounded-xl border border-[#E5E5DF] px-3.5 py-2 text-xs text-[#171918] placeholder-[#8E948F] focus:outline-none focus:border-[#1F6B4F]"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
