import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import {
  Compass,
  Target,
  ClipboardCheck,
  Briefcase,
  TrendingUp,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

export const FeaturesPage: React.FC = () => {
  const capabilities = [
    {
      icon: <Compass className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Personalized Learning Paths',
      badge: 'Core Engine',
      description:
        'A continuous, step-by-step roadmap tailored specifically to your existing skills and the exact requirements of your target role.',
    },
    {
      icon: <Target className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Skill Gap Analysis',
      badge: 'Gap Matrix',
      description:
        'Compare your current proficiency directly against industry benchmarks to identify exactly which concepts need focus next.',
    },
    {
      icon: <ClipboardCheck className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Intelligent Assessments',
      badge: 'Diagnostics',
      description:
        'Practical evaluations designed around real-world problem solving, clean architectures, and modern engineering standards.',
    },
    {
      icon: <Briefcase className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Career Guidance & Tracks',
      badge: 'Explorer',
      description:
        'Explore where your skills could take you with realistic educational matching across Frontend, UI/UX, Data, Cybersecurity, and AI.',
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Progress Tracking & Analytics',
      badge: 'Growth',
      description:
        'Keep momentum with study streak metrics, weekly learning activity logs, and transparent skill mastery curves.',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Curated Learning Resources',
      badge: 'Library',
      description:
        'High-yield courses, articles, interactive practice exercises, and hands-on projects organized by skill and difficulty.',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-fadeIn">
      <PageHeader
        title="Everything you need to move forward."
        subtitle="SkillPath brings together diagnostics, personalized pathways, and career alignment in a unified platform."
        breadcrumbs={[
          { label: 'Home', href: ROUTES.HOME },
          { label: 'Features' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {capabilities.map((feat, idx) => (
          <Card key={idx} hoverEffect className="p-6 flex flex-col justify-between bg-white border-[#E5E5DF]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#D8E8DE]/60 flex items-center justify-center">
                  {feat.icon}
                </div>
                <Badge variant="forest" size="sm">
                  {feat.badge}
                </Badge>
              </div>
              <h3 className="font-heading text-base font-bold text-[#171918]">{feat.title}</h3>
              <p className="text-xs text-[#626763] leading-relaxed">{feat.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-14 rounded-2xl bg-white border border-[#E5E5DF] p-8 sm:p-10 text-center max-w-3xl mx-auto space-y-4 shadow-sm">
        <h3 className="font-heading text-2xl font-bold text-[#171918]">
          Know where you are. Build where you're going.
        </h3>
        <p className="text-xs sm:text-sm text-[#626763] max-w-xl mx-auto leading-relaxed">
          Take your first diagnostic assessment to evaluate your current abilities and receive a personalized learning roadmap.
        </p>
        <div className="pt-2">
          <Link to={ROUTES.REGISTER}>
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Skill Assessment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
