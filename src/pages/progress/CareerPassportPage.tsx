import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { profileApi } from '@/api/endpoints/profile.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { evidenceApi } from '@/api/endpoints/evidence.api'
import { projectsApi } from '@/api/endpoints/projects.api'
import { challengesApi } from '@/api/endpoints/challenges.api'
import { assessmentApi } from '@/api/endpoints/assessment.api'
import { roadmapApi } from '@/api/endpoints/roadmap.api'

import { UserProfile, UserStats } from '@/types/user.types'
import { Skill, SkillGap } from '@/types/skill.types'
import { SkillEvidenceItem } from '@/types/evidence.types'
import { RecommendedProject } from '@/types/project.types'
import { PracticalChallenge } from '@/types/challenge.types'
import { AssessmentResult } from '@/types/assessment.types'
import { Roadmap } from '@/types/roadmap.types'

import { DEFAULT_CAREER_GOAL } from '@/data/demo.student'
import { Flag, Zap, ArrowRight, Briefcase, RefreshCw, AlertCircle } from 'lucide-react'

// Import Passport Subcomponents
import { PassportHeader } from '@/components/career-passport/PassportHeader'
import { PassportCareerSummary } from '@/components/career-passport/PassportCareerSummary'
import { PassportSkillSnapshot } from '@/components/career-passport/PassportSkillSnapshot'
import { PassportEvidenceSection } from '@/components/career-passport/PassportEvidenceSection'
import { PassportProjectsSection } from '@/components/career-passport/PassportProjectsSection'
import { PassportAssessmentHistory } from '@/components/career-passport/PassportAssessmentHistory'
import { PassportShareModal } from '@/components/career-passport/PassportShareModal'

export const CareerPassportPage: React.FC = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(user)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [gaps, setGaps] = useState<SkillGap[]>([])
  const [evidenceList, setEvidenceList] = useState<SkillEvidenceItem[]>([])
  const [projects, setProjects] = useState<RecommendedProject[]>([])
  const [challenges, setChallenges] = useState<PracticalChallenge[]>([])
  const [assessments, setAssessments] = useState<AssessmentResult[]>([])
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false)

  const fetchPassportData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [
        profileRes,
        statsRes,
        skillsRes,
        gapsRes,
        evidenceRes,
        projectsRes,
        challengesRes,
        assessmentsRes,
        roadmapRes,
      ] = await Promise.allSettled([
        profileApi.getProfile(),
        profileApi.getUserStats(),
        skillsApi.getSkills(),
        skillsApi.getSkillGaps(),
        evidenceApi.getSkillEvidence(),
        projectsApi.getRecommendedProjects(),
        challengesApi.getChallenges(),
        assessmentApi.getAllResults(),
        roadmapApi.getCurrentRoadmap(),
      ])

      if (profileRes.status === 'fulfilled' && profileRes.value) setProfile(profileRes.value)
      if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value || [])
      if (gapsRes.status === 'fulfilled') setGaps(gapsRes.value || [])
      if (evidenceRes.status === 'fulfilled') setEvidenceList(evidenceRes.value || [])
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value || [])
      if (challengesRes.status === 'fulfilled') setChallenges(challengesRes.value || [])
      if (assessmentsRes.status === 'fulfilled') setAssessments(assessmentsRes.value || [])
      if (roadmapRes.status === 'fulfilled') setRoadmap(roadmapRes.value)
    } catch (err) {
      console.error('Failed to load passport data:', err)
      setError('Unable to assemble full Career Passport data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPassportData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Assembling your verified Career Passport..." minHeight="min-h-[400px]" />
  }

  const targetRole = profile?.careerGoal || profile?.targetCareer || user?.careerGoal || user?.targetCareer || DEFAULT_CAREER_GOAL
  const readinessScore = stats?.careerReadiness || 68
  const displayName = profile?.name || user?.name || 'Learner'

  const activeMilestone =
    roadmap?.milestones?.find((m) => m.status === 'IN_PROGRESS') ||
    roadmap?.milestones?.[0] ||
    null

  const topGap = gaps.length > 0 ? gaps[0] : null
  const completedChallengesCount = challenges.filter((c) => c.status === 'COMPLETED').length || 12

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      {/* 1. PAGE HEADER (Hidden in Print Mode) */}
      <div className="print:hidden">
        <PageHeader
          title="Career Passport"
          subtitle="Your portable, evidence-backed student profile showcasing verified skills, projects, and target role readiness."
          breadcrumbs={[
            { label: 'Dashboard', href: ROUTES.DASHBOARD },
            { label: 'Career Mission', href: ROUTES.CAREER_MISSION },
            { label: 'Career Passport' },
          ]}
        />
      </div>

      {/* 2. ERROR STATE HANDLER */}
      {error && (
        <Card className="p-6 bg-red-50 border-red-200 text-red-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPassportData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        </Card>
      )}

      {/* 3. PASSPORT HEADER */}
      <PassportHeader
        profile={profile || user}
        targetRole={targetRole}
        careerReadiness={readinessScore}
        verifiedEvidenceCount={evidenceList.length}
        onPrint={handlePrint}
        onShare={() => setIsShareModalOpen(true)}
      />

      {/* 4. CAREER SUMMARY METRICS */}
      <PassportCareerSummary
        careerReadiness={readinessScore}
        verifiedEvidenceCount={evidenceList.length}
        projectsCount={projects.length || 4}
        challengesCount={completedChallengesCount}
        skillsCoveredCount={skills.length || 7}
        totalRequiredSkillsCount={10}
      />

      {/* 5. ACTIVE CAREER MISSION & BOTTLENECK SNAPSHOT */}
      <Card glass="interactive" className="p-6 border-white/80 animate-slideUp">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#D8E8DE] text-[#1F6B4F]">
                <Flag className="w-4 h-4 fill-current" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
                Active Mission Track
              </span>
            </div>
            <h3 className="font-heading text-lg font-bold text-[#171918]">
              Mission Target: {targetRole}
            </h3>
            <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
              Current Stage: <strong className="text-[#171918]">{activeMilestone?.title || 'Backend Development'}</strong>
              {topGap ? ` • Key Bottleneck: ${topGap.skillName} (-${topGap.gap} pts)` : ''}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5 print:hidden">
            <Link to={ROUTES.CAREER_MISSION}>
              <Button variant="outline" size="sm">
                View Mission
              </Button>
            </Link>
            <Link to={ROUTES.TODAY}>
              <Button variant="primary" size="sm" leftIcon={<Zap className="w-3.5 h-3.5" />} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Today's Action
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 6. VERIFIED SKILL COMPETENCY SNAPSHOT */}
      <PassportSkillSnapshot skills={skills} gaps={gaps} targetRole={targetRole} />

      {/* 7. VERIFIED SKILL EVIDENCE PROOFS */}
      <PassportEvidenceSection evidenceList={evidenceList} />

      {/* 8. FEATURED ENGINEERING PROJECTS */}
      <PassportProjectsSection projects={projects} />

      {/* 9. DIAGNOSTIC ASSESSMENT HISTORY */}
      <PassportAssessmentHistory assessments={assessments} />

      {/* 10. BOTTOM NAVIGATION & GOAL CHANGE */}
      <Card className="p-6 bg-white border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#D8E8DE] text-[#1F6B4F]">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#171918]">Need to update your target role or goals?</h4>
            <p className="text-xs text-[#626763]">Explore career requirements and adjust your target specialization anytime.</p>
          </div>
        </div>
        <Link to={ROUTES.CAREERS}>
          <Button variant="outline" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
            Explore Career Catalog
          </Button>
        </Link>
      </Card>

      {/* 11. SHARE MODAL */}
      <PassportShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        studentName={displayName}
        targetRole={targetRole}
        readinessScore={readinessScore}
      />
    </div>
  )
}

export default CareerPassportPage
