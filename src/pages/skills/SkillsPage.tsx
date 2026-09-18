import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { LoadingState } from '@/components/common/LoadingState'
import { skillsApi } from '@/api/endpoints/skills.api'
import { Skill } from '@/types/skill.types'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { Target, ClipboardCheck, ArrowRight, CheckCircle2, Award } from 'lucide-react'
import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'

export const SkillsPage: React.FC = () => {
  const { user } = useAuth()
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  useEffect(() => {
    let isMounted = true
    const fetchSkills = async () => {
      setIsLoading(true)
      try {
        const data = await skillsApi.getSkills()
        if (isMounted) {
          setSkills(data || [])
        }
      } catch (err) {
        console.error('Failed to load skills:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchSkills()
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading your verified skills..." minHeight="min-h-[350px]" />
  }

  const distinctCategories = [
    'ALL',
    ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean))),
  ]

  const filteredSkills =
    selectedCategory === 'ALL'
      ? skills
      : skills.filter((s) => s.category === selectedCategory)

  const avgMastery =
    skills.length > 0
      ? Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / skills.length)
      : 0

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
              {skills.length} Verified Skills Evaluated
            </h3>
            <p className="text-xs text-[#626763] mt-0.5">
              Target role: <strong className="text-[#171918]">{user?.careerGoal || DEFAULT_CAREER_GOAL}</strong> • Average mastery: {avgMastery}%
            </p>
          </div>
          <Link to={ROUTES.SKILL_GAP} className="group">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover-arrow" />} className="group">
              Analyze Skill Gaps
            </Button>
          </Link>
        </div>

        {/* Dynamic horizontal bars for skills */}
        {skills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {skills.slice(0, 6).map((sk) => (
              <div key={sk.id || sk.name} className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]/60 space-y-1.5 hover-lift">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#171918]">{sk.name}</span>
                  <span className="font-bold text-[#1F6B4F]">
                    <AnimatedCounter value={sk.progress} suffix="%" />
                  </span>
                </div>
                <ProgressBar
                  value={sk.progress}
                  variant={sk.progress >= 70 ? 'forest' : sk.progress >= 50 ? 'primary' : 'warning'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#626763]">
            No verified skills registered yet. Take a diagnostic assessment to baseline your competencies.
          </div>
        )}
      </Card>

      {/* Category Filter Pills */}
      {distinctCategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {distinctCategories.map((cat) => (
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
      )}

      {/* Detailed Skill Cards */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map((skill, index) => {
            const staggerClass = index % 3 === 0 ? 'stagger-1' : index % 3 === 1 ? 'stagger-2' : 'stagger-3'
            return (
              <Card
                key={skill.id || skill.name}
                hoverEffect
                className={`p-5 flex flex-col justify-between bg-white border-[#E5E5DF] animate-slideUp ${staggerClass} hover-lift group`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="forest" size="sm">{skill.category || 'Competency'}</Badge>
                    <span className="text-xs font-bold text-[#1F6B4F]">
                      {skill.progress}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-heading text-base font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors duration-200">
                      {skill.name}
                    </h4>
                    <p className="text-xs text-[#626763] mt-1">
                      Proficiency Level {skill.currentLevel} of {skill.targetLevel || 5}
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
      ) : (
        <Card className="p-8 text-center space-y-4 bg-white border-[#E5E5DF]">
          <Award className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No verified skills found</h3>
          <p className="text-xs text-[#626763] max-w-md mx-auto">
            Complete your initial skill assessment to establish your proficiency profile and unlock custom recommendations.
          </p>
          <Link to={ROUTES.ASSESSMENT}>
            <Button variant="primary" size="md">
              Take Skill Assessment
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}

