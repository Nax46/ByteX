import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  ArrowRight,
  BookOpen,
  Target,
  ClipboardCheck,
  Compass,
  TrendingUp,
  Layers,
  Clock,
  ChevronDown,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import { LANDING_PREVIEW } from '@/data/demo.landing'

interface StepItem {
  num: string
  title: string
  shortDesc: string
  detail: string
  badge: string
}

interface FaqItem {
  question: string
  answer: string
}

export const LandingPage: React.FC = () => {
  // Task 6: Default selected item is Step 1 (index 0)
  const [activeStep, setActiveStep] = useState<number>(0)
  // Task 11: Accessible public FAQ accordion state
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  const stepsData: StepItem[] = [
    {
      num: '01',
      title: 'Discover',
      shortDesc: 'Map your background, interests, and target roles.',
      detail:
        'Specify your academic level, technical interests, and intended career destination. SkillPath establishes your baseline profile without requiring unnecessary prerequisites.',
      badge: 'Profile & Direction',
    },
    {
      num: '02',
      title: 'Assess',
      shortDesc: 'Take short assessments to benchmark practical skills.',
      detail:
        'Complete targeted diagnostic assessments that evaluate real-world code reasoning, architectural trade-offs, and practical concepts instead of rote memorization.',
      badge: 'Diagnostics',
    },
    {
      num: '03',
      title: 'Build',
      shortDesc: 'Get a personalized roadmap based on your skill gaps.',
      detail:
        'SkillPath compares your demonstrated abilities against current software industry standards, constructing an adaptive milestone roadmap prioritized by impact.',
      badge: 'Roadmap Generation',
    },
    {
      num: '04',
      title: 'Grow',
      shortDesc: 'Learn systematically, track progress, and build career readiness.',
      detail:
        'Engage with curated documentation, complete practical exercises, track consistency streaks, and measure your quantified progress toward career readiness.',
      badge: 'Milestone Execution',
    },
  ]

  const faqItems: FaqItem[] = [
    {
      question: 'What is SkillPath?',
      answer:
        'SkillPath is a smart education and skill development platform designed to bridge the gap between academic coursework and industry expectations. It provides diagnostic assessments, personalized learning roadmaps, curated resources, and career alignment tracking.',
    },
    {
      question: 'How does SkillPath identify my skill gaps?',
      answer:
        'SkillPath evaluates your demonstrated abilities across key technical domains and benchmarks them directly against the core competencies required by hiring managers for specific engineering roles.',
    },
    {
      question: 'Do I need to complete an assessment before accessing learning paths?',
      answer:
        'While you can browse learning roadmaps and curated resources immediately, completing a diagnostic assessment calibrates your starting point so recommendations match your verified skill level.',
    },
    {
      question: 'How does the personalized learning roadmap work?',
      answer:
        'Your roadmap sequences competencies logically from fundamentals to advanced concepts. Each milestone specifies clear deliverables, estimated completion hours, and recommended official resources.',
    },
    {
      question: 'Are learning resources organized by skill level?',
      answer:
        'Yes. Every resource in our library is indexed by skill topic, content format (official documentation, interactive courses, reference articles), and difficulty level (Beginner, Intermediate, Advanced).',
    },
    {
      question: 'Can I track my learning progress over time?',
      answer:
        'Yes. SkillPath continuously tracks your consistency streak, weekly study activity, completed milestones, and overall role readiness percentage in an intuitive dashboard.',
    },
    {
      question: 'How does SkillPath assist with career planning?',
      answer:
        'SkillPath aligns your technical profile with industry tracks—such as Frontend, Backend, or Full Stack development—showing you exactly which competencies you have mastered and which skills to focus on next.',
    },
    {
      question: 'Is SkillPath suitable for complete beginners?',
      answer:
        'Yes. Whether you are beginning your computer science journey or preparing for junior developer roles, SkillPath adjusts to your baseline and guides your progress step by step.',
    },
  ]

  return (
    <div className="flex flex-col w-full bg-[#F8F7F3] text-[#171918]">
      {/* 1. HERO SECTION */}
      <section className="pt-14 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#171918] leading-[1.12]">
              Know where you are.<br />
              <span className="text-[#1F6B4F]">Build where you're going.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#626763] font-normal leading-relaxed max-w-xl">
              SkillPath helps you understand your current skills, identify what you're missing, and build a personalized path toward your academic and career goals.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to={ROUTES.ASSESSMENT}>
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-md"
                >
                  Start Skill Assessment
                </Button>
              </Link>
              <Link to={ROUTES.ROADMAP}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto glass-panel border-white/80 text-[#171918] hover:bg-white/90"
                >
                  Explore SkillPaths
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Realistic Product Dashboard Preview */}
          <div className="lg:col-span-6 relative">
            {/* Floating Top-Right Frosted Glass Badge */}
            <div className="hidden sm:flex absolute -top-4 -right-4 glass-pill rounded-full px-4 py-2 shadow-lg items-center gap-2.5 animate-float z-30">
              <div className="w-2 h-2 rounded-full bg-[#1F6B4F] animate-pulse" />
              <span className="text-xs font-semibold text-[#171918]">{LANDING_PREVIEW.streakBadgeLabel}</span>
            </div>

            {/* Floating Bottom-Left Frosted Glass Badge */}
            <div className="hidden sm:flex absolute -bottom-4 -left-4 glass-pill rounded-full px-4 py-2 shadow-lg items-center gap-2.5 animate-float-reverse z-30">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-bold text-[#A66E1D]">{LANDING_PREVIEW.streakLabel}</span>
            </div>

            {/* Glass Dashboard Mockup */}
            <GlassCard
              variant="elevated"
              spotlight={true}
              sheen={true}
              glowColor="rgba(31, 107, 79, 0.16)"
              className="p-5 sm:p-6 shadow-2xl border-white/80"
            >
              {/* Mock Window Topbar */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E5DF]/70">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D8D6CE]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D8D6CE]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D8D6CE]" />
                  <span className="text-xs font-medium text-[#626763] ml-2">app.skillpath.edu/dashboard</span>
                </div>
                <Badge variant="forest" size="sm">Active Student</Badge>
              </div>

              {/* Student Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-[#171918]">
                    {LANDING_PREVIEW.dashboardSubtitle.split(' • ')[0]}
                  </h3>
                  <p className="text-xs text-[#626763]">{LANDING_PREVIEW.dashboardSubtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#1F6B4F] bg-[#D8E8DE]/80 px-2.5 py-0.5 rounded-full border border-[#C2D8C9]">
                    {LANDING_PREVIEW.careerMatchPercent}% Career Match
                  </span>
                </div>
              </div>

              {/* Mini Metrics Row */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="p-2.5 rounded-xl glass-panel border-white/60">
                  <p className="text-[10px] text-[#626763]">Readiness</p>
                  <p className="font-heading text-base font-bold text-[#171918]">
                    <AnimatedCounter value={LANDING_PREVIEW.metrics.readiness} suffix="%" />
                  </p>
                </div>
                <div className="p-2.5 rounded-xl glass-panel border-white/60">
                  <p className="text-[10px] text-[#626763]">Learning Progress</p>
                  <p className="font-heading text-base font-bold text-[#171918]">
                    <AnimatedCounter value={LANDING_PREVIEW.metrics.learningProgress} suffix="%" />
                  </p>
                </div>
                <div className="p-2.5 rounded-xl glass-panel border-white/60">
                  <p className="text-[10px] text-[#626763]">Streak</p>
                  <p className="font-heading text-base font-bold text-[#E7A84B] flex items-center gap-1">
                    <AnimatedCounter value={LANDING_PREVIEW.metrics.streak} suffix="d" /> 🔥
                  </p>
                </div>
              </div>

              {/* In-Progress Course Card */}
              <div className="p-3.5 rounded-xl glass-panel border-white/70 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#171918]">{LANDING_PREVIEW.activeCourseTitle}</span>
                  <span className="text-[11px] text-[#626763] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#1F6B4F]" /> {LANDING_PREVIEW.activeCourseTimeLeft}
                  </span>
                </div>
                <ProgressBar value={LANDING_PREVIEW.activeCourseProgress} size="sm" variant="forest" />
              </div>

              {/* Miniature Roadmap Snippet */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[#626763]">
                  <span>Next milestone: {LANDING_PREVIEW.nextMilestoneLabel}</span>
                  <span className="font-semibold text-[#E7A84B]">{LANDING_PREVIEW.nextMilestoneProgress}%</span>
                </div>
                <div className="w-full bg-[#EAE8E1] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#E7A84B] h-full progress-shimmer"
                    style={{ width: `${LANDING_PREVIEW.nextMilestoneProgress}%` }}
                  />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 2. VALUE CAPABILITIES SECTION (TASK 4: IMPROVED 6 CARDS) */}
      <section className="py-20 bg-white/70 backdrop-blur-md border-y border-[#E5E5DF]/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Everything you need to move forward.
            </h2>
            <p className="text-sm sm:text-base text-[#626763]">
              A complete framework designed to bridge the gap between academic learning and industry readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Diagnostic Skill Assessment */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Diagnostic Skill Assessment</h3>
                <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                  Evaluate your verified capabilities with targeted technical assessments testing code reasoning, architecture patterns, and problem solving.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-[#1F6B4F] flex items-center gap-1">
                <span>Practical diagnostics</span>
              </div>
            </GlassCard>

            {/* Card 2: Skill Gap Analysis */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Skill Gap Analysis</h3>
                <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                  Direct visual comparisons showing where your current proficiencies stand against the exact technical benchmarks required by hiring teams.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-[#1F6B4F] flex items-center gap-1">
                <span>Objective benchmarks</span>
              </div>
            </GlassCard>

            {/* Card 3: Personalized Learning Roadmap */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Personalized Learning Roadmap</h3>
                <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                  An adaptive milestone sequence tailored to your identified gaps, providing clear step-by-step guidance from fundamentals to advanced concepts.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-[#1F6B4F] flex items-center gap-1">
                <span>Step-by-step milestones</span>
              </div>
            </GlassCard>

            {/* Card 4: Curated Learning Resources */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Curated Learning Resources</h3>
                <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                  High-yield tutorials, official documentation, and interactive practice exercises structured by topic and difficulty level.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-[#1F6B4F] flex items-center gap-1">
                <span>Handpicked documentation</span>
              </div>
            </GlassCard>

            {/* Card 5: Real-Time Progress Tracking */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Real-Time Progress Tracking</h3>
                <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                  Maintain consistency with study streaks, completed milestones, weekly activity metrics, and measurable career readiness percentages.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-[#1F6B4F] flex items-center gap-1">
                <span>Consistency metrics</span>
              </div>
            </GlassCard>

            {/* Card 6: Career & Role Alignment */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Career & Role Alignment</h3>
                <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                  Explore software career tracks aligned with your natural strengths, verified proficiencies, and immediate market demand.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-[#1F6B4F] flex items-center gap-1">
                <span>Market-driven pathways</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (TASK 5: NO METHODOLOGY LINE, TASK 6: STEP 1 DEFAULT SELECTED) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#171918]">
            How SkillPath Works
          </h2>
          <p className="text-sm sm:text-base text-[#626763]">
            A clear four-step path from unguided coursework to career-ready competence.
          </p>
        </div>

        {/* 4 Interactive Steps */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stepsData.map((step, idx) => {
              const isSelected = activeStep === idx
              return (
                <div
                  key={step.num}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveStep(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveStep(idx)
                    }
                  }}
                  className={`p-6 rounded-xl border transition-all duration-200 flex flex-col justify-between text-left cursor-pointer select-none ${
                    isSelected
                      ? 'bg-white border-[#1F6B4F] shadow-md ring-2 ring-[#1F6B4F]/20'
                      : 'bg-white border-[#E5E5DF] hover:border-[#D0D0C8] hover:shadow-xs'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Step ${step.num}: ${step.title}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-lg font-heading font-extrabold text-base flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-[#1F6B4F] text-white border-[#1F6B4F]'
                            : 'bg-[#D8E8DE]/60 text-[#1F6B4F] border-[#C2D8C9]'
                        }`}
                      >
                        {step.num}
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-[#D8E8DE] text-[#1F6B4F] border-[#C2D8C9]'
                            : 'bg-[#F8F7F3] text-[#8E948F] border-[#E5E5DF]'
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-[#171918]">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                      {step.shortDesc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E5DF]/70 mt-4 flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold ${
                        isSelected ? 'text-[#1F6B4F]' : 'text-[#8E948F]'
                      }`}
                    >
                      {isSelected ? 'Active Step' : 'Click to view'}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected ? 'text-[#1F6B4F] translate-x-1' : 'text-[#8E948F]'
                      }`}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Active Step Detail Callout */}
          <div className="rounded-2xl border border-[#C2D8C9] bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-200">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
                <CheckCircle2 className="w-4 h-4 text-[#1F6B4F]" />
                <span>Step {stepsData[activeStep].num} • {stepsData[activeStep].title}</span>
              </div>
              <h4 className="font-heading text-xl font-bold text-[#171918]">
                {stepsData[activeStep].title} — In Detail
              </h4>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                {stepsData[activeStep].detail}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {activeStep === 0 && (
                <Link to={ROUTES.ASSESSMENT}>
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Begin Discovery
                  </Button>
                </Link>
              )}
              {activeStep === 1 && (
                <Link to={ROUTES.ASSESSMENT}>
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Take Assessment
                  </Button>
                </Link>
              )}
              {activeStep === 2 && (
                <Link to={ROUTES.ROADMAP}>
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Roadmaps
                  </Button>
                </Link>
              )}
              {activeStep === 3 && (
                <Link to={ROUTES.RESOURCES}>
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Browse Resources
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. PUBLIC FAQ ACCORDION SECTION (TASK 11) */}
      <section className="py-20 bg-white/70 backdrop-blur-md border-y border-[#E5E5DF]/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8E8DE]/60 border border-[#C2D8C9] text-[#1F6B4F] text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-[#626763] max-w-xl mx-auto">
              Everything you need to know about SkillPath assessments, personalized roadmaps, and career readiness.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqItems.map((item, index) => {
              const isOpen = activeFaq === index
              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden bg-white ${
                    isOpen
                      ? 'border-[#1F6B4F]/40 shadow-xs'
                      : 'border-[#E5E5DF] hover:border-[#D0D0C8]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-5 sm:px-6 py-4.5 flex items-center justify-between text-left gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] cursor-pointer"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                  >
                    <span className="font-heading text-sm sm:text-base font-semibold text-[#171918]">
                      {item.question}
                    </span>
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        isOpen
                          ? 'bg-[#1F6B4F] text-white border-[#1F6B4F] rotate-180'
                          : 'bg-[#F8F7F3] text-[#626763] border-[#E5E5DF]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      className="px-5 sm:px-6 pb-5 pt-1 border-t border-[#E5E5DF]/60 animate-fadeIn"
                    >
                      <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA BANNER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="rounded-2xl border border-[#E5E5DF] bg-white p-8 sm:p-12 space-y-6 shadow-xs">
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#171918]">
            Know where you are.<br />Build where you're going.
          </h2>
          <p className="text-sm sm:text-base text-[#626763] max-w-lg mx-auto">
            Join students using SkillPath to master in-demand technical competencies and prepare for software roles.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link to={ROUTES.REGISTER}>
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started with SkillPath
              </Button>
            </Link>
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="outline" size="lg">
                View Student Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
