import React, { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle2, ArrowRight, ChevronDown, BookOpen, Check } from 'lucide-react'

interface RoadmapStage {
  step: string
  title: string
  description: string
  status: 'Completed' | 'Next' | 'Upcoming'
  estimatedTime: string
  skillsGained: string[]
  ctaText: string
  topics: string[]
}

const ROADMAP_STAGES: RoadmapStage[] = [
  {
    step: '01',
    title: 'HTML & CSS',
    description: 'Semantic HTML5 structure, responsive layout principles with Flexbox and CSS Grid, and accessible document hierarchy.',
    status: 'Completed',
    estimatedTime: '12 hours',
    skillsGained: ['HTML5', 'CSS Grid', 'Flexbox', 'Accessibility'],
    ctaText: 'Review Module',
    topics: ['Semantic Document Outline', 'Flexbox Alignment & Justify', 'CSS Grid 12-Column Systems', 'WCAG AA Compliance'],
  },
  {
    step: '02',
    title: 'JavaScript Fundamentals',
    description: 'Modern ES6+ syntax, functions, arrays, objects, DOM events, and basic algorithmic problem solving.',
    status: 'Completed',
    estimatedTime: '18 hours',
    skillsGained: ['ES6+', 'Functions & Arrays', 'DOM API', 'Scope'],
    ctaText: 'Review Module',
    topics: ['Arrow Functions & Closures', 'Array Methods (map, filter, reduce)', 'DOM Query & Event Delegation', 'Variable Scoping & Hoisting'],
  },
  {
    step: '03',
    title: 'Git & GitHub',
    description: 'Version control workflows, branching, commits, resolving merge conflicts, and publishing open-source repositories.',
    status: 'Next',
    estimatedTime: '6 hours',
    skillsGained: ['Git CLI', 'Branching', 'Pull Requests', 'GitHub Pages'],
    ctaText: 'Start Stage →',
    topics: ['Git Init & Remote Setup', 'Feature Branch Strategy', 'Merge Conflict Resolution', 'Pull Request Review Etiquette'],
  },
  {
    step: '04',
    title: 'React',
    description: 'Declarative component architecture, props, useState, useEffect, lists, keys, and custom hooks.',
    status: 'Upcoming',
    estimatedTime: '22 hours',
    skillsGained: ['React', 'JSX', 'Hooks', 'Component State'],
    ctaText: 'View Syllabus',
    topics: ['Functional Components & JSX', 'State & Props Lifting', 'Side-effects with useEffect', 'Custom Reusable Hooks'],
  },
  {
    step: '05',
    title: 'API Integration',
    description: 'Asynchronous JavaScript, Promises, async/await, fetching REST endpoints with Axios, handling errors and loading indicators.',
    status: 'Upcoming',
    estimatedTime: '10 hours',
    skillsGained: ['REST APIs', 'Async/Await', 'Axios', 'Error Handling'],
    topics: ['Promise Chains & Async/Await', 'Axios Interceptors & Headers', 'Loading & Error State Patterns', 'Data Normalization'],
    ctaText: 'View Syllabus',
  },
  {
    step: '06',
    title: 'Build Real Projects',
    description: 'Translating concepts into full client applications: responsive UI, real state persistence, and modular folder structure.',
    status: 'Upcoming',
    estimatedTime: '30 hours',
    skillsGained: ['Full-Stack UI', 'Tailwind CSS', 'State Management'],
    topics: ['Project Scaffolding (Vite)', 'Design Token Architecture', 'Component Composition', 'Local Storage Persistence'],
    ctaText: 'View Projects',
  },
  {
    step: '07',
    title: 'Portfolio & Interview Prep',
    description: 'Personal portfolio showcase, clean documentation, code review readiness, and mock technical interview evaluations.',
    status: 'Upcoming',
    estimatedTime: '15 hours',
    skillsGained: ['Portfolio Hosting', 'Resume Alignment', 'Mock Coding'],
    topics: ['Production Deployment (Vercel/Netlify)', 'Lighthouse Performance Audit', 'Technical Storytelling', 'System Design Q&A'],
    ctaText: 'View Syllabus',
  },
]

export const RoadmapPage: React.FC = () => {
  // Default to Stage 03 expanded as the active next step
  const [expandedStage, setExpandedStage] = useState<string | null>('03')

  const toggleStage = (step: string) => {
    setExpandedStage((prev) => (prev === step ? null : step))
  }

  return (
    <div className="space-y-7 max-w-4xl mx-auto animate-fadeIn py-2">
      {/* Header */}
      <PageHeader
        title="Your Learning Path"
        subtitle="Built around your current skills and your goal of becoming a Frontend Developer."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Learning Path' },
        ]}
      />

      {/* Progress Summary Card */}
      <Card glass="elevated" sheen className="p-6 border-white/80 shadow-lg animate-slideUp">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <span className="text-xs font-semibold text-[#1F6B4F]">Track Progress</span>
            <h3 className="font-heading text-lg font-bold text-[#171918]">2 of 7 Stages Completed</h3>
          </div>
          <Badge variant="forest" size="md">
            Stage 03: Git & GitHub is Next
          </Badge>
        </div>
        <ProgressBar value={(2 / 7) * 100} size="md" variant="forest" showPercentage />
      </Card>

      {/* Vertical Roadmap */}
      <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-[2px] before:bg-gradient-to-b before:from-[#1F6B4F] before:via-[#1F6B4F] before:to-[#E5E5DF]">
        {ROADMAP_STAGES.map((stage) => {
          const isCompleted = stage.status === 'Completed'
          const isNext = stage.status === 'Next'
          const isExpanded = expandedStage === stage.step

          return (
            <div key={stage.step} className="relative">
              {/* Vertical Step Marker Node */}
              <div
                className={`absolute -left-6 sm:-left-10 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center -translate-x-1/2 transition-transform duration-200 z-20 ${
                  isCompleted
                    ? 'bg-[#1F6B4F] border-[#1F6B4F] text-white shadow-xs'
                    : isNext
                    ? 'bg-white border-[#1F6B4F] text-[#1F6B4F] animate-pathPulse shadow-xs scale-110'
                    : 'glass-panel border-[#D0D0C8] text-[#8E948F]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-bold">{stage.step}</span>
                )}
              </div>

              {/* Stage Card with Glass */}
              <Card
                glass={isNext ? 'elevated' : 'interactive'}
                sheen={isNext}
                className={`p-5 sm:p-6 transition-all duration-200 cursor-pointer ${
                  isNext
                    ? 'border-[#1F6B4F]/50 ring-1 ring-[#1F6B4F]/30 shadow-md'
                    : isCompleted
                    ? 'border-white/80 bg-[#D8E8DE]/20'
                    : 'border-white/60 opacity-90 hover:opacity-100'
                }`}
                onClick={() => toggleStage(stage.step)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#626763]">
                      Stage {stage.step}
                    </span>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-[#171918]">
                      {stage.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        isCompleted
                          ? 'forest'
                          : isNext
                          ? 'warning'
                          : 'outline'
                      }
                      size="sm"
                    >
                      {stage.status}
                    </Badge>
                    <ChevronDown
                      className={`w-4 h-4 text-[#626763] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#626763] leading-relaxed mb-3">
                  {stage.description}
                </p>

                {/* Expandable Content Section */}
                {isExpanded && (
                  <div className="pt-3 pb-2 border-t border-[#E5E5DF] mt-2 space-y-3 animate-fadeIn">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-[#171918] uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" /> Key Topics Covered:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {stage.topics.map((topic, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[#626763]">
                            <Check className="w-3 h-3 text-[#1F6B4F] shrink-0" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E5E5DF] text-xs">
                  <div className="flex items-center gap-4 text-[#626763]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                      {stage.estimatedTime}
                    </span>
                    <span className="hidden sm:inline text-[#8E948F]">•</span>
                    <span className="flex items-center gap-1 text-[#171918] font-medium">
                      Skills: {stage.skillsGained.slice(0, 3).join(', ')}
                    </span>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    {isNext ? (
                      <Link to={ROUTES.RESOURCES}>
                        <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          {stage.ctaText}
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs">
                        {stage.ctaText}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
