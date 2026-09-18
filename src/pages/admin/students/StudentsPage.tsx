import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { studentService } from '@/services/studentService'
import { AdminStudentRecord } from '@/data/admin/demo.admin.students'
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const PAGE_SIZE = 6

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<AdminStudentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [sortField, setSortField] = useState<'name' | 'progress' | 'assessmentScoreAvg'>('progress')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal State
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
  }, [])

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

  const handleDeleteStudent = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove student "${name}"?`)) {
      await studentService.deleteStudent(id)
      await loadStudents()
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
    return <LoadingState message="Loading students registry..." minHeight="min-h-[400px]" />
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Student Management"
        subtitle="Search, filter, monitor cohorts and track individual learner readiness."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E948F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email, career..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
            />
          </div>

          {/* Status Filter */}
          <Select
            label=""
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
            label=""
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
              label=""
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
              className="p-2 rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] hover:bg-[#E5E5DF] text-[#626763] cursor-pointer"
              title={`Toggle sort order (${sortOrder.toUpperCase()})`}
            >
              <ArrowUpDown className="w-4 h-4" />
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
                <tr className="border-b border-[#E5E5DF] bg-[#F8F7F3]/70 text-[#626763] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Degree & Sem</th>
                  <th className="py-3 px-4">Career Goal</th>
                  <th className="py-3 px-4 min-w-[130px]">Progress</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#F8F7F3]/50 transition-colors">
                    {/* Student Avatar + Email */}
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#171918]">{student.course}</span>
                      <p className="text-[11px] text-[#626763]">{student.semester}</p>
                    </td>

                    {/* Career Goal */}
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" size="sm" className="bg-white border-[#E5E5DF] text-[#171918] font-medium text-[11px]">
                        {student.careerGoal}
                      </Badge>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-[#171918]">{student.progress}%</span>
                          <span className="text-[#626763]">Avg {student.assessmentScoreAvg}%</span>
                        </div>
                        <ProgressBar value={student.progress} size="sm" />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(student.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/admin/students/${student.id}`}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#1F6B4F] transition-colors"
                          title="View Student Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id, student.name)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Student"
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
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Record' : 'Register New Student'}
        size="md"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4 pt-2">
          <Input
            id="student-name"
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Alex Patel"
            required
          />

          <Input
            id="student-email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="student@skillpath.demo"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Course / Degree"
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
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              placeholder="e.g. Semester 3"
              required
            />
          </div>

          <Input
            id="student-career-goal"
            label="Career Target"
            value={formData.careerGoal}
            onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
            placeholder="e.g. Frontend Developer"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="student-progress"
              label="Progress (%)"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
              required
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'at-risk', label: 'At-Risk' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E5DF]">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingStudent ? 'Save Changes' : 'Create Student'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
