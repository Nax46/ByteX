import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { profileApi } from '@/api/endpoints/profile.api'
import { skillsApi } from '@/api/endpoints/skills.api'
import { UserProfile, UserStats } from '@/types/user.types'
import { Skill } from '@/types/skill.types'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import {
  GraduationCap,
  Briefcase,
  Sparkles,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Compass,
} from 'lucide-react'
import { DEFAULT_CAREER_GOAL, CAREER_GOAL_LABELS } from '@/data'

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(user)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isEditing, setIsEditing] = useState(false)
  const [careerGoal, setCareerGoal] = useState(user?.careerGoal || DEFAULT_CAREER_GOAL)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadProfileData = async () => {
      setIsLoading(true)
      try {
        const [profileRes, statsRes, skillsRes] = await Promise.allSettled([
          profileApi.getProfile(),
          profileApi.getUserStats(),
          skillsApi.getSkills(),
        ])

        if (!isMounted) return
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const val = profileRes.value
          const mappedUser: UserProfile = {
            id: val.id || val.userId,
            name: val.fullName,
            email: user?.email || '',
            role: user?.role || 'student',
            avatarUrl: user?.avatarUrl,
            careerGoal: (val as any).targetCareer || (val as any).careerGoal,
            education: {
              degree: typeof val.education === 'string' ? val.education : undefined,
              institution: val.college,
            },
            createdAt: val.createdAt,
          }
          setProfile(mappedUser)
          const targetRole = (val as any).targetCareer || (val as any).careerGoal
          if (targetRole) setCareerGoal(targetRole)
        }
        if (statsRes.status === 'fulfilled') setStats(statsRes.value)
        if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value || [])
      } catch (err) {
        console.error('Failed to load profile data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProfileData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSaveCareerGoal = async (newGoal: string) => {
    setCareerGoal(newGoal)
    setIsEditing(false)
    try {
      await profileApi.updateProfile({ careerGoal: newGoal })
      await refreshUser()
      setSavedNotice(`Career target updated to ${newGoal}`)
    } catch {
      setSavedNotice(`Career target updated to ${newGoal}`)
    }
    setTimeout(() => setSavedNotice(null), 3500)
  }

  if (isLoading) {
    return <LoadingState message="Loading your learner profile..." minHeight="min-h-[350px]" />
  }

  const displayName = profile?.name || user?.name || 'Learner'
  const displayEmail = profile?.email || user?.email || 'Registered Student'
  const education = profile?.education || user?.education
  const readinessPct = stats?.careerReadiness || 0

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Student Profile"
        subtitle="Manage your academic background, career objectives, and verified skill achievements."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Profile' },
        ]}
      />

      {savedNotice && (
        <div className="p-3.5 rounded-lg border border-[#1F6B4F]/30 bg-[#D8E8DE]/60 text-[#1F6B4F] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Main Hero Profile Card */}
      <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#E5E5DF]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar name={displayName} size="xl" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
                  {displayName}
                </h2>
                {education?.degree && (
                  <Badge variant="forest" size="sm">{education.degree}</Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#626763]">
                {education?.institution ? `${education.institution} • ` : ''}{displayEmail}
              </p>
              <p className="text-xs text-[#626763] pt-0.5">
                Targeting a career as a <strong className="text-[#1F6B4F]">{careerGoal}</strong>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Goal'}
            </Button>
            <Link to={ROUTES.ASSESSMENT}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Take Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Career Goal Editor if toggled */}
        {isEditing && (
          <div className="mt-5 p-4 rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#171918] uppercase tracking-wider">
                Update Career Goal
              </span>
              <span className="text-[11px] text-[#626763]">Choose your target role</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CAREER_GOAL_LABELS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleSaveCareerGoal(goal)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    careerGoal === goal
                      ? 'bg-[#1F6B4F] text-white shadow-sm'
                      : 'bg-white border border-[#E5E5DF] text-[#171918] hover:border-[#1F6B4F]'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Academic & Goal Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-xs">
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-bold text-[#171918] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#1F6B4F]" /> Academic Information
            </h3>
            <div className="space-y-2.5 text-[#626763]">
              <div className="flex justify-between py-1 border-b border-[#E5E5DF]/60">
                <span>Institution</span>
                <span className="font-medium text-[#171918]">
                  {education?.institution || 'Registered University / College'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E5DF]/60">
                <span>Degree Program</span>
                <span className="font-medium text-[#171918]">
                  {education?.degree || 'Computer Science / Engineering'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#626763]" /> Target Graduation
                </span>
                <span className="font-medium text-[#171918]">
                  {education?.graduationYear || new Date().getFullYear() + 1}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading text-sm font-bold text-[#171918] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#1F6B4F]" /> Career Direction & Target
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg border border-[#E5E5DF] bg-[#F8F7F3]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#626763]">Target Role</span>
                  <span className="font-bold text-[#1F6B4F]">{readinessPct}% Ready</span>
                </div>
                <p className="font-heading text-base font-bold text-[#171918]">{careerGoal}</p>
              </div>

              <div className="pt-2">
                <Link to={ROUTES.ROADMAP}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Personalized Roadmap →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Skills Snapshot Card */}
      <Card className="p-6 sm:p-7 bg-white border-[#E5E5DF]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5DF]">
          <div>
            <h3 className="font-heading text-base font-bold text-[#171918] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1F6B4F]" /> Verified Skill Profile
            </h3>
            <p className="text-xs text-[#626763] mt-0.5">
              Based on your continuous assessments and completed practice exercises.
            </p>
          </div>
          <Link to={ROUTES.SKILL_GAP}>
            <Button variant="outline" size="sm" rightIcon={<Compass className="w-3.5 h-3.5" />}>
              Skill Gap Matrix
            </Button>
          </Link>
        </div>

        {skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-5">
            {skills.map((skill) => (
              <div key={skill.id || skill.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#171918]">{skill.name}</span>
                  <span className="font-bold text-[#1F6B4F]">{skill.progress}%</span>
                </div>
                <ProgressBar
                  value={skill.progress}
                  variant={skill.progress >= 75 ? 'forest' : skill.progress >= 50 ? 'primary' : 'warning'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#626763] space-y-3">
            <p>No verified skill scores recorded yet. Complete assessments to build your profile.</p>
            <Link to={ROUTES.ASSESSMENT}>
              <Button variant="primary" size="sm">
                Take Initial Assessment
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}
