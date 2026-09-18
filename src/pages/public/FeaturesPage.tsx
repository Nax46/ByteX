import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import {
  ClipboardCheck,
  Target,
  Briefcase,
  Compass,
  BookOpen,
  TrendingUp,
  FolderGit2,
  Layers,
  Award,
  ArrowRight,
} from 'lucide-react'

interface FeatureItem {
  id: string
  icon: React.ReactNode
  title: string
  badge: string
  description: string
  ctaText: string
  route: string
}

export const FeaturesPage: React.FC = () => {
  const features: FeatureItem[] = [
    {
      id: 'assessment',
      icon: <ClipboardCheck className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Skill Assessment',
      badge: 'Diagnostics',
      description:
        'Diagnostic evaluations covering syntax, system design patterns, and algorithmic problem-solving to verify your current technical baseline.',
      ctaText: 'Start Assessment',
      route: ROUTES.ASSESSMENT,
    },
    {
      id: 'skill-gap',
      icon: <Target className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Skill Gap Detection',
      badge: 'Gap Matrix',
      description:
        'Objective benchmark matrix comparing your verified competencies directly against industry role expectations to pinpoint missing knowledge.',
      ctaText: 'View Gap Matrix',
      route: ROUTES.SKILL_GAP,
    },
    {
      id: 'career-mapping',
      icon: <Briefcase className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Career-Specific Skill Mapping',
      badge: 'Role Alignment',
      description:
        'Transparent mapping of technical skills required for real roles including Frontend, Backend, Full Stack, and Cloud Engineering.',
      ctaText: 'Explore Roles',
      route: ROUTES.CAREERS,
    },
    {
      id: 'roadmap',
      icon: <Compass className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Personalized Learning Roadmap',
      badge: 'Milestones',
      description:
        'Step-by-step milestone pathway calibrated to your verified gaps, providing a logical progression from fundamentals to advanced concepts.',
      ctaText: 'View Roadmap',
      route: ROUTES.ROADMAP,
    },
    {
      id: 'resources',
      icon: <BookOpen className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Curated Learning Resources',
      badge: 'Curriculum',
      description:
        'High-yield official documentation, interactive tutorials, and technical reference guides organized by skill topic and difficulty level.',
      ctaText: 'Browse Resources',
      route: ROUTES.RESOURCES,
    },
    {
      id: 'progress',
      icon: <TrendingUp className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Progress Tracking',
      badge: 'Analytics',
      description:
        'Real-time tracking of your study consistency streaks, milestone completion rates, and quantified competency growth over time.',
      ctaText: 'View Progress',
      route: ROUTES.PROGRESS,
    },
    {
      id: 'projects',
      icon: <FolderGit2 className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Project Recommendations',
      badge: 'Portfolio',
      description:
        'Hands-on, portfolio-ready project assignments designed to solidify theoretical knowledge into practical, demonstrative engineering experience.',
      ctaText: 'Explore Projects',
      route: ROUTES.PROJECTS,
    },
    {
      id: 'career-exploration',
      icon: <Layers className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Career Exploration',
      badge: 'Market Insights',
      description:
        'Discover prospective software engineering careers matching your individual strengths, technical proficiencies, and learning trajectory.',
      ctaText: 'Discover Careers',
      route: ROUTES.CAREERS,
    },
    {
      id: 'career-readiness',
      icon: <Award className="w-5 h-5 text-[#1F6B4F]" />,
      title: 'Skill Profile & Career Readiness',
      badge: 'Readiness Index',
      description:
        'A comprehensive profile showcasing your mastered proficiencies, active roadmap status, and calculated role readiness percentage.',
      ctaText: 'Check Readiness',
      route: ROUTES.CAREER_READINESS,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-fadeIn">
      <PageHeader
        title="What You Can Do with SkillPath"
        subtitle="A unified education and career platform providing diagnostic testing, personalized pathways, and verified skill progression."
        breadcrumbs={[
          { label: 'Home', href: ROUTES.HOME },
          { label: 'Features' },
        ]}
      />

      {/* 9 Functional Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {features.map((feat) => (
          <Card
            key={feat.id}
            hoverEffect
            className="p-6 flex flex-col justify-between bg-white border-[#E5E5DF] hover:border-[#D0D0C8] space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#D8E8DE]/60 border border-[#C2D8C9] flex items-center justify-center">
                  {feat.icon}
                </div>
                <Badge variant="forest" size="sm">
                  {feat.badge}
                </Badge>
              </div>

              <h3 className="font-heading text-base font-bold text-[#171918]">
                {feat.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
                {feat.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5E5DF]">
              <Link to={feat.route} className="block w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between text-xs font-semibold hover:border-[#1F6B4F] hover:text-[#1F6B4F]"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {feat.ctaText}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Callout Card */}
      <div className="mt-14 rounded-2xl bg-white border border-[#E5E5DF] p-8 sm:p-10 text-center max-w-3xl mx-auto space-y-4 shadow-xs">
        <h3 className="font-heading text-2xl font-bold text-[#171918]">
          Ready to discover your skill baseline?
        </h3>
        <p className="text-xs sm:text-sm text-[#626763] max-w-xl mx-auto leading-relaxed">
          Take a diagnostic assessment to benchmark your practical abilities and generate your customized milestone roadmap.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link to={ROUTES.ASSESSMENT}>
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Skill Assessment
            </Button>
          </Link>
          <Link to={ROUTES.ROADMAP}>
            <Button variant="outline" size="md">
              View Learning Paths
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
