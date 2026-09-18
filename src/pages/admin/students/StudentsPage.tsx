import React, { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { studentService } from '@/services/studentService'
import { AdminStudentRecord } from '@/data/admin/demo.admin.students'
import { ROUTES } from '@/constants/routes'
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  Target,
  ShieldCheck,
} from 'lucide-react'

const PAGE_SIZE = 6

export const StudentsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [students, setStudents] = useState<AdminStudentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [sortField, setSortField] = useState<'name' | 'progress' | 'assessmentScoreAvg'>('progress')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<AdminStudentRecord | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: 'BCA',
    semester: 'Semester 3',
    careerGoal: 'Frontend Developer',
    progress: 50,
    status: 'active' as AdminStudentRecord['status'],
  })

  // Destructive Delete Confirmation State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadStudents = async () => {
    try {
      const data = await studentService.getStudents()
      setStudents(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
    if (searchParams.get('action') === 'new') {
      handleOpenAddModal()
    }
  }, [searchParams])

  // Filter & Sort Logic
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.careerGoal.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || s.status === statusFilter
        const matchesCourse = courseFilter === 'all' || s.course === courseFilter

        return matchesSearch && matchesStatus && matchesCourse
      })
      .sort((a, b) => {
        let comp = 0
        if (sortField === 'name') {
          comp = a.name.localeCompare(b.name)
        } else if (sortField === 'progress') {
          comp = a.progress - b.progress
        } else if (sortField === 'assessmentScoreAvg') {
          comp = a.assessmentScoreAvg - b.assessmentScoreAvg
        }
        return sortOrder === 'asc' ? comp : -comp
      })
  }, [students, searchTerm, statusFilter, courseFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredStudents.slice(start, start + PAGE_SIZE)
  }, [filteredStudents, currentPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, courseFilter])

  const handleOpenAddModal = () => {
    setEditingStudent(null)
    setFormData({
      name: '',
      email: '',
      course: 'BCA',
      semester: 'Semester 3',
      careerGoal: 'Frontend Developer',
      progress: 40,
      status: 'active',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (student: AdminStudentRecord) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      email: student.email,
      course: student.course,
      semester: student.semester,
      careerGoal: student.careerGoal,
      progress: student.progress,
      status: student.status,
    })
    setIsModalOpen(true)
  }

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    if (editingStudent) {
      await studentService.updateStudent(editingStudent.id, {
        name: formData.name,
        email: formData.email,
        course: formData.course,
        semester: formData.semester,
        careerGoal: formData.careerGoal,
        progress: Number(formData.progress),
        status: formData.status,
      })
    } else {
      await studentService.createStudent({
        name: formData.name,
        email: formData.email,
        course: formData.course,
        semester: formData.semester,
        careerGoal: formData.careerGoal,
        progress: Number(formData.progress),
        status: formData.status,
        enrolledDate: new Date().toISOString().split('T')[0],
        lastActive: 'Just now',
        assessmentScoreAvg: 75,
        skillsCompleted: 4,
        totalSkills: 10,
      })
    }

    setIsModalOpen(false)
    await loadStudents()
  }

  const handlePromptDelete = (id: string, name: string) => {
    setStudentToDelete({ id, name })
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return
    setIsDeleting(true)
    try {
      await studentService.deleteStudent(studentToDelete.id)
      await loadStudents()
      setDeleteConfirmOpen(false)
      setStudentToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: AdminStudentRecord['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>
      case 'completed':
        return <Badge variant="forest" size="sm">Completed</Badge>
      case 'at-risk':
        return <Badge variant="warning" size="sm">At-Risk</Badge>
      case 'inactive':
        return <Badge variant="outline" size="sm">Inactive</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title="Student Management"
          subtitle="Search, filter, monitor cohorts and track individual learner readiness."
          breadcrumbs={[
            { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
            { label: 'Students' },
          ]}
        />
        <TableSkeleton rows={6} columns={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Student Management"
        subtitle="Search, filter, monitor cohorts and track individual learner readiness."
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Students' },
        ]}
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            {students.length} Total Enrolled
          </Badge>
        }
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Student
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border-[#E5E5DF] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E948F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Search student by name, email, or career"
              placeholder="Search name, email, career..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
            />
          </div>

          {/* Status Filter */}
          <Select
            size="sm"
            aria-label="Filter by student status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'at-risk', label: 'At-Risk' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'completed', label: 'Completed' },
            ]}
          />

          {/* Course Filter */}
          <Select
            size="sm"
            aria-label="Filter by degree program"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Degrees' },
              { value: 'BCA', label: 'BCA' },
              { value: 'B.Tech CSE', label: 'B.Tech CSE' },
              { value: 'B.Tech IT', label: 'B.Tech IT' },
              { value: 'B.Sc Data Science', label: 'B.Sc Data Science' },
              { value: 'MCA', label: 'MCA' },
            ]}
          />

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <Select
              size="sm"
              aria-label="Sort student records"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              options={[
                { value: 'progress', label: 'Sort by Progress' },
                { value: 'name', label: 'Sort by Name' },
                { value: 'assessmentScoreAvg', label: 'Sort by Avg Score' },
              ]}
              className="flex-1"
            />
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-9 px-2.5 rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] hover:bg-[#E5E5DF] text-[#626763] cursor-pointer flex items-center justify-center shrink-0"
              title={`Toggle sort order (${sortOrder.toUpperCase()})`}
              aria-label={`Toggle sort order: currently ${sortOrder.toUpperCase()}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Data Table */}
      <Card className="bg-white border-[#E5E5DF] overflow-hidden">
        {paginatedStudents.length === 0 ? (
          <EmptyState
            title="No students found"
            description="No student records match your current filter parameters."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setCourseFilter('all')
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E5DF] bg-[#F8F7F3]/80 text-[#626763] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Student</th>
                  <th className="py-3 px-4 font-semibold">Degree & Sem</th>
                  <th className="py-3 px-4 font-semibold">Career Goal</th>
                  <th className="py-3 px-4 min-w-[130px] font-semibold">Progress</th>
                  <th className="py-3 px-4 text-center font-semibold">Status</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                    {/* Student Avatar + Email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={student.name} size="sm" />
                        <div>
                          <Link
                            to={`/admin/students/${student.id}`}
                            className="font-semibold text-[#171918] hover:text-[#1F6B4F] transition-colors"
                          >
                            {student.name}
                          </Link>
                          <p className="text-[11px] text-[#626763] truncate">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Course & Semester */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#171918]">{student.course}</span>
                      <p className="text-[11px] text-[#626763]">{student.semester}</p>
                    </td>

                    {/* Career Goal */}
                    <td className="py-3 px-4">
                      <Badge variant="outline" size="sm" className="bg-white border-[#E5E5DF] text-[#171918] font-medium text-[11px]">
                        {student.careerGoal}
                      </Badge>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-[#171918]">{student.progress}%</span>
                          <span className="text-[#626763]">Avg {student.assessmentScoreAvg}%</span>
                        </div>
                        <ProgressBar value={student.progress} size="sm" />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(student.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/admin/students/${student.id}`}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#1F6B4F] transition-colors"
                          title="View Student Dossier"
                          aria-label={`View dossier for ${student.name}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                          title="Edit Student"
                          aria-label={`Edit ${student.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePromptDelete(student.id, student.name)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Student"
                          aria-label={`Delete ${student.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#626763]">
          <div>
            Showing <span className="font-semibold text-[#171918]">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{' '}
            <span className="font-semibold text-[#171918]">
              {Math.min(currentPage * PAGE_SIZE, filteredStudents.length)}
            </span>{' '}
            of <span className="font-semibold text-[#171918]">{filteredStudents.length}</span> students
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>
            <span className="px-3 py-1 text-xs font-semibold text-[#171918]">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next Page"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Add / Edit Student Modal — Professional 4-Section Enterprise Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        centeredTitle={true}
        title={editingStudent ? 'Edit Student Record' : 'Add New Student'}
        description={
          editingStudent
            ? 'Update learner profile, enrolled curriculum, and career target trajectory.'
            : 'Register a student to SkillPath'
        }
        size="lg"
      >
        <form onSubmit={handleSaveStudent} className="space-y-5 pt-1">
          {/* Section 1: Personal Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <User className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Personal Information
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                id="student-name"
                label="Full Name"
                size="sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Patel"
                required
              />
              <Input
                id="student-email"
                label="Email Address"
                type="email"
                size="sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@skillpath.demo"
                required
              />
            </div>
          </div>

          {/* Section 2: Academic Information */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <GraduationCap className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Academic Information
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Course / Degree"
                size="sm"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                options={[
                  { value: 'BCA', label: 'BCA' },
                  { value: 'B.Tech CSE', label: 'B.Tech CSE' },
                  { value: 'B.Tech IT', label: 'B.Tech IT' },
                  { value: 'B.Sc Data Science', label: 'B.Sc Data Science' },
                  { value: 'MCA', label: 'MCA' },
                ]}
              />
              <Input
                id="student-sem"
                label="Semester"
                size="sm"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                placeholder="e.g. Semester 3"
                required
              />
            </div>
          </div>

          {/* Section 3: Career Information */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <Target className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Career Information
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                id="student-career-goal"
                label="Career Target"
                size="sm"
                value={formData.careerGoal}
                onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                placeholder="e.g. Frontend Developer"
                required
              />
              <Input
                id="student-progress"
                label="Current Progress (%)"
                type="number"
                size="sm"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Section 4: Account Status */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Account Status
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Status"
                size="sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'at-risk', label: 'At-Risk' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'completed', label: 'Completed' },
                ]}
              />
              <Input
                id="student-cohort"
                label="Additional info / Cohort"
                size="sm"
                value="Term 2026 • Verified"
                disabled
                helperText="System assigned cohort tracking"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5DF]">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingStudent ? 'Save Changes' : 'Create Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reusable ConfirmDialog for Safe Destructive Actions */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setStudentToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="danger"
        title="Delete Student Record?"
        description={`Are you sure you want to remove "${studentToDelete?.name}" from the active SkillPath registry? This action will remove their current assessment telemetry.`}
        confirmText="Delete Student"
        cancelText="Cancel"
      />
    </div>
  )
}
