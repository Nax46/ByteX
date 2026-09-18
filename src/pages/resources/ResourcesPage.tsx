import React, { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import { Search, ExternalLink, Clock } from 'lucide-react'

interface ResourceItem {
  id: string
  title: string
  description: string
  skill: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  type: 'Course' | 'Video' | 'Article' | 'Practice' | 'Project' | 'Quiz'
  progress: number
  provider: string
  url: string
}

const RESOURCE_CATALOG: ResourceItem[] = [
  {
    id: 'r1',
    title: 'JavaScript Fundamentals: Arrays, Functions & Callbacks',
    description: 'Master functional patterns, immutable data manipulation, array transformation methods, and lexical scope.',
    skill: 'JavaScript',
    difficulty: 'Beginner',
    duration: '2.5 hours',
    type: 'Course',
    progress: 64,
    provider: 'SkillPath Core',
    url: '#',
  },
  {
    id: 'r2',
    title: 'Modern CSS Architecture & Responsive Breakpoint Mastery',
    description: 'In-depth guide to mobile-first media queries, CSS variables, subgrid, container queries, and fluid typography.',
    skill: 'HTML & CSS',
    difficulty: 'Intermediate',
    duration: '45 mins',
    type: 'Article',
    progress: 100,
    provider: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
  },
  {
    id: 'r3',
    title: 'Git Branching & Collaborative GitHub Workflows',
    description: 'Interactive exercises for resolving merge conflicts, rebasing feature branches, and writing standard pull requests.',
    skill: 'Git',
    difficulty: 'Beginner',
    duration: '1.5 hours',
    type: 'Practice',
    progress: 25,
    provider: 'GitHub Education',
    url: '#',
  },
  {
    id: 'r4',
    title: 'React 19 Component Architecture & Hook Primitives',
    description: 'Learn how to build reusable, accessible UI components with pure render logic, useEffect guardrails, and custom hooks.',
    skill: 'React',
    difficulty: 'Intermediate',
    duration: '4 hours',
    type: 'Course',
    progress: 0,
    provider: 'Official React Documentation',
    url: 'https://react.dev',
  },
  {
    id: 'r5',
    title: 'REST API Consumption & Async Data Handling Lab',
    description: 'Hands-on practice connecting Axios clients to backend endpoints, handling loading spinners, error states, and debounce.',
    skill: 'APIs',
    difficulty: 'Intermediate',
    duration: '1.5 hours',
    type: 'Project',
    progress: 0,
    provider: 'SkillPath Labs',
    url: '#',
  },
  {
    id: 'r6',
    title: 'Frontend Developer Diagnostic Evaluation Quiz',
    description: '20 rapid-fire questions benchmarked against technical hiring standards to verify your core web understanding.',
    skill: 'Frontend',
    difficulty: 'Beginner',
    duration: '15 mins',
    type: 'Quiz',
    progress: 100,
    provider: 'SkillPath Assessment',
    url: '/assessment',
  },
]

export const ResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL')

  const resourceTypes = ['ALL', 'Course', 'Video', 'Article', 'Practice', 'Project', 'Quiz']
  const skillsList = ['ALL', 'JavaScript', 'HTML & CSS', 'React', 'Git', 'APIs']

  const filteredResources = RESOURCE_CATALOG.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skill.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'ALL' || item.type === selectedType
    const matchesSkill = selectedSkill === 'ALL' || item.skill === selectedSkill

    return matchesSearch && matchesType && matchesSkill
  })

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Learning Resources"
        subtitle="Handpicked courses, official documentation, practice exercises, and starter projects."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Resources' },
        ]}
      />

      {/* Search & Filters */}
      <Card className="p-5 border-[#E5E5DF] bg-white space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E948F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, courses, projects..."
            className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg pl-10 pr-4 py-2 text-sm text-[#171918] placeholder-[#8E948F] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="font-semibold text-[#626763] shrink-0">Type:</span>
            {resourceTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-md transition-all duration-200 shrink-0 font-medium cursor-pointer ${
                  selectedType === type
                    ? 'bg-[#1F6B4F] text-white shadow-2xs scale-[1.02]'
                    : 'bg-[#F8F7F3] text-[#626763] hover:text-[#171918] border border-[#E5E5DF] hover:border-[#D0D0C8]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="font-semibold text-[#626763] shrink-0">Skill:</span>
            {skillsList.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => setSelectedSkill(skill)}
                className={`px-2.5 py-1 rounded-md transition-all duration-200 shrink-0 font-medium cursor-pointer ${
                  selectedSkill === skill
                    ? 'bg-[#1F6B4F] text-white shadow-2xs scale-[1.02]'
                    : 'bg-[#F8F7F3] text-[#626763] hover:text-[#171918] border border-[#E5E5DF] hover:border-[#D0D0C8]'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {filteredResources.map((res, index) => {
          const staggerClass =
            index === 0 ? 'stagger-1' : index === 1 ? 'stagger-2' : index === 2 ? 'stagger-3' : index === 3 ? 'stagger-4' : 'stagger-5'

          return (
            <Card
              key={res.id}
              className={`p-5 sm:p-6 border-[#E5E5DF] bg-white flex flex-col justify-between space-y-4 hover-lift animate-slideUp ${staggerClass} group`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="forest" size="sm">{res.skill}</Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#626763]">{res.type}</span>
                    <span className="text-[11px] text-[#8E948F]">•</span>
                    <span className="text-[11px] text-[#8E948F]">{res.difficulty}</span>
                  </div>
                </div>

                <h3 className="font-heading text-base font-bold text-[#171918] leading-snug group-hover:text-[#1F6B4F] transition-colors duration-200">
                  {res.title}
                </h3>

                <p className="text-xs text-[#626763] leading-relaxed line-clamp-2">
                  {res.description}
                </p>

                {/* Progress bar if started */}
                <div className="pt-1">
                  <ProgressBar
                    value={res.progress}
                    size="sm"
                    variant={res.progress === 100 ? 'forest' : 'forest'}
                    label={res.progress > 0 ? 'Progress' : 'Not started'}
                    showPercentage={res.progress > 0}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between text-xs">
                <span className="text-[#626763] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                  {res.duration}
                </span>

                <Button
                  variant={res.progress > 0 && res.progress < 100 ? 'primary' : 'outline'}
                  size="sm"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5 group-hover-arrow" />}
                >
                  {res.progress === 100
                    ? 'Review Material'
                    : res.progress > 0
                    ? 'Continue Learning'
                    : 'Start Resource'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
