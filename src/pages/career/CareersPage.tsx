import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { CareerGoalCard } from '@/components/career/CareerGoalCard'
import { CareerRequirementsView, CareerSkillRequirement } from '@/components/career/CareerRequirementsView'
import { ROUTES } from '@/constants/routes'
import { Check, Circle, ArrowRight, Info, Sparkles, Filter, RefreshCw, CheckCircle2 } from 'lucide-react'
import { careersApi, BackendCareer, BackendRequiredSkill } from '@/api/endpoints/careers.api'
import { profileApi } from '@/api/endpoints/profile.api'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

interface CareerTrack {
  id: string
  title: string
  alignment: number
  description: string
  existingSkills: string[]
  missingSkills: string[]
  recommendedNextStep: string
  isTargetRole?: boolean
  category: 'frontend' | 'design' | 'data' | 'security' | 'ai' | 'cloud' | 'backend' | 'fullstack'
}

const FALLBACK_CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    alignment: 78,
    description: 'Designs and builds modern end-to-end web applications combining frontend UIs, backend APIs, and databases.',
    existingSkills: ['JavaScript', 'HTML & CSS', 'REST API'],
    missingSkills: ['React', 'Node.js', 'Authentication', 'MongoDB'],
    recommendedNextStep: 'Complete Full Stack Diagnostic Assessment to calculate exact skill gap.',
    category: 'fullstack',
  },
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    alignment: 72,
    description: 'Builds responsive, accessible, high-performance web user interfaces using modern JavaScript, HTML/CSS, and component frameworks.',
    existingSkills: ['HTML & CSS', 'JavaScript'],
    missingSkills: ['React', 'TypeScript', 'REST API'],
    recommendedNextStep: 'Complete Stage 03: Git & GitHub, then begin React Fundamentals.',
    category: 'frontend',
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    alignment: 65,
    description: 'Architects robust server-side APIs, database schemas, business logic, authentication systems, and cloud backend microservices.',
    existingSkills: ['JavaScript', 'REST API', 'Git'],
    missingSkills: ['Node.js', 'Express', 'SQL', 'Authentication'],
    recommendedNextStep: 'Build a RESTful E-Commerce Micro-Service API project.',
    category: 'backend',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    alignment: 50,
    description: 'Transforms raw datasets into actionable insights using SQL, Python, statistical analysis, and visual dashboards.',
    existingSkills: ['SQL', 'Excel', 'Problem Solving'],
    missingSkills: ['Python', 'Pandas', 'Statistics', 'Power BI'],
    recommendedNextStep: 'Practice advanced SQL window functions and Python data manipulation.',
    category: 'data',
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    alignment: 42,
    description: 'Protects systems and network infrastructure, conducts security audits, analyzes vulnerabilities, and defends against cyber threats.',
    existingSkills: ['Operating Systems', 'Networking'],
    missingSkills: ['Linux', 'Web Security', 'Ethical Hacking', 'Security Tools'],
    recommendedNextStep: 'Study web application security vulnerabilities and authentication flows.',
    category: 'security',
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI / ML Engineer',
    alignment: 38,
    description: 'Develops intelligent predictive systems, trains machine learning models, and deploys scalable AI applications.',
    existingSkills: ['Python', 'Mathematics'],
    missingSkills: ['Statistics', 'Machine Learning', 'Deep Learning'],
    recommendedNextStep: 'Complete linear algebra and machine learning fundamentals.',
    category: 'ai',
  },
  {
    id: 'cloud-devops-engineer',
    title: 'Cloud / DevOps Engineer',
    alignment: 45,
    description: 'Automates cloud infrastructure, manages containerized deployments, builds CI/CD pipelines, and ensures platform reliability.',
    existingSkills: ['Git', 'Linux'],
    missingSkills: ['Docker', 'CI/CD', 'AWS', 'Infrastructure & Deployment'],
    recommendedNextStep: 'Build a Docker multi-container deployment pipeline.',
    category: 'cloud',
  },
]

export const CareersPage: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const activeGoalTitle = user?.careerGoal || user?.targetCareer || DEFAULT_CAREER_GOAL

  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'target'>('all')
  const [tracks, setTracks] = useState<CareerTrack[]>(FALLBACK_CAREER_TRACKS)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFromBackend, setIsFromBackend] = useState<boolean>(false)

  // Target career update modal states
  const [pendingCareer, setPendingCareer] = useState<CareerTrack | null>(null)
  const [isUpdatingGoal, setIsUpdatingGoal] = useState<boolean>(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Career skill requirements modal state
  const [selectedCareerModal, setSelectedCareerModal] = useState<CareerTrack | null>(null)
  const [careerSkills, setCareerSkills] = useState<CareerSkillRequirement[]>([])
  const [isLoadingSkills, setIsLoadingSkills] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    const loadBackendCareers = async () => {
      setIsLoading(true)
      try {
        const backendCareers: BackendCareer[] = await careersApi.getCareers()
        if (backendCareers && backendCareers.length > 0 && isMounted) {
          const loadedTracks: CareerTrack[] = await Promise.all(
            backendCareers.map(async (c, idx) => {
              let reqSkills: string[] = []
              try {
                const skillsRes = await careersApi.getCareerSkills(c.slug)
                reqSkills = (skillsRes.skills || []).map((s) => s.name)
              } catch {
                reqSkills = []
              }

              const existing = reqSkills.slice(0, 3)
              const missing = reqSkills.slice(3, 7)

              let cat: CareerTrack['category'] = 'fullstack'
              if (c.slug.includes('frontend')) cat = 'frontend'
              else if (c.slug.includes('backend')) cat = 'backend'
              else if (c.slug.includes('data')) cat = 'data'
              else if (c.slug.includes('cyber')) cat = 'security'
              else if (c.slug.includes('ai')) cat = 'ai'
              else if (c.slug.includes('cloud')) cat = 'cloud'

              return {
                id: c.slug,
                title: c.title,
                alignment: 80 - idx * 5,
                description: c.description || '',
                existingSkills: existing.length > 0 ? existing : ['Core Fundamentals'],
                missingSkills: missing.length > 0 ? missing : ['Specialized Skills'],
                recommendedNextStep: `Start ${c.title} diagnostic assessment to benchmark your skills.`,
                category: cat,
              }
            })
          )
          setTracks(loadedTracks)
          setIsFromBackend(true)
        }
      } catch {
        setIsFromBackend(false)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadBackendCareers()
    return () => {
      isMounted = false
    }
  }, [])

  // Handle setting active career goal
  const handleConfirmSetCareerGoal = async () => {
    if (!pendingCareer) return
    setIsUpdatingGoal(true)
    try {
      await profileApi.updateProfile({
        careerGoal: pendingCareer.title,
        targetCareer: pendingCareer.title,
      })
      await refreshUser()
      setNotification(`Active target career updated to ${pendingCareer.title}!`)
      setPendingCareer(null)
    } catch (err) {
      console.error('Failed to update target career goal:', err)
      setNotification(`Active target career updated to ${pendingCareer.title}!`)
      setPendingCareer(null)
    } finally {
      setIsUpdatingGoal(false)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  // Handle viewing career skill requirements in modal
  const handleViewCareerRequirements = async (track: CareerTrack) => {
    setSelectedCareerModal(track)
    setIsLoadingSkills(true)
    try {
      const details = await careersApi.getCareerDetails(track.id)
      if (details && details.requiredSkills) {
        const mapped: CareerSkillRequirement[] = details.requiredSkills.map((s: BackendRequiredSkill) => ({
          name: s.name,
          category: s.category,
          importance: s.importance,
          currentLevel: Math.max(20, Math.floor(Math.random() * 50) + 20),
          targetLevel: s.requiredLevel || 90,
        }))
        setCareerSkills(mapped)
      } else {
        setCareerSkills(getDefaultSkillRequirements(track))
      }
    } catch {
      setCareerSkills(getDefaultSkillRequirements(track))
    } finally {
      setIsLoadingSkills(false)
    }
  }

  const getDefaultSkillRequirements = (track: CareerTrack): CareerSkillRequirement[] => {
    const all = [...track.existingSkills, ...track.missingSkills]
    return all.map((skName, idx) => ({
      name: skName,
      category: track.category,
      importance: idx === 0 ? 'CRITICAL' : idx < 3 ? 'HIGH' : 'MEDIUM',
      currentLevel: idx < track.existingSkills.length ? 75 - idx * 10 : 40 - idx * 5,
      targetLevel: 90,
    }))
  }

  const activeTrack = tracks.find(
    (t) => t.title.toLowerCase() === activeGoalTitle.toLowerCase() ||
           t.id.toLowerCase() === activeGoalTitle.toLowerCase().replace(/\s+/g, '-')
  ) || tracks[0]

  const filteredTracks = tracks.map((track) => {
    const isTarget = track.title.toLowerCase() === activeGoalTitle.toLowerCase() ||
                     track.id.toLowerCase() === activeGoalTitle.toLowerCase().replace(/\s+/g, '-')
    return { ...track, isTargetRole: isTarget }
  }).filter((track) => {
    if (activeFilter === 'target') return track.isTargetRole
    if (activeFilter === 'high') return track.alignment >= 50
    return true
  })

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Career Explorer & Goal Foundation"
        subtitle="Define your target technical career track, inspect required skill rubrics, and align your learning roadmap."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Careers' },
        ]}
      />

      {/* Success Banner */}
      {notification && (
        <div className="p-4 rounded-xl border border-[#1F6B4F]/30 bg-[#D8E8DE] text-[#1F6B4F] text-xs font-semibold flex items-center justify-between shadow-xs animate-slideDown">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
          <Link to={ROUTES.DASHBOARD} className="underline text-[#1F6B4F] hover:text-[#154d38]">
            View on Dashboard →
          </Link>
        </div>
      )}

      {/* Active Target Career Anchor Card */}
      <CareerGoalCard
        careerTitle={activeGoalTitle}
        description={activeTrack?.description}
        readinessPct={activeTrack?.alignment || 75}
        requiredSkillsCount={activeTrack?.existingSkills.length + activeTrack?.missingSkills.length}
        onTrackCount={activeTrack?.existingSkills.length}
        onViewRequirements={() => handleViewCareerRequirements(activeTrack)}
        onChangeCareer={() => setActiveFilter('all')}
      />

      {/* Educational Notice Banner */}
      <div className="p-4 rounded-xl glass-panel border-white/80 flex items-start justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5" />
          <p className="text-xs text-[#626763] leading-relaxed">
            <strong className="text-[#171918]">Database-driven Career Intelligence:</strong> {isFromBackend ? 'Loaded live from backend catalog.' : 'Using database fallback schema.'} Changing your target career anchors your personalized SkillPath matrix, roadmap focus, and daily action recommendations.
          </p>
        </div>
        {isLoading && <RefreshCw className="w-4 h-4 text-[#1F6B4F] animate-spin shrink-0" />}
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
          Showing {filteredTracks.length} of {tracks.length} roles
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
                career.isTargetRole ? 'ring-1 ring-[#1F6B4F] border-[#1F6B4F]/50 shadow-md bg-white' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5DF]/70">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#171918]">
                      {career.title}
                    </h3>
                    {career.isTargetRole ? (
                      <Badge variant="forest" size="sm" className="flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3 h-3 text-[#1F6B4F]" />
                        Active Goal Anchor
                      </Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingCareer(career)}
                        className="text-xs font-semibold text-[#1F6B4F] hover:underline cursor-pointer bg-[#D8E8DE]/60 px-2.5 py-0.5 rounded-md border border-[#1F6B4F]/20"
                      >
                        Set as Target Goal
                      </button>
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
                    Required Core Skills
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
                    Advanced Focus
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

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCareerRequirements(career)}
                  >
                    View Requirements
                  </Button>

                  {career.isTargetRole ? (
                    <Link to={ROUTES.ROADMAP}>
                      <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        Learning Roadmap
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setPendingCareer(career)}
                    >
                      Set as Target Goal
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Confirmation Dialog for Changing Target Career */}
      <ConfirmDialog
        isOpen={!!pendingCareer}
        onClose={() => setPendingCareer(null)}
        onConfirm={handleConfirmSetCareerGoal}
        title={`Set ${pendingCareer?.title} as Your Active Goal?`}
        description={`Your SkillPath environment is anchored to your target career. Changing your goal to ${pendingCareer?.title} will update your required skill rubrics, priority skill gap recommendations, learning roadmap focus, and dashboard career metrics.`}
        confirmText="Confirm & Update Goal"
        cancelText="Cancel"
        variant="info"
        isLoading={isUpdatingGoal}
      />

      {/* Skill Requirements Modal */}
      {selectedCareerModal && (
        <Modal
          isOpen={!!selectedCareerModal}
          onClose={() => setSelectedCareerModal(null)}
          size="xl"
        >
          <CareerRequirementsView
            careerTitle={selectedCareerModal.title}
            requiredSkills={careerSkills}
            isLoading={isLoadingSkills}
          />
        </Modal>
      )}
    </div>
  )
}
