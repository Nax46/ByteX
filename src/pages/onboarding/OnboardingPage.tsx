import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { OnboardingPayload, OnboardingStep } from '@/types/onboarding.types'
import { profileApi, OnboardingBackendPayload } from '@/api/endpoints/profile.api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { LoadingState } from '@/components/common/LoadingState'
import {
  User,
  GraduationCap,
  Sparkles,
  Target,
  Check,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const INITIAL_ONBOARDING_STATE: OnboardingPayload = {
  personalInfo: {
    fullName: '',
    headline: 'Student & Aspiring Developer',
    location: '',
    preferredLanguage: 'English',
  },
  education: {
    institution: '',
    degree: '',
    fieldOfStudy: '',
    graduationYear: 2026,
    currentStatus: 'student',
  },
  skills: {
    knownSkills: ['HTML5 & CSS3', 'JavaScript', 'SQL', 'Problem Solving'],
    primaryFocus: 'Frontend Development',
    yearsOfExperience: 1,
  },
  careerGoal: {
    targetRole: 'Frontend Developer',
    targetTimelineMonths: 6,
    targetCompanyType: 'startup',
  },
  interests: {
    preferredLearningFormat: ['projects', 'interactive', 'videos'],
    weeklyCommitmentHours: 15,
    openToMentorship: true,
  },
}

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isMockMode, refreshUser } = useAuth()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [formData, setFormData] = useState<OnboardingPayload>(INITIAL_ONBOARDING_STATE)
  const [semester, setSemester] = useState<number>(1)
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true)
  const [hasExistingProfile, setHasExistingProfile] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')

  const totalSteps = 6
  const progressPercent = Math.round((currentStep / totalSteps) * 100)

  // Fetch existing profile on initial load
  useEffect(() => {
    let isMounted = true

    const loadInitialProfile = async () => {
      if (isMockMode) {
        if (isMounted) {
          if (user?.name) {
            setFormData((prev) => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, fullName: user.name },
            }))
          }
          setIsLoadingProfile(false)
        }
        return
      }

      try {
        const existing = await profileApi.getProfile()
        if (isMounted && existing) {
          setHasExistingProfile(true)
          if (existing.semester) setSemester(existing.semester)
          setFormData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: existing.fullName || prev.personalInfo.fullName,
            },
            education: {
              ...prev.education,
              institution: existing.college || prev.education.institution,
              degree: existing.education || prev.education.degree,
            },
            skills: {
              ...prev.skills,
              knownSkills:
                existing.interests && existing.interests.length > 0
                  ? existing.interests
                  : prev.skills.knownSkills,
            },
            careerGoal: {
              ...prev.careerGoal,
              targetRole: existing.targetCareer || prev.careerGoal.targetRole,
            },
          }))
        } else if (isMounted && user?.name) {
          setFormData((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: user.name,
            },
          }))
        }
      } catch (err: unknown) {
        console.warn('Could not check existing profile:', err)
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false)
        }
      }
    }

    loadInitialProfile()

    return () => {
      isMounted = false
    }
  }, [isMockMode, user?.name])

  const handleNext = () => {
    setValidationError(null)
    setApiError(null)

    if (currentStep === 1) {
      const name = formData.personalInfo.fullName.trim()
      if (!name) {
        setValidationError('Please enter your full name.')
        return
      }
      if (name.length < 2) {
        setValidationError('Full name must be at least 2 characters long.')
        return
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep)
    }
  }

  const handleBack = () => {
    setValidationError(null)
    setApiError(null)
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep)
    }
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.knownSkills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          knownSkills: [...prev.skills.knownSkills, skillInput.trim()],
        },
      }))
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        knownSkills: prev.skills.knownSkills.filter((s) => s !== skillToRemove),
      },
    }))
  }

  const handleSubmit = async () => {
    setValidationError(null)
    setApiError(null)

    const trimmedName = formData.personalInfo.fullName.trim()
    if (!trimmedName || trimmedName.length < 2) {
      setValidationError('Full name must be at least 2 characters long.')
      setCurrentStep(1)
      return
    }

    setIsSubmitting(true)

    // Build backend-compatible payload strictly matching backend onboardingSchema
    const backendPayload: OnboardingBackendPayload = {
      fullName: trimmedName,
      college: formData.education.institution.trim() || undefined,
      education: formData.education.degree.trim() || undefined,
      semester: Number(semester) || 1,
      interests:
        formData.skills.knownSkills.length > 0
          ? formData.skills.knownSkills
          : [formData.skills.primaryFocus].filter(Boolean),
      targetCareer: formData.careerGoal.targetRole.trim() || undefined,
    }

    try {
      if (!isMockMode) {
        if (hasExistingProfile) {
          await profileApi.updateProfile(backendPayload)
        } else {
          try {
            await profileApi.submitOnboarding(backendPayload)
          } catch (postErr: any) {
            // If profile already created (409), safely update
            if (postErr?.status === 409) {
              await profileApi.updateProfile(backendPayload)
            } else {
              throw postErr
            }
          }
        }

        if (refreshUser) {
          await refreshUser().catch(() => {})
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 600))
      }

      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (err: any) {
      const msg =
        err?.message ||
        (err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : 'Failed to complete onboarding. Please verify your information.')
      setApiError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepTitles = [
    'Personal Info',
    'Education',
    'Skills',
    'Career Goal',
    'Preferences',
    'Review',
  ]

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 max-w-2xl mx-auto flex flex-col justify-center bg-[#F8F7F3]">
        <LoadingState message="Checking existing student profile..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto flex flex-col justify-center bg-[#F8F7F3] animate-fadeIn">
      {/* Brand & Progress Header */}
      <div className="mb-6 text-center space-y-3">
        <div className="flex justify-center mb-2">
          <SkillPathLogo size="md" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#171918] tracking-tight">
          Personalize Your Learning Path
        </h1>
        <p className="text-xs text-[#626763]">
          Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
        </p>
        <ProgressBar value={progressPercent} className="mt-3" variant="forest" size="sm" />
      </div>

      <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF] shadow-sm">
        {/* Error Notification Banner */}
        {(apiError || validationError) && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{validationError || apiError}</span>
          </div>
        )}
        {/* STEP 1: PERSONAL INFO */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5DF]">
              <div className="w-9 h-9 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Personal Information</h3>
                <p className="text-xs text-[#626763]">How should your profile and roadmap be addressed?</p>
              </div>
            </div>

            <Input
              label="Full Name"
              value={formData.personalInfo.fullName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, fullName: e.target.value },
                })
              }
              placeholder="e.g. Alex Patel"
              required
            />

            <Input
              label="Academic / Career Headline"
              value={formData.personalInfo.headline}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, headline: e.target.value },
                })
              }
              placeholder="e.g. Student & Aspiring Frontend Developer"
            />

            <Input
              label="City & Country"
              value={formData.personalInfo.location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  personalInfo: { ...formData.personalInfo, location: e.target.value },
                })
              }
              placeholder="e.g. Mumbai, India"
            />
          </div>
        )}

        {/* STEP 2: EDUCATION */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5DF]">
              <div className="w-9 h-9 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Educational Background</h3>
                <p className="text-xs text-[#626763]">Tell us where you are currently studying</p>
              </div>
            </div>

            <Input
              label="College or University"
              value={formData.education.institution}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  education: { ...formData.education, institution: e.target.value },
                })
              }
              placeholder="e.g. College of Computer Applications"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Degree / Major"
                value={formData.education.degree}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    education: { ...formData.education, degree: e.target.value },
                  })
                }
                placeholder="e.g. BCA — Semester 3"
              />

              <Input
                label="Graduation Year"
                type="number"
                value={formData.education.graduationYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    education: { ...formData.education, graduationYear: Number(e.target.value) },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Current Status"
                value={formData.education.currentStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    education: {
                      ...formData.education,
                      currentStatus: e.target.value as OnboardingPayload['education']['currentStatus'],
                    },
                  })
                }
                options={[
                  { value: 'student', label: 'College / University Student' },
                  { value: 'bootcamp', label: 'Bootcamp / Intensive Course' },
                  { value: 'self-taught', label: 'Self-Taught Student' },
                  { value: 'professional', label: 'Early Career Professional' },
                ]}
              />

              <Select
                label="Current Semester"
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                options={[
                  { value: 1, label: 'Semester 1' },
                  { value: 2, label: 'Semester 2' },
                  { value: 3, label: 'Semester 3' },
                  { value: 4, label: 'Semester 4' },
                  { value: 5, label: 'Semester 5' },
                  { value: 6, label: 'Semester 6' },
                  { value: 7, label: 'Semester 7' },
                  { value: 8, label: 'Semester 8' },
                ]}
              />
            </div>
          </div>
        )}

        {/* STEP 3: SKILLS */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5DF]">
              <div className="w-9 h-9 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Current Skills</h3>
                <p className="text-xs text-[#626763]">List technologies or subjects you already have familiarity with</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g. Git, React, CSS Flexbox)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddSkill}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 min-h-[50px] p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]">
              {formData.skills.knownSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant="forest"
                  className="cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                  onClick={() => handleRemoveSkill(skill)}
                  title="Click to remove"
                >
                  {skill} ×
                </Badge>
              ))}
            </div>

            <Select
              label="Primary Area of Focus"
              value={formData.skills.primaryFocus}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  skills: { ...formData.skills, primaryFocus: e.target.value },
                })
              }
              options={[
                { value: 'Frontend Development', label: 'Frontend Web Development' },
                { value: 'UI/UX Design', label: 'UI/UX & Product Design' },
                { value: 'Backend Development', label: 'Backend Engineering & APIs' },
                { value: 'Data Analytics', label: 'Data Analysis & SQL' },
                { value: 'AI Engineering', label: 'AI & Machine Learning' },
              ]}
            />
          </div>
        )}

        {/* STEP 4: CAREER GOAL */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5DF]">
              <div className="w-9 h-9 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Target Career Path</h3>
                <p className="text-xs text-[#626763]">What career track are you building towards?</p>
              </div>
            </div>

            <Select
              label="Target Role"
              value={formData.careerGoal.targetRole}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  careerGoal: { ...formData.careerGoal, targetRole: e.target.value },
                })
              }
              options={[
                { value: 'Frontend Developer', label: 'Frontend Developer (Recommended)' },
                { value: 'UI/UX Designer', label: 'UI/UX Designer & Design Engineer' },
                { value: 'Data Analyst', label: 'Data Analyst' },
                { value: 'Cybersecurity Analyst', label: 'Cybersecurity Analyst' },
                { value: 'AI / ML Engineer', label: 'AI / ML Engineer' },
              ]}
            />

            <Select
              label="Preparation Timeline"
              value={formData.careerGoal.targetTimelineMonths}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  careerGoal: { ...formData.careerGoal, targetTimelineMonths: Number(e.target.value) },
                })
              }
              options={[
                { value: 3, label: '3 Months (Accelerated)' },
                { value: 6, label: '6 Months (Recommended)' },
                { value: 12, label: '12 Months (Comprehensive)' },
              ]}
            />
          </div>
        )}

        {/* STEP 5: PREFERENCES */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5DF]">
              <div className="w-9 h-9 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Study Preferences</h3>
                <p className="text-xs text-[#626763]">How much time can you commit each week?</p>
              </div>
            </div>

            <Select
              label="Weekly Time Commitment"
              value={formData.interests.weeklyCommitmentHours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interests: {
                    ...formData.interests,
                    weeklyCommitmentHours: Number(e.target.value),
                  },
                })
              }
              options={[
                { value: 5, label: '5-10 Hours / week (Steady)' },
                { value: 15, label: '15-20 Hours / week (Active)' },
                { value: 30, label: '30+ Hours / week (Intensive)' },
              ]}
            />

            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1">
              <label className="flex items-center gap-3 text-xs text-[#171918] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.interests.openToMentorship}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interests: {
                        ...formData.interests,
                        openToMentorship: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-[#E5E5DF] text-[#1F6B4F] focus:ring-[#1F6B4F] h-4 w-4"
                />
                <span>Enable periodic learning check-ins and milestone reminders</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E5E5DF]">
              <div className="w-9 h-9 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[#171918]">Ready to Begin</h3>
                <p className="text-xs text-[#626763]">Here is a summary of your setup</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex justify-between items-center">
                <span className="text-[#626763]">Target Role</span>
                <span className="font-bold text-[#171918]">{formData.careerGoal.targetRole}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex justify-between items-center">
                <span className="text-[#626763]">Timeline</span>
                <span className="font-semibold text-[#1F6B4F]">{formData.careerGoal.targetTimelineMonths} Months</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex justify-between items-center">
                <span className="text-[#626763]">Initial Skills</span>
                <span className="font-medium text-[#171918]">{formData.skills.knownSkills.join(', ')}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] flex justify-between items-center">
                <span className="text-[#626763]">Education</span>
                <span className="font-semibold text-[#171918]">
                  {formData.education.institution || 'College'} • Semester {semester}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#D8E8DE]/50 border border-[#1F6B4F]/20 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1F6B4F] shrink-0 mt-0.5" />
              <p className="text-xs text-[#1F6B4F] font-medium leading-relaxed">
                Clicking Complete will generate your baseline skill profile and open your personalized dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#E5E5DF]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 1}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              {hasExistingProfile ? 'Save & Go to Dashboard' : 'Complete Onboarding'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
