import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { MOCK_SKILLS } from '@/mocks/skills.mock'
import { ROUTES } from '@/constants/routes'
import { Target, ClipboardCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

export const SkillsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  const categories = ['ALL', 'Frontend', 'Backend', 'Foundations', 'Tools', 'Methodology']

  const filteredSkills = selectedCategory === 'ALL'
    ? MOCK_SKILLS
    : MOCK_SKILLS.filter((s) => {
        if (selectedCategory === 'Frontend') return ['HTML & CSS', 'JavaScript', 'React'].includes(s.name)
        if (selectedCategory === 'Backend') return ['SQL', 'Node.js', 'APIs'].includes(s.name)
        if (selectedCategory === 'Tools') return ['Git & GitHub', 'Git'].includes(s.name)
        if (selectedCategory === 'Foundations') return ['Problem Solving', 'Data Structures'].includes(s.name)
        return s.category === selectedCategory
      })

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="My Skills"
        subtitle="Understand your current competencies, track verified proficiency scores, and prepare for your target career."
        actions={
          <div className="flex items-center gap-2.5">
            <Link to={ROUTES.SKILL_GAP}>
              <Button variant="outline" size="sm" leftIcon={<Target className="w-3.5 h-3.5 text-[#1F6B4F]" />}>
                Skill Gap Matrix
              </Button>
            </Link>
            <Link to={ROUTES.ASSESSMENT}>
              <Button variant="primary" size="sm" leftIcon={<ClipboardCheck className="w-3.5 h-3.5" />}>
                Take Assessment
              </Button>
            </Link>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'My Skills' },
        ]}
      />

      {/* Snapshot Summary Banner */}
      <Card className="p-6 bg-white border-[#E5E5DF] animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Current Competency Overview
            </span>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-[#171918] mt-1">
              6 Verified Skills Evaluated
            </h3>
            <p className="text-xs text-[#626763] mt-0.5">
              Target role: <strong className="text-[#171918]">Frontend Developer</strong> • Average mastery: 63%
            </p>
          </div>
          <Link to={ROUTES.SKILL_GAP} className="group">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover-arrow" />} className="group">
              Analyze Skill Gaps
            </Button>
          </Link>
        </div>

        {/* Quick horizontal bars for the signature 6 skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]/60 space-y-1.5 hover-lift">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#171918]">HTML & CSS</span>
              <span className="font-bold text-[#1F6B4F]">
                <AnimatedCounter end={85} suffix="%" />
              </span>
            </div>
            <ProgressBar value={85} variant="forest" size="sm" />
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]/60 space-y-1.5 hover-lift">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#171918]">JavaScript</span>
              <span className="font-bold text-[#1F6B4F]">
                <AnimatedCounter end={78} suffix="%" />
              </span>
            </div>
            <ProgressBar value={78} variant="forest" size="sm" />
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]/60 space-y-1.5 hover-lift">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#171918]">Problem Solving</span>
              <span className="font-bold text-[#1F6B4F]">
                <AnimatedCounter end={66} suffix="%" />
              </span>
            </div>
            <ProgressBar value={66} variant="forest" size="sm" />
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]/60 space-y-1.5 hover-lift">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#171918]">SQL</span>
              <span className="font-bold text-[#1F6B4F]">
                <AnimatedCounter end={55} suffix="%" />
              </span>
            </div>
            <ProgressBar value={55} variant="primary" size="sm" />
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]/60 space-y-1.5 hover-lift">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#171918]">React</span>
              <span className="font-bold text-[#A66E1D]">
                <AnimatedCounter end={54} suffix="%" />
              </span>
            </div>
            <ProgressBar value={54} variant="warning" size="sm" />
          </div>

          <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]/60 space-y-1.5 hover-lift">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#171918]">Git</span>
              <span className="font-bold text-[#A66E1D]">
                <AnimatedCounter end={41} suffix="%" />
              </span>
            </div>
            <ProgressBar value={41} variant="warning" size="sm" />
          </div>
        </div>
      </Card>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#1F6B4F] text-white shadow-xs font-semibold scale-[1.02]'
                : 'bg-white border border-[#E5E5DF] text-[#626763] hover:text-[#171918] hover:border-[#D0D0C8]'
            }`}
          >
            {cat === 'ALL' ? 'All Skills' : cat}
          </button>
        ))}
      </div>

      {/* Detailed Skill Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSkills.map((skill, index) => {
          const staggerClass = index % 3 === 0 ? 'stagger-1' : index % 3 === 1 ? 'stagger-2' : 'stagger-3'
          return (
            <Card
              key={skill.id}
              hoverEffect
              className={`p-5 flex flex-col justify-between bg-white border-[#E5E5DF] animate-slideUp ${staggerClass} hover-lift group`}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <Badge variant="forest" size="sm">{skill.category}</Badge>
                  <span className="text-xs font-bold text-[#1F6B4F]">
                    {skill.progress}%
                  </span>
                </div>
                <div>
                  <h4 className="font-heading text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors duration-200">
                    {skill.name}
                  </h4>
                  <p className="text-xs text-[#626763] mt-1">
                    Proficiency Level {skill.currentLevel} of {skill.targetLevel}
                  </p>
                </div>
                <ProgressBar
                  value={skill.progress}
                  variant={skill.progress >= 75 ? 'forest' : skill.progress >= 50 ? 'primary' : 'warning'}
                  size="sm"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5E5DF] flex items-center justify-between text-xs text-[#626763]">
                <span className="flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-[#1F6B4F]" /> Verified
                </span>
                <Link
                  to={ROUTES.ASSESSMENT}
                  className="text-[#1F6B4F] font-semibold hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  Assess now →
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

