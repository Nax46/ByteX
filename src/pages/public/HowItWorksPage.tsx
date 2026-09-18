import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ArrowRight, Check } from 'lucide-react'

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Discover',
      subtitle: 'Map your background and interests',
      description:
        'Tell us about your academic track, verified strengths, technical interests, and the career path you want to pursue.',
      points: [
        'Enter degree program, year, and college details',
        'Declare your target career track (e.g. Frontend Developer)',
        'Set your weekly study availability and preferences',
      ],
    },
    {
      num: '02',
      title: 'Assess',
      subtitle: 'Understand your baseline',
      description:
        'Take focused, distraction-free diagnostic assessments to evaluate your current abilities without trick questions.',
      points: [
        'Practical multiple-choice questions & architectural scenarios',
        'Immediate skill mastery evaluation across competencies',
        'Identify existing strengths versus areas needing attention',
      ],
    },
    {
      num: '03',
      title: 'Build',
      subtitle: 'Construct your roadmap',
      description:
        'SkillPath calculates your exact skill gap against your career target and synthesizes a structured, milestone-by-milestone pathway.',
      points: [
        'Prioritized sequence of high-impact skills to focus next',
        'Clear milestone breakdown with realistic time estimates',
        'Every recommendation explains WHY it was suggested',
      ],
    },
    {
      num: '04',
      title: 'Grow',
      subtitle: 'Learn and advance',
      description:
        'Learn systematically, practice with hands-on challenges, track weekly progress, and prepare for your next professional opportunity.',
      points: [
        'Curated resources: courses, exercises, and documentation',
        'Continuous progress analytics and streak tracking',
        'Dynamic readiness score updates as you complete stages',
      ],
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-fadeIn">
      <PageHeader
        title="How SkillPath Works"
        subtitle="Understand yourself. Know what to learn next. Build the skills for where you want to go."
        breadcrumbs={[
          { label: 'Home', href: ROUTES.HOME },
          { label: 'How It Works' },
        ]}
      />

      <div className="space-y-6 pt-4">
        {steps.map((step, idx) => (
          <Card key={idx} hoverEffect className="p-6 sm:p-8 bg-white border-[#E5E5DF]">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-12 h-12 rounded-xl bg-[#D8E8DE]/60 border border-[#1F6B4F]/20 flex items-center justify-center text-[#1F6B4F] font-heading font-extrabold text-base shrink-0">
                {step.num}
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-heading text-lg font-bold text-[#171918]">{step.title}</h3>
                  <Badge variant="forest" size="sm">{step.subtitle}</Badge>
                </div>
                <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                  {step.description}
                </p>
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {step.points.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-xs text-[#171918]">
                      <Check className="w-3.5 h-3.5 text-[#1F6B4F] shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-14 text-center">
        <Link to={ROUTES.REGISTER}>
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Start Your Journey Now
          </Button>
        </Link>
      </div>
    </div>
  )
}
