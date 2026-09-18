import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { mentorService } from '@/services/mentorService'
import { classifyProblem } from '@/services/mentorMatchingService'
import { matchMentors } from '@/services/mentorMatchingService'
import {
  MentorIntake,
  LearningGoal,
  ExperienceLevel,
  GOAL_LABELS,
  SKILL_AREAS,
} from '@/types/mentor.types'
import { Sparkles, ChevronRight, Users, Target, BarChart3, CheckCircle2 } from 'lucide-react'

const GOALS: { value: LearningGoal; label: string }[] = Object.entries(GOAL_LABELS).map(
  ([value, label]) => ({ value: value as LearningGoal, label })
)

const LEVELS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'Just getting started, learning the basics' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Know the basics, building real projects' },
  { value: 'advanced', label: 'Advanced', desc: 'Experienced, targeting senior roles' },
]

export const MentorPage: React.FC = () => {
  const navigate = useNavigate()
  const [problemText, setProblemText] = useState('')
  const [goal, setGoal] = useState<LearningGoal>('job_ready')
  const [level, setLevel] = useState<ExperienceLevel>('beginner')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [isMatching, setIsMatching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isMentorshipActive = mentorService.isJourneyActive()
  const paymentRecord = mentorService.getPaymentRecord()

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const handleFindMentor = async () => {
    if (!problemText.trim() || problemText.trim().length < 15) {
      setError('Please describe your challenge in at least 15 characters so we can find the best mentor for you.')
      return
    }
    setError(null)
    setIsMatching(true)

    // Simulate brief classification delay for UX
    await new Promise((r) => setTimeout(r, 1400))

    const intake: MentorIntake = {
      problemText: problemText.trim(),
      goal,
      level,
      skillAreas: selectedSkills,
    }

    try {
      const classification = classifyProblem(intake)
      const matches = matchMentors(classification)

      mentorService.storeMentorIntake(intake)
      mentorService.storeMatchedIds(matches.map((m) => m.mentor.id))

      navigate(ROUTES.MENTOR_RECOMMENDATIONS)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Find Your Mentor"
        subtitle="Tell us what you're struggling with. SkillPath will understand your learning needs and connect you with the right mentor."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Mentor Support' },
        ]}
      />

      {/* Active Mentorship Banner if already enrolled */}
      {isMentorshipActive && paymentRecord && (
        <Card className="p-4 bg-green-50/80 border-green-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-green-800">Active Mentorship</span>
                <span className="px-2 py-0.5 rounded-full bg-green-200 text-green-800 text-[10px] font-semibold">Active</span>
              </div>
              <p className="text-sm font-semibold text-[#171918]">
                {paymentRecord.mentorName} • {paymentRecord.planName}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.MENTOR_JOURNEY)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Go to My Journey
          </Button>
        </Card>
      )}

      {/* Hero value strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: <Sparkles className="w-4 h-4" />, title: 'Smart Matching', desc: 'We classify your problem and find the best-fit mentor' },
          { icon: <Users className="w-4 h-4" />, title: '3 Curated Options', desc: 'Compare three relevant mentors with free demo sessions' },
          { icon: <Target className="w-4 h-4" />, title: 'Personal Journey', desc: 'Get a custom learning plan from your chosen mentor' },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-[#D8E8DE]/30 border border-[#D8E8DE]">
            <div className="w-8 h-8 rounded-lg bg-[#1F6B4F]/10 text-[#1F6B4F] flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#171918]">{item.title}</p>
              <p className="text-[11px] text-[#626763] mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Intake Form */}
      <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF] shadow-sm">
        <div className="space-y-7">

          {/* Problem Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#171918]">
              What are you struggling with?
              <span className="text-[#D9534F] ml-0.5">*</span>
            </label>
            <p className="text-xs text-[#626763]">
              Be specific — the more detail you share, the better your mentor match.
            </p>
            <textarea
              id="mentor-problem-input"
              value={problemText}
              onChange={(e) => { setProblemText(e.target.value); setError(null) }}
              placeholder={`For example:\n"I know HTML and CSS but I struggle to build real React projects. I don't know how to structure components or connect to APIs. I'm preparing for frontend placements but my portfolio is empty."`}
              rows={5}
              className="w-full rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] p-4 text-sm text-[#171918] placeholder-[#8E948F] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors resize-none leading-relaxed"
            />
            <p className="text-[11px] text-[#8E948F] text-right">{problemText.length} characters</p>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <label htmlFor="mentor-goal-select" className="block text-sm font-semibold text-[#171918] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#1F6B4F]" />
              What is your main goal?
            </label>
            <select
              id="mentor-goal-select"
              value={goal}
              onChange={(e) => setGoal(e.target.value as LearningGoal)}
              className="w-full sm:w-96 rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] px-3 py-2.5 text-sm text-[#171918] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors cursor-pointer"
            >
              {GOALS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#171918] flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#1F6B4F]" />
              Your current experience level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLevel(l.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-150 ${
                    level === l.value
                      ? 'border-[#1F6B4F] bg-[#D8E8DE]/30'
                      : 'border-[#E5E5DF] bg-white hover:border-[#1F6B4F]/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                      level === l.value ? 'border-[#1F6B4F]' : 'border-[#8E948F]'
                    }`}>
                      {level === l.value && <div className="w-2 h-2 rounded-full bg-[#1F6B4F]" />}
                    </div>
                    <span className="text-sm font-semibold text-[#171918]">{l.label}</span>
                  </div>
                  <p className="text-[11px] text-[#626763] ml-5">{l.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Skill Areas */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#171918]">
              Which areas do you need help with?
              <span className="text-xs font-normal text-[#626763] ml-2">(optional, select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILL_AREAS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                    selectedSkills.includes(skill)
                      ? 'bg-[#1F6B4F] text-white border-[#1F6B4F]'
                      : 'bg-white text-[#626763] border-[#E5E5DF] hover:border-[#1F6B4F]/50 hover:text-[#1F6B4F]'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              id="mentor-find-btn"
              variant="primary"
              onClick={handleFindMentor}
              isLoading={isMatching}
              rightIcon={!isMatching ? <ChevronRight className="w-4 h-4" /> : undefined}
              className="sm:w-auto w-full"
            >
              {isMatching ? 'Finding your mentors…' : 'Find My Mentor'}
            </Button>
            {isMatching && (
              <p className="text-xs text-[#626763] animate-pulse">
                Classifying your learning needs and matching mentors…
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
