import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { ROUTES } from '@/constants/routes'
import { Check, Circle, ArrowRight, Info, Sparkles, Filter } from 'lucide-react'

interface CareerTrack {
  id: string
  title: string
  alignment: number
  description: string
  existingSkills: string[]
  missingSkills: string[]
  recommendedNextStep: string
  isTargetRole?: boolean
  category: 'frontend' | 'design' | 'data' | 'security' | 'ai'
}

const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    alignment: 72,
    description: 'Build responsive, accessible, high-performance web applications using modern JavaScript and component frameworks.',
    existingSkills: ['HTML5 & Semantics', 'CSS3 & Flexbox', 'JavaScript (ES6+)'],
    missingSkills: ['React Core', 'API Integration', 'Git Collaboration'],
    recommendedNextStep: 'Complete Stage 03: Git & GitHub, then begin React Fundamentals.',
    isTargetRole: true,
    category: 'frontend',
  },
  {
    id: 'uiux',
    title: 'UI/UX Designer & Design Engineer',
    alignment: 65,
    description: 'Design intuitive interfaces, create cohesive design systems, and translate wireframes into interactive web components.',
    existingSkills: ['HTML/CSS Layouts', 'Visual Hierarchy', 'Responsive Principles'],
    missingSkills: ['Figma Prototyping', 'User Research', 'Design Tokens'],
    recommendedNextStep: 'Build a design system library and conduct usability audits.',
    category: 'design',
  },
  {
    id: 'data',
    title: 'Data Analyst',
    alignment: 48,
    description: 'Transform raw datasets into actionable academic and business insights using SQL queries and visual dashboards.',
    existingSkills: ['SQL Fundamentals', 'Relational Schemas', 'Problem Solving'],
    missingSkills: ['Python Pandas', 'Data Visualization', 'Statistical Analysis'],
    recommendedNextStep: 'Practice advanced SQL window functions and Python data manipulation.',
    category: 'data',
  },
  {
    id: 'cyber',
    title: 'Cybersecurity Analyst',
    alignment: 42,
    description: 'Protect application infrastructure, analyze vulnerabilities, and enforce secure software development practices.',
    existingSkills: ['Computer Science Core', 'Basic Networking', 'Logic & Scripting'],
    missingSkills: ['OWASP Security', 'Network Protocols', 'Vulnerability Scanning'],
    recommendedNextStep: 'Study web application security vulnerabilities and authentication flows.',
    category: 'security',
  },
  {
    id: 'aiml',
    title: 'AI / ML Engineer',
    alignment: 38,
    description: 'Develop intelligent systems, integrate large language models, and deploy machine learning models in production.',
    existingSkills: ['Python Basics', 'Algorithms', 'Mathematical Logic'],
    missingSkills: ['Linear Algebra', 'PyTorch / TensorFlow', 'Vector Embeddings'],
    recommendedNextStep: 'Complete core linear algebra and machine learning fundamentals coursework.',
    category: 'ai',
  },
]

export const CareersPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'target'>('all')

  const filteredTracks = CAREER_TRACKS.filter((track) => {
    if (activeFilter === 'target') return track.isTargetRole
    if (activeFilter === 'high') return track.alignment >= 50
    return true
  })

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Career Explorer"
        subtitle="Explore where your skills could take you. Compare your current competencies with various technical industry tracks."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Careers' },
        ]}
      />

      {/* Educational Notice Banner */}
      <div className="p-4 rounded-xl glass-panel border-white/80 flex items-start gap-3 shadow-xs">
        <Info className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5" />
        <p className="text-xs text-[#626763] leading-relaxed">
          <strong className="text-[#171918]">Educational matching note:</strong> Career alignment percentages represent a comparison between your verified academic skills and entry-level syllabus rubrics. They are intended as learning guidance, not a guaranteed hiring prediction.
        </p>
      </div>

      {/* Interactive Filter Pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#626763]" />
          <span className="text-xs font-semibold text-[#626763]">Filter Tracks:</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Careers' },
              { id: 'high', label: 'High Alignment (≥50%)' },
              { id: 'target', label: 'Active Goal Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as 'all' | 'high' | 'target')}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#1F6B4F] text-white shadow-xs scale-[1.02]'
                    : 'glass-pill border-white/80 text-[#626763] hover:text-[#171918]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-[#8E948F]">
          Showing {filteredTracks.length} of {CAREER_TRACKS.length} roles
        </span>
      </div>

      {/* Career Cards Grid */}
      <div className="space-y-5">
        {filteredTracks.map((career, index) => {
          const staggerClass = index === 0 ? 'stagger-1' : index === 1 ? 'stagger-2' : index === 2 ? 'stagger-3' : 'stagger-4'
          return (
            <Card
              key={career.id}
              glass="interactive"
              sheen={career.isTargetRole}
              className={`p-6 sm:p-7 border-white/80 space-y-5 animate-slideUp ${staggerClass} hover-lift ${
                career.isTargetRole ? 'ring-1 ring-[#1F6B4F] border-[#1F6B4F]/50 shadow-md' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#171918]">
                      {career.title}
                    </h3>
                    {career.isTargetRole && (
                      <Badge variant="forest" size="sm" className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#1F6B4F]" />
                        Your Active Goal
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#626763] mt-1 max-w-xl leading-relaxed">
                    {career.description}
                  </p>
                </div>

                <div className="sm:text-right shrink-0 min-w-32">
                  <div className="font-heading text-2xl sm:text-3xl font-bold text-[#1F6B4F] flex sm:justify-end items-baseline gap-0.5">
                    <AnimatedCounter end={career.alignment} duration={1200} suffix="%" />
                  </div>
                  <p className="text-[11px] text-[#626763] mb-1.5">Skill alignment</p>
                  
                  {/* Visual Alignment Bar */}
                  <div className="w-full h-1.5 bg-[#F1EFEA] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        career.alignment >= 65 ? 'bg-[#1F6B4F] progress-shimmer' : 'bg-[#E7A84B]'
                      }`}
                      style={{ width: `${career.alignment}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Skill Alignment Comparison Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                {/* Existing Skills */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B4F]" />
                    You already have
                  </span>
                  <ul className="space-y-1.5 pt-1">
                    {career.existingSkills.map((sk, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#171918]">
                        <Check className="w-3.5 h-3.5 text-[#1F6B4F] shrink-0" />
                        <span>{sk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Skills / Focus Next */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A66E1D] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E7A84B]" />
                    Focus next
                  </span>
                  <ul className="space-y-1.5 pt-1">
                    {career.missingSkills.map((sk, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#626763]">
                        <Circle className="w-2.5 h-2.5 text-[#E7A84B] shrink-0 fill-[#E7A84B]/20" />
                        <span>{sk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-[#E5E5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-[#626763]">
                  <strong className="text-[#171918]">Recommended next step:</strong> {career.recommendedNextStep}
                </p>

                <Link to={career.isTargetRole ? ROUTES.ROADMAP : ROUTES.SKILL_GAP} className="shrink-0 group">
                  <Button
                    variant={career.isTargetRole ? 'primary' : 'outline'}
                    size="sm"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover-arrow" />}
                  >
                    {career.isTargetRole ? 'View Learning Roadmap' : 'Compare Skill Matrix'}
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

