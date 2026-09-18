import React from 'react'
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
  Sparkles,
} from 'lucide-react'

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full bg-[#F8F7F3] text-[#171918]">
      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-[#1F6B4F] text-xs font-semibold tracking-tight shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <span>Next-generation academic & career roadmap</span>
            </div>

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

            <p className="text-xs text-[#626763] pt-1">
              Takes 5 minutes • Free for students • No credit card required
            </p>
          </div>

          {/* Right Realistic Product Dashboard Preview */}
          <div className="lg:col-span-6 relative">
            {/* Floating Top-Right Frosted Glass Badge */}
            <div className="hidden sm:flex absolute -top-4 -right-4 glass-pill rounded-full px-4 py-2 shadow-lg items-center gap-2.5 animate-float z-30">
              <div className="w-2 h-2 rounded-full bg-[#1F6B4F] animate-pulse" />
              <span className="text-xs font-semibold text-[#171918]">Roadmap Calibrated</span>
            </div>

            {/* Floating Bottom-Left Frosted Glass Badge */}
            <div className="hidden sm:flex absolute -bottom-4 -left-4 glass-pill rounded-full px-4 py-2 shadow-lg items-center gap-2.5 animate-float-reverse z-30">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-bold text-[#A66E1D]">12-Day Study Streak</span>
            </div>

            {/* Senior 25+ Yrs Glass Dashboard Mockup */}
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
                  <h3 className="font-heading text-sm sm:text-base font-bold text-[#171918]">Alex Patel</h3>
                  <p className="text-xs text-[#626763]">Targeting Frontend Developer • BCA Sem 3</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#1F6B4F] bg-[#D8E8DE]/80 px-2.5 py-0.5 rounded-full border border-[#C2D8C9]">
                    72% Career Match
                  </span>
                </div>
              </div>

              {/* Mini Metrics Row with Refractive Frosted Panels */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="p-2.5 rounded-xl glass-panel border-white/60">
                  <p className="text-[10px] text-[#626763]">Readiness</p>
                  <p className="font-heading text-base font-bold text-[#171918]">
                    <AnimatedCounter value={72} suffix="%" />
                  </p>
                </div>
                <div className="p-2.5 rounded-xl glass-panel border-white/60">
                  <p className="text-[10px] text-[#626763]">Learning Progress</p>
                  <p className="font-heading text-base font-bold text-[#171918]">
                    <AnimatedCounter value={64} suffix="%" />
                  </p>
                </div>
                <div className="p-2.5 rounded-xl glass-panel border-white/60">
                  <p className="text-[10px] text-[#626763]">Streak</p>
                  <p className="font-heading text-base font-bold text-[#E7A84B] flex items-center gap-1">
                    <AnimatedCounter value={12} suffix="d" /> 🔥
                  </p>
                </div>
              </div>

              {/* In-Progress Course Card */}
              <div className="p-3.5 rounded-xl glass-panel border-white/70 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#171918]">JavaScript Fundamentals</span>
                  <span className="text-[11px] text-[#626763] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#1F6B4F]" /> 35m left
                  </span>
                </div>
                <ProgressBar value={64} size="sm" variant="forest" />
              </div>

              {/* Miniature Roadmap Snippet */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[#626763]">
                  <span>Next milestone: Stage 03 — Git & GitHub</span>
                  <span className="font-semibold text-[#E7A84B]">54%</span>
                </div>
                <div className="w-full bg-[#EAE8E1] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#E7A84B] h-full w-[54%] progress-shimmer" />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 2. TRUST / VALUE CAPABILITIES SECTION */}
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
            {/* 1 */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-[#171918]">1. Personalized Learning</h3>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                Adaptive milestones calibrated to your pace, schedule, and specific college coursework.
              </p>
            </GlassCard>

            {/* 2 */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-[#171918]">2. Skill Gap Analysis</h3>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                Clear comparisons showing where your abilities stand versus what hiring managers expect.
              </p>
            </GlassCard>

            {/* 3 */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-[#171918]">3. Intelligent Assessments</h3>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                Short, diagnostic evaluations that test practical code reasoning instead of memorization.
              </p>
            </GlassCard>

            {/* 4 */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-[#171918]">4. Career Guidance</h3>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                Explore tech roles matched to your natural strengths, interests, and verified competencies.
              </p>
            </GlassCard>

            {/* 5 */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-[#171918]">5. Progress Tracking</h3>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                Track consistency streaks, weekly commits, and transparent competency growth curves.
              </p>
            </GlassCard>

            {/* 6 */}
            <GlassCard
              variant="interactive"
              spotlight={true}
              glowColor="rgba(31, 107, 79, 0.12)"
              className="p-6 space-y-3 cursor-default group hover-lift border-white/80"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5DF] text-[#1F6B4F] flex items-center justify-center group-hover:bg-[#1F6B4F] group-hover:text-white group-hover:border-[#1F6B4F] transition-all duration-200">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-heading text-base font-bold text-[#171918]">6. Learning Resources</h3>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                Hand-picked official documentation, practical exercises, and interactive coding sandboxes.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <Badge variant="forest" size="sm">Structured Methodology</Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#171918]">
            How SkillPath Works
          </h2>
          <p className="text-sm sm:text-base text-[#626763]">
            A clear four-step path from unguided coursework to career-ready competence.
          </p>
        </div>

        {/* 4 Steps Connected by Animated Horizontal Path */}
        <div className="relative">
          {/* Subtle animated signature flowing line on desktop */}
          <div className="hidden lg:block absolute top-6 left-[12%] right-[12%] h-[2px] signature-path-flow opacity-60 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E5DF] flex flex-col items-start space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#D0D0C8] group">
              <div className="w-12 h-12 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] font-heading font-extrabold text-base flex items-center justify-center border border-[#C2D8C9] group-hover:bg-[#1F6B4F] group-hover:text-white transition-colors">
                01
              </div>
              <h3 className="font-heading text-lg font-bold text-[#171918]">Discover</h3>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                Tell us about your interests, education, current skills, and goals.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E5DF] flex flex-col items-start space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#D0D0C8] group">
              <div className="w-12 h-12 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] font-heading font-extrabold text-base flex items-center justify-center border border-[#C2D8C9] group-hover:bg-[#1F6B4F] group-hover:text-white transition-colors">
                02
              </div>
              <h3 className="font-heading text-lg font-bold text-[#171918]">Assess</h3>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                Take short assessments to understand your current skill level.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E5DF] flex flex-col items-start space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#D0D0C8] group">
              <div className="w-12 h-12 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] font-heading font-extrabold text-base flex items-center justify-center border border-[#C2D8C9] group-hover:bg-[#1F6B4F] group-hover:text-white transition-colors">
                03
              </div>
              <h3 className="font-heading text-lg font-bold text-[#171918]">Build</h3>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                Get a personalized learning roadmap based on your skill gaps.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E5DF] flex flex-col items-start space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#1F6B4F]/40 group">
              <div className="w-12 h-12 rounded-lg bg-[#1F6B4F] text-white font-heading font-extrabold text-base flex items-center justify-center border border-[#1F6B4F] animate-pathPulse">
                04
              </div>
              <h3 className="font-heading text-lg font-bold text-[#171918]">Grow</h3>
              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                Learn, practice, track progress, and prepare for your next opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA BANNER */}
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
