import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ROUTES } from '@/constants/routes'
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Sparkles,
  Edit3,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Compass,
} from 'lucide-react'

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [careerGoal, setCareerGoal] = useState('Frontend Developer')
  const [savedNotice, setSavedNotice] = useState<string | null>(null)

  const studentInfo = {
    name: 'Alex Patel',
    email: 'alex.patel@student.edu',
    education: 'Bachelor of Computer Applications (BCA)',
    college: 'College of Computer Applications',
    course: 'Web Systems & Software Architecture',
    yearSemester: 'Year 2, Semester 3',
    graduationYear: 2026,
    interests: [
      'Modern Web Interfaces',
      'JavaScript / TypeScript',
      'Component Design Systems',
      'Responsive UX',
      'API Integration',
    ],
  }

  const skills = [
    { name: 'HTML & CSS', score: 85, level: 'Advanced' },
    { name: 'JavaScript', score: 78, level: 'Proficient' },
    { name: 'Problem Solving', score: 66, level: 'Intermediate' },
    { name: 'SQL', score: 55, level: 'Developing' },
    { name: 'React', score: 54, level: 'Developing' },
    { name: 'Git', score: 41, level: 'Foundational' },
  ]

  const handleSaveCareerGoal = (newGoal: string) => {
    setCareerGoal(newGoal)
    setIsEditing(false)
    setSavedNotice(`Career target updated to ${newGoal}`)
    setTimeout(() => setSavedNotice(null), 3500)
  }

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
            <Avatar name={studentInfo.name} size="xl" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">
                  {studentInfo.name}
                </h2>
                <Badge variant="forest" size="sm">BCA — Semester 3</Badge>
                <Badge variant="default" size="sm">Alex Patel</Badge>
              </div>
              <p className="text-xs sm:text-sm text-[#626763]">
                {studentInfo.college} • {studentInfo.email}
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
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
            <Link to={ROUTES.ASSESSMENT}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Retake Assessment
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
              <span className="text-[11px] text-[#626763]">Choose your target path</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Frontend Developer', 'UI/UX Designer', 'Data Analyst', 'Cybersecurity Analyst', 'AI / ML Engineer'].map((goal) => (
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
                <span>College</span>
                <span className="font-medium text-[#171918]">{studentInfo.college}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E5DF]/60">
                <span>Degree Program</span>
                <span className="font-medium text-[#171918]">{studentInfo.education}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E5DF]/60">
                <span>Course Track</span>
                <span className="font-medium text-[#171918]">{studentInfo.course}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E5DF]/60">
                <span>Year & Semester</span>
                <span className="font-medium text-[#171918]">{studentInfo.yearSemester}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#626763]" /> Target Graduation
                </span>
                <span className="font-medium text-[#171918]">{studentInfo.graduationYear}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading text-sm font-bold text-[#171918] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#1F6B4F]" /> Career Direction & Interests
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg border border-[#E5E5DF] bg-[#F8F7F3]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#626763]">Target Role</span>
                  <span className="font-bold text-[#1F6B4F]">72% Ready</span>
                </div>
                <p className="font-heading text-base font-bold text-[#171918]">{careerGoal}</p>
              </div>

              <div>
                <span className="text-[#626763] text-xs block mb-2 font-medium">Areas of Interest:</span>
                <div className="flex flex-wrap gap-1.5">
                  {studentInfo.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#F8F7F3] border border-[#E5E5DF] text-[#171918]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-5">
          {skills.map((skill) => (
            <div key={skill.name} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#171918]">{skill.name}</span>
                  <span className="text-[11px] text-[#626763]">({skill.level})</span>
                </div>
                <span className="font-bold text-[#1F6B4F]">{skill.score}%</span>
              </div>
              <ProgressBar
                value={skill.score}
                variant={skill.score >= 75 ? 'forest' : skill.score >= 50 ? 'primary' : 'warning'}
                size="sm"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Currently Enrolled Course */}
      <Card className="p-6 bg-white border-[#E5E5DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1F6B4F]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
              Current Active Course
            </span>
          </div>
          <h4 className="font-heading text-base font-bold text-[#171918]">
            JavaScript Fundamentals
          </h4>
          <p className="text-xs text-[#626763]">
            Active Module: <strong className="text-[#171918]">Functions & Arrays</strong> • 35 min estimated remaining • 64% completed
          </p>
        </div>

        <Link to={ROUTES.RESOURCES} className="shrink-0">
          <Button variant="primary" size="sm">
            Resume Course →
          </Button>
        </Link>
      </Card>
    </div>
  )
}
