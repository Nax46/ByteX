import React from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { ROUTES } from '@/constants/routes'
import {
  MOCK_SKILL_COMPARISONS,
  MOCK_STUDENT_STRENGTHS,
  MOCK_FOCUS_NEXT,
} from '@/mocks/skills.mock'
import {
  ArrowRight,
  CheckCircle2,
  Target,
} from 'lucide-react'

export const SkillGapPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. HEADER & READINESS HERO */}
      <PageHeader
        title="Skill Gap Analysis"
        subtitle="Objective comparison of your demonstrated abilities against industry standards for your target role."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'My Skills', href: ROUTES.SKILLS },
          { label: 'Skill Gap' },
        ]}
      />

      {/* Hero Callout Banner */}
      <Card glass="elevated" sheen className="p-6 sm:p-8 border-white/80 animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E5E5DF]/70">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[#1F6B4F] text-xs font-semibold">
              <Target className="w-3.5 h-3.5" />
              Target Role: Frontend Developer
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Your skill gap is your roadmap.
            </h2>
            <p className="text-xs sm:text-sm text-[#626763] max-w-xl leading-relaxed">
              Instead of learning everything from scratch, focus directly on the specific gaps separating your current abilities from junior to mid-level engineering benchmarks.
            </p>
          </div>

          <div className="p-4 rounded-xl glass-panel border-white/80 text-center sm:text-right shrink-0 hover-lift">
            <p className="text-xs text-[#626763]">Current Career Readiness</p>
            <p className="font-heading text-3xl font-extrabold text-[#1F6B4F]">
              <AnimatedCounter value={72} suffix="%" />
            </p>
            <span className="text-[11px] font-medium text-[#1F6B4F] bg-[#D8E8DE]/80 px-2.5 py-0.5 rounded-full mt-1 inline-block border border-[#C2D8C9]">
              Strong Trajectory
            </span>
          </div>
        </div>

        {/* 2. SKILL COMPARISON VISUALIZATION */}
        <div className="pt-6 space-y-5">
          <div className="flex justify-between items-center text-xs font-semibold text-[#626763] uppercase tracking-wider">
            <span>Skill</span>
            <span>Current vs. Target Level</span>
          </div>

          <div className="space-y-3.5">
            {MOCK_SKILL_COMPARISONS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl glass-panel border-white/80 space-y-2.5 transition-all duration-200 hover:border-[#1F6B4F]/40 hover-lift group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-heading text-sm sm:text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
                      {item.skillName}
                    </span>
                    <span className="text-xs text-[#626763] ml-2">({item.category})</span>
                  </div>
                  <div className="text-xs font-semibold">
                    <span className="text-[#1F6B4F]">Current {item.currentPercent}%</span>
                    <span className="text-[#8E948F] mx-2">→</span>
                    <span className="text-[#171918]">Target {item.targetPercent}%</span>
                  </div>
                </div>

                {/* Overlaid Dual Bar */}
                <div className="relative w-full h-3 bg-[#EAE8E1] rounded-full overflow-hidden">
                  {/* Target benchmark background fill */}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-[#E5E5DF] rounded-full"
                    style={{ width: `${item.targetPercent}%` }}
                  />
                  {/* Current progress fill with shimmer */}
                  <div
                    className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-1000 ${
                      item.currentPercent >= item.targetPercent
                        ? 'bg-[#1F6B4F]'
                        : item.currentPercent >= 50
                        ? 'bg-[#1F6B4F] progress-shimmer'
                        : 'bg-[#E7A84B] progress-shimmer'
                    }`}
                    style={{ width: `${item.currentPercent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#626763]">
                  <span>{item.status}</span>
                  <span className={item.gapPercent > 0 ? 'text-[#A66E1D] font-semibold' : 'text-[#1F6B4F] font-semibold'}>
                    {item.gapPercent > 0 ? `Gap: +${item.gapPercent}% needed` : 'Benchmark Met ✓'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 3. TWO-COLUMN: YOUR STRENGTHS VS FOCUS NEXT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Strengths */}
        <Card glass="interactive" className="p-6 border-white/80 space-y-4 hover-lift">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5DF]/70">
            <CheckCircle2 className="w-5 h-5 text-[#1F6B4F]" />
            <h3 className="font-heading text-base font-bold text-[#171918]">Your strengths</h3>
          </div>
          <p className="text-xs text-[#626763]">
            Verified competencies where you already meet or exceed entry-level expectations:
          </p>

          <ul className="space-y-3 pt-1">
            {MOCK_STUDENT_STRENGTHS.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#171918]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B4F] mt-2 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Focus Next */}
        <Card glass="interactive" className="p-6 border-white/80 space-y-4 hover-lift">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5DF]/70">
            <Target className="w-5 h-5 text-[#E7A84B]" />
            <h3 className="font-heading text-base font-bold text-[#171918]">Focus next</h3>
          </div>
          <p className="text-xs text-[#626763]">
            Highest-priority skills to study next to close your gap:
          </p>

          <div className="space-y-2.5 pt-1">
            {MOCK_FOCUS_NEXT.map((focus, idx) => (
              <div key={idx} className="p-3 rounded-xl glass-panel border-white/70 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#171918]">{focus.title}</span>
                  <Badge variant="warning" size="sm">Priority</Badge>
                </div>
                <p className="text-[11px] text-[#626763]">{focus.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. NATURAL RECOMMENDATION CALLOUT */}
      <div className="p-6 sm:p-7 rounded-2xl glass-panel border-[#C2D8C9] space-y-4 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
            Path Synthesis
          </span>
          <p className="font-heading text-base sm:text-lg font-semibold text-[#171918] leading-relaxed">
            “Your JavaScript foundation is already strong. React is the next logical step toward your current career goal.”
          </p>
        </div>

        <div className="pt-2">
          <Link to={ROUTES.ROADMAP}>
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Build My Learning Path →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
