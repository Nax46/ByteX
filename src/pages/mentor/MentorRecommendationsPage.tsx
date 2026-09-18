import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/constants/routes'
import { mentorService } from '@/services/mentorService'
import { classifyProblem, matchMentors } from '@/services/mentorMatchingService'
import {
  MentorMatch,
  ClassificationResult,
  PROBLEM_CATEGORY_LABELS,
} from '@/types/mentor.types'
import {
  Star,
  Clock,
  Users,
  BadgeCheck,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3 h-3 ${s <= Math.round(rating) ? 'fill-[#E7A84B] text-[#E7A84B]' : 'text-[#E5E5DF]'}`}
      />
    ))}
    <span className="text-xs text-[#626763] ml-1">{rating.toFixed(1)}</span>
  </div>
)

export const MentorRecommendationsPage: React.FC = () => {
  const navigate = useNavigate()
  const [matches, setMatches] = useState<MentorMatch[]>([])
  const [classification, setClassification] = useState<ClassificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const intake = mentorService.getMentorIntake()
    if (!intake) {
      navigate(ROUTES.MENTOR, { replace: true })
      return
    }
    try {
      const result = classifyProblem(intake)
      const top3 = matchMentors(result)
      setClassification(result)
      setMatches(top3)
      mentorService.storeMatchedIds(top3.map((m) => m.mentor.id))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-[#626763]">
        <Sparkles className="w-8 h-8 text-[#1F6B4F] animate-spin" />
        <p className="text-sm">Finding mentors that match your goals…</p>
      </div>
    )
  }

  if (error || matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="text-sm text-[#626763]">We couldn't find an exact mentor match right now.</p>
        <p className="text-xs text-[#8E948F]">Try adjusting your goal or skill area.</p>
        <Button variant="outline" onClick={() => navigate(ROUTES.MENTOR)} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Your Recommended Mentors"
        subtitle="Based on your goals and learning needs, these mentors are a strong match for you."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Mentor Support', href: ROUTES.MENTOR },
          { label: 'Recommendations' },
        ]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.MENTOR)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Edit Intake
          </Button>
        }
      />

      {/* Classification Summary */}
      {classification && (
        <Card className="p-5 bg-[#D8E8DE]/20 border-[#D8E8DE]">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1F6B4F] uppercase tracking-wider mb-2">What SkillPath detected</p>
              <p className="text-sm text-[#171918] font-medium">{classification.summary}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-[#1F6B4F] text-white text-[11px] font-semibold">
                {PROBLEM_CATEGORY_LABELS[classification.primaryCategory]}
              </span>
              {classification.secondaryCategories.slice(0, 2).map((cat) => (
                <span key={cat} className="px-2.5 py-1 rounded-full bg-[#D8E8DE] text-[#1F6B4F] text-[11px] font-medium">
                  {PROBLEM_CATEGORY_LABELS[cat]}
                </span>
              ))}
              {classification.detectedSkills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-full bg-[#F8F7F3] border border-[#E5E5DF] text-[#626763] text-[11px]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 3 Mentor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {matches.map((match, idx) => {
          const { mentor } = match
          const profilePath = `/mentor/${mentor.id}`
          const demoPath = `/mentor/${mentor.id}/demo`
          return (
            <Card key={mentor.id} hoverEffect className="flex flex-col p-0 overflow-hidden">
              {/* Top accent */}
              <div className={`h-1.5 w-full ${idx === 0 ? 'bg-[#1F6B4F]' : idx === 1 ? 'bg-[#E7A84B]' : 'bg-[#8E948F]'}`} />

              <div className="p-5 flex flex-col flex-1 gap-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <Avatar name={mentor.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-[#171918] truncate">{mentor.name}</span>
                      {mentor.verified && (
                        <BadgeCheck className="w-4 h-4 text-[#1F6B4F] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#626763] mt-0.5 line-clamp-2">{mentor.headline}</p>
                    <StarRating rating={mentor.rating} />
                  </div>
                </div>

                {/* Expertise chips */}
                <div className="flex flex-wrap gap-1">
                  {mentor.expertise.slice(0, 3).map((e) => (
                    <span key={e} className="px-2 py-0.5 rounded-full bg-[#F8F7F3] border border-[#E5E5DF] text-[10px] text-[#626763]">
                      {e}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#626763]">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#1F6B4F]" />
                    <span>{mentor.studentsMentored}+ students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                    <span>{mentor.responseTime}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1F6B4F]" />
                    <span>{mentor.mentoringStyle}</span>
                  </div>
                </div>

                {/* Match reason */}
                <div className="p-3 rounded-lg bg-[#D8E8DE]/30 border border-[#D8E8DE]">
                  <p className="text-[11px] text-[#1F6B4F] font-semibold mb-1.5">Why this mentor?</p>
                  {match.matchHighlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-[#1F6B4F] mt-0.5 shrink-0" />
                      <p className="text-[11px] text-[#626763]">{h}</p>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#171918]">
                    {mentorService.formatPrice(mentor.priceMonthly)}
                  </span>
                  <span className="text-[10px] text-[#8E948F]">{mentor.sessionDuration} min sessions</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-1.5 pt-1 mt-auto">
                  <Link to={profilePath} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Profile
                    </Button>
                  </Link>
                  <Link to={demoPath} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Try Demo
                    </Button>
                  </Link>
                  <Link
                    to={`${ROUTES.MENTOR_CHECKOUT}?mentorId=${mentor.id}`}
                    onClick={() => mentorService.storeSelectedMentorId(mentor.id)}
                    className="flex-1"
                  >
                    <Button variant="primary" size="sm" className="w-full text-xs" rightIcon={<ChevronRight className="w-3 h-3" />}>
                      Select
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Compare hint */}
      <p className="text-center text-xs text-[#8E948F] pb-2">
        Explore each mentor's profile and demo before making your choice.
        All three offer a free introduction session.
      </p>
    </div>
  )
}
