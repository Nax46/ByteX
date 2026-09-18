import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ROUTES } from '@/constants/routes'
import { studentService } from '@/services/studentService'
import { AdminStudentRecord } from '@/data/admin/demo.admin.students'
import { DEMO_SKILLS, DEMO_SKILL_GAPS } from '@/data/demo.skills'
import { DEMO_ROADMAP } from '@/data/demo.roadmap'
import { DEMO_RESOURCES } from '@/data/demo.resources'
import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Calendar,
  Mail,
  BrainCircuit,
  Map,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react'

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<AdminStudentRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!id) return
        const record = await studentService.getStudentById(id)
        if (record) {
          setStudent(record)
        } else {
          // Fallback to Alex Patel
          const defaultAlex = await studentService.getStudentById('student_demo_001')
          setStudent(defaultAlex)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchStudent()
  }, [id])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Link to={ROUTES.ADMIN_STUDENTS}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Students
          </Button>
        </Link>
        <EmptyState
          title="Student Record Not Found"
          description="The student profile you requested does not exist in the platform registry."
          actionLabel="View All Students"
          onAction={() => navigate(ROUTES.ADMIN_STUDENTS)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top PageHeader with Breadcrumbs */}
      <PageHeader
        title={student.name}
        subtitle={`Dossier • ${student.course} (${student.semester}) • Career Goal: ${student.careerGoal}`}
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Students', href: ROUTES.ADMIN_STUDENTS },
          { label: student.name },
        ]}
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            Student ID: {student.id}
          </Badge>
        }
        actions={
          <Link to={ROUTES.ADMIN_STUDENTS}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Students
            </Button>
          </Link>
        }
      />

      {/* Hero Profile Card */}
      <Card className="p-6 bg-white border-[#E5E5DF]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar name={student.name} size="lg" status={student.status === 'active' ? 'online' : 'offline'} />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#171918]">{student.name}</h1>
                <Badge
                  variant={student.status === 'active' ? 'success' : student.status === 'at-risk' ? 'warning' : 'outline'}
                  size="sm"
                >
                  {student.status.toUpperCase()}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#626763] pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#1F6B4F]" />
                  {student.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#1F6B4F]" />
                  {student.course} — {student.semester}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#1F6B4F]" />
                  Enrolled: {student.enrolledDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 border-t md:border-t-0 pt-4 md:pt-0 border-[#E5E5DF]">
            <span className="text-xs font-semibold text-[#626763]">Target Career Goal</span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]">
              <Briefcase className="w-4 h-4 text-[#1F6B4F]" />
              <span className="font-semibold text-sm text-[#171918]">{student.careerGoal}</span>
            </div>
            <span className="text-[11px] text-[#8E948F]">Last Active: {student.lastActive}</span>
          </div>
        </div>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#E5E5DF]">
          <div className="p-3 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[11px] font-medium text-[#626763]">Curriculum Progress</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-xl font-bold text-[#171918]">{student.progress}%</span>
              <span className="text-[10px] text-emerald-700">On Track</span>
            </div>
            <ProgressBar value={student.progress} size="sm" className="mt-2" />
          </div>

          <div className="p-3 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[11px] font-medium text-[#626763]">Assessment Average</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-xl font-bold text-[#171918]">{student.assessmentScoreAvg}%</span>
              <span className="text-[10px] text-[#626763]">Benchmarked</span>
            </div>
            <ProgressBar value={student.assessmentScoreAvg} size="sm" className="mt-2" />
          </div>

          <div className="p-3 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[11px] font-medium text-[#626763]">Skills Verified</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-heading text-xl font-bold text-[#171918]">{student.skillsCompleted}</span>
              <span className="text-xs text-[#626763]">/ {student.totalSkills} total</span>
            </div>
            <p className="text-[10px] text-[#8E948F] mt-2">Proficiency Certified</p>
          </div>

          <div className="p-3 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
            <span className="text-[11px] font-medium text-[#626763]">Career Readiness</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading text-xl font-bold text-[#1F6B4F]">72%</span>
              <span className="text-[10px] text-emerald-700">Strong</span>
            </div>
            <p className="text-[10px] text-[#8E948F] mt-2">Market Target Aligned</p>
          </div>
        </div>
      </Card>

      {/* Grid: Skills Inventory & Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Tracked */}
        <Card className="p-6 bg-white border-[#E5E5DF]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF] mb-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#1F6B4F]" />
              <h3 className="font-heading text-base font-semibold text-[#171918]">Verified Skills Portfolio</h3>
            </div>
            <Badge variant="outline" size="sm" className="text-[10px]">
              Taxonomy Graded
            </Badge>
          </div>

          <div className="space-y-3">
            {DEMO_SKILLS.map((skill) => (
              <div key={skill.id} className="p-3 rounded-lg border border-[#E5E5DF] bg-[#F8F7F3]/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#171918]">{skill.name}</span>
                    <Badge variant="outline" size="sm" className="text-[10px] bg-white">
                      {skill.category}
                    </Badge>
                  </div>
                  <span className="font-semibold text-[#1F6B4F]">Level {skill.currentLevel}/5</span>
                </div>
                <ProgressBar value={(skill.currentLevel / 5) * 100} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* Skill Gap Analysis */}
        <Card className="p-6 bg-white border-[#E5E5DF]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF] mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="font-heading text-base font-semibold text-[#171918]">Active Skill Gaps</h3>
            </div>
            <Badge variant="outline" size="sm" className="text-[10px] text-amber-700 bg-amber-50">
              Actionable Target
            </Badge>
          </div>

          <div className="space-y-3">
            {DEMO_SKILL_GAPS.map((gap) => (
              <div key={gap.skillId} className="p-3 rounded-lg border border-[#E5E5DF] bg-white space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#171918]">{gap.skillName}</span>
                  <span className="text-[11px] text-[#626763]">
                    Current: <strong className="text-[#171918]">{gap.currentLevel}</strong> → Target:{' '}
                    <strong className="text-[#1F6B4F]">{gap.targetLevel}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">
                    Gap: -{gap.gap}
                  </span>
                  <span className="text-[#626763] truncate">Priority: {gap.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Learning Path & Roadmap Progression */}
      <Card className="p-6 bg-white border-[#E5E5DF]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF] mb-5">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-[#1F6B4F]" />
            <h3 className="font-heading text-base font-semibold text-[#171918]">
              Personalized Roadmap — {DEMO_ROADMAP.careerGoal}
            </h3>
          </div>
          <Badge variant="outline" size="sm" className="text-[10px]">
            {DEMO_ROADMAP.milestones.length} Milestones · {DEMO_ROADMAP.progressPercentage}% Completed
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_ROADMAP.milestones.map((m, idx: number) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border transition-colors ${
                m.status === 'COMPLETED'
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : m.status === 'IN_PROGRESS'
                  ? 'border-[#1F6B4F] bg-white shadow-2xs'
                  : 'border-[#E5E5DF] bg-[#F8F7F3]/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#626763]">
                  Milestone 0{idx + 1}
                </span>
                {m.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : m.status === 'IN_PROGRESS' ? (
                  <Clock className="w-4 h-4 text-[#1F6B4F] animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>

              <h4 className="font-semibold text-sm text-[#171918]">{m.title}</h4>
              <p className="text-xs text-[#626763] mt-1 line-clamp-2">{m.description}</p>

              <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-[11px]">
                <span className="text-[#626763]">{m.resourcesCount} Resources</span>
                <span className="font-semibold text-[#171918]">{m.estimatedHours} Hours</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Completed & Recommended Resources */}
      <Card className="p-6 bg-white border-[#E5E5DF]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF] mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#1F6B4F]" />
            <h3 className="font-heading text-base font-semibold text-[#171918]">Active Curated Resources</h3>
          </div>
          <Badge variant="outline" size="sm" className="text-[10px]">
            {DEMO_RESOURCES.length} Available
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_RESOURCES.slice(0, 6).map((res) => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl border border-[#E5E5DF] hover:border-[#1F6B4F] hover:bg-[#F8F7F3] transition-colors group block space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px]">
                <Badge variant="outline" size="sm" className="bg-white text-[#1F6B4F]">
                  {res.type}
                </Badge>
                <span className="text-[#8E948F]">{res.estimatedDuration}</span>
              </div>
              <h5 className="font-semibold text-xs text-[#171918] group-hover:text-[#1F6B4F] transition-colors line-clamp-1">
                {res.title}
              </h5>
              <p className="text-[11px] text-[#626763] line-clamp-2">{res.description}</p>
            </a>
          ))}
        </div>
      </Card>
    </div>
  )
}
