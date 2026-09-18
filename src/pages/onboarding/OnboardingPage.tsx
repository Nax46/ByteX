import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { OnboardingPayload, OnboardingStep } from '@/types/onboarding.types'
import { profileApi } from '@/api/endpoints/profile.api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import {
  User,
  GraduationCap,
  Sparkles,
  Target,
  Check,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import {
  CAREER_GOAL_OPTIONS,
  FOCUS_AREA_OPTIONS,
  STUDY_HOURS_OPTIONS,
  TIMELINE_OPTIONS,
  STUDENT_STATUS_OPTIONS,
} from '@/data/demo.careers'

const getInitialOnboardingState = (name?: string): OnboardingPayload => ({
  personalInfo: {
    fullName: name || '',
    headline: '',
    location: '',
    preferredLanguage: 'English',
  },
  education: {
    institution: '',
    degree: '',
    fieldOfStudy: '',
    graduationYear: new Date().getFullYear(),
    currentStatus: 'student',
  },
  skills: {
    knownSkills: [],
    primaryFocus: '',
    yearsOfExperience: 0,
  },
  careerGoal: {
    targetRole: '',
    targetTimelineMonths: 6,
    targetCompanyType: 'startup',
  },
  interests: {
    preferredLearningFormat: ['projects', 'interactive'],
    weeklyCommitmentHours: 10,
    openToMentorship: true,
  },
})

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [formData, setFormData] = useState<OnboardingPayload>(() =>
    getInitialOnboardingState(user?.name)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const totalSteps = 6
  const progressPercent = Math.round((currentStep / totalSteps) * 100)

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep)
    }
  }

  const handleBack = () => {
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
    setIsSubmitting(true)
    try {
      await profileApi.submitOnboarding(formData)
      navigate(ROUTES.DASHBOARD)
    } catch {
      navigate(ROUTES.DASHBOARD)
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
              placeholder="e.g. Jane Doe"
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
              options={STUDENT_STATUS_OPTIONS}
            />
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
              options={FOCUS_AREA_OPTIONS}
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
              options={CAREER_GOAL_OPTIONS}
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
              options={TIMELINE_OPTIONS}
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
              options={STUDY_HOURS_OPTIONS}
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
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Complete Onboarding
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
