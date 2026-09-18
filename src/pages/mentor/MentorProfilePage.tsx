import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/constants/routes'
import { mentorService } from '@/services/mentorService'
import { Mentor } from '@/types/mentor.types'
import {
  Star,
  BadgeCheck,
  Clock,
  Users,
  ChevronRight,
  ArrowLeft,
  Check,
  Calendar,
  MessageSquare,
  Zap,
} from 'lucide-react'

const StarRating: React.FC<{ rating: number; count: number }> = ({ rating, count }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'fill-[#E7A84B] text-[#E7A84B]' : 'text-[#E5E5DF]'}`} />
    ))}
    <span className="text-sm text-[#626763] ml-1">{rating.toFixed(1)} ({count} reviews)</span>
  </div>
)

export const MentorProfilePage: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>()
  const navigate = useNavigate()
  const [mentor, setMentor] = useState<Mentor | null>(null)

  useEffect(() => {
    if (!mentorId) { navigate(ROUTES.MENTOR_RECOMMENDATIONS); return }
    const found = mentorService.getMentorById(mentorId)
    if (!found) { navigate(ROUTES.MENTOR_RECOMMENDATIONS); return }
    setMentor(found)
  }, [mentorId, navigate])

  if (!mentor) return null

  const demoPath = `/mentor/${mentor.id}/demo`
  const availMap = {
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    evenings: 'Evenings',
    flexible: 'Flexible schedule',
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      <PageHeader
        title={mentor.name}
        subtitle={mentor.headline}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Mentor Support', href: ROUTES.MENTOR },
          { label: 'Mentors', href: ROUTES.MENTOR_RECOMMENDATIONS },
          { label: mentor.name },
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.MENTOR_RECOMMENDATIONS)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            All Mentors
          </Button>
        }
      />

      {/* Hero Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <Avatar name={mentor.name} size="xl" className="shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h2 className="font-heading text-xl font-bold text-[#171918]">{mentor.name}</h2>
              {mentor.verified && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified Mentor
                </span>
              )}
            </div>
            <p className="text-sm text-[#626763] mb-2">{mentor.headline}</p>
            <StarRating rating={mentor.rating} count={mentor.reviewCount} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Experience', value: `${mentor.experienceYears} years` },
                { label: 'Students', value: `${mentor.studentsMentored}+` },
                { label: 'Response', value: mentor.responseTime },
                { label: 'Languages', value: mentor.languages.join(', ') },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-2.5 rounded-lg bg-[#F8F7F3]">
                  <p className="text-sm font-bold text-[#171918]">{stat.value}</p>
                  <p className="text-[10px] text-[#626763]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* About */}
          <Card className="p-5">
            <h3 className="font-heading font-semibold text-[#171918] mb-3">About</h3>
            <p className="text-sm text-[#626763] leading-relaxed">{mentor.bio}</p>
          </Card>

          {/* Expertise */}
          <Card className="p-5">
            <h3 className="font-heading font-semibold text-[#171918] mb-3">Expertise & Skills</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.expertise.map((e) => (
                    <span key={e} className="px-3 py-1 rounded-full bg-[#D8E8DE]/50 text-[#1F6B4F] text-xs font-medium border border-[#D8E8DE]">{e}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#626763] uppercase tracking-wider mb-2">Technologies & Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.skills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-[#F8F7F3] border border-[#E5E5DF] text-xs text-[#626763]">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* What I can help you with */}
          <Card className="p-5">
            <h3 className="font-heading font-semibold text-[#171918] mb-3">What I Can Help You With</h3>
            <div className="space-y-2">
              {mentor.helpsWith.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1F6B4F] mt-0.5 shrink-0" />
                  <span className="text-sm text-[#626763]">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Sample 4-week plan */}
          <Card className="p-5">
            <h3 className="font-heading font-semibold text-[#171918] mb-1">Sample Mentorship Journey</h3>
            <p className="text-xs text-[#8E948F] mb-4">A typical 4-week engagement with this mentor</p>
            <div className="space-y-3">
              {mentor.weeklyPlan.map((week) => (
                <div key={week.week} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-[#1F6B4F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {week.week}
                    </div>
                    {week.week < 4 && <div className="w-px flex-1 bg-[#E5E5DF] mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-semibold text-[#171918]">Week {week.week}: {week.focus}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {week.activities.map((a) => (
                        <span key={a} className="text-[11px] text-[#626763] bg-[#F8F7F3] border border-[#E5E5DF] px-2 py-0.5 rounded">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar: Pricing + CTA */}
        <div className="space-y-4">
          <Card className="p-5 sticky top-24">
            <p className="text-2xl font-bold text-[#171918]">{mentorService.formatPrice(mentor.priceMonthly)}</p>
            <p className="text-xs text-[#8E948F] mb-4">per month • {mentor.sessionDuration} min sessions</p>

            <div className="space-y-2.5 mb-5 text-xs text-[#626763]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#1F6B4F]" />
                <span>{availMap[mentor.availability]} availability</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                <span>Responds {mentor.responseTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#1F6B4F]" />
                <span>{mentor.mentoringStyle}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#1F6B4F]" />
                <span>{mentor.studentsMentored}+ students mentored</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link to={demoPath}>
                <Button variant="primary" className="w-full" rightIcon={<Zap className="w-4 h-4" />}>
                  Try Mentor Demo
                </Button>
              </Link>
              <Link to={demoPath}>
                <Button variant="outline" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Choose This Mentor
                </Button>
              </Link>
            </div>

            <p className="text-[10px] text-[#8E948F] text-center mt-3">
              Free intro demo before committing to a plan.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
