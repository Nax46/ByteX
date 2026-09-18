import React, { useEffect, useState, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { assessmentService } from '@/services/assessmentService'
import { AdminAssessmentRecord } from '@/data/admin/demo.admin.assessments'
import { ROUTES } from '@/constants/routes'
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Copy,
  Trash2,
  ClipboardCheck,
  Timer,
  Award,
} from 'lucide-react'

export const AssessmentsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<AdminAssessmentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AdminAssessmentRecord | null>(null)

  // Destructive Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [assessmentToDelete, setAssessmentToDelete] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    skill: 'JavaScript',
    category: 'Technical' as AdminAssessmentRecord['category'],
    questionsCount: 20,
    averageScore: 75,
    attemptsCount: 0,
    difficulty: 'Intermediate' as AdminAssessmentRecord['difficulty'],
    status: 'published' as AdminAssessmentRecord['status'],
    estimatedMinutes: 25,
    passingScore: 70,
  })

  const loadAssessments = async () => {
    try {
      const data = await assessmentService.getAssessments()
      setAssessments(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAssessments()
  }, [])

  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.skill.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDifficulty = difficultyFilter === 'all' || a.difficulty === difficultyFilter
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter
      return matchesSearch && matchesDifficulty && matchesStatus
    })
  }, [assessments, searchTerm, difficultyFilter, statusFilter])

  const handleOpenCreate = () => {
    setSelectedRecord(null)
    setFormData({
      title: '',
      skill: 'JavaScript',
      category: 'Technical',
      questionsCount: 20,
      averageScore: 75,
      attemptsCount: 0,
      difficulty: 'Intermediate',
      status: 'published',
      estimatedMinutes: 25,
      passingScore: 70,
    })
    setIsEditModalOpen(true)
  }

  const handleOpenEdit = (rec: AdminAssessmentRecord) => {
    setSelectedRecord(rec)
    setFormData({
      title: rec.title,
      skill: rec.skill,
      category: rec.category,
      questionsCount: rec.questionsCount,
      averageScore: rec.averageScore,
      attemptsCount: rec.attemptsCount,
      difficulty: rec.difficulty,
      status: rec.status,
      estimatedMinutes: rec.estimatedMinutes,
      passingScore: rec.passingScore,
    })
    setIsEditModalOpen(true)
  }

  const handleOpenView = (rec: AdminAssessmentRecord) => {
    setSelectedRecord(rec)
    setIsViewModalOpen(true)
  }

  const handleDuplicate = async (id: string) => {
    await assessmentService.duplicateAssessment(id)
    await loadAssessments()
  }

  const handlePromptDelete = (id: string, title: string) => {
    setAssessmentToDelete({ id, title })
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!assessmentToDelete) return
    setIsDeleting(true)
    try {
      await assessmentService.deleteAssessment(assessmentToDelete.id)
      await loadAssessments()
      setDeleteConfirmOpen(false)
      setAssessmentToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return

    if (selectedRecord) {
      await assessmentService.updateAssessment(selectedRecord.id, formData)
    } else {
      await assessmentService.createAssessment(formData)
    }

    setIsEditModalOpen(false)
    await loadAssessments()
  }

  const getDifficultyBadge = (diff: AdminAssessmentRecord['difficulty']) => {
    switch (diff) {
      case 'Beginner':
        return <Badge variant="success" size="sm">Beginner</Badge>
      case 'Intermediate':
        return <Badge variant="forest" size="sm">Intermediate</Badge>
      case 'Advanced':
        return <Badge variant="warning" size="sm">Advanced</Badge>
    }
  }

  const getStatusBadge = (status: AdminAssessmentRecord['status']) => {
    switch (status) {
      case 'published':
        return <Badge variant="forest" size="sm">Published</Badge>
      case 'draft':
        return <Badge variant="outline" size="sm">Draft</Badge>
      case 'archived':
        return <Badge variant="outline" size="sm" className="opacity-60">Archived</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title="Assessment Benchmarks"
          subtitle="Configure diagnostic tests, evaluation timers, passing thresholds, and certification gates."
          breadcrumbs={[
            { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
            { label: 'Assessments' },
          ]}
        />
        <TableSkeleton rows={5} columns={6} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Assessment Benchmarks"
        subtitle="Configure diagnostic tests, evaluation timers, passing thresholds, and certification gates."
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Assessments' },
        ]}
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            {assessments.length} Standardized Exams
          </Badge>
        }
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Assessment
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white border-[#E5E5DF]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E948F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Search assessments"
              placeholder="Search assessment title, skill domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
            />
          </div>

          <Select
            size="sm"
            aria-label="Filter by difficulty"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Difficulties' },
              { value: 'Beginner', label: 'Beginner' },
              { value: 'Intermediate', label: 'Intermediate' },
              { value: 'Advanced', label: 'Advanced' },
            ]}
          />

          <Select
            size="sm"
            aria-label="Filter by publication status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white border-[#E5E5DF] overflow-hidden">
        {filteredAssessments.length === 0 ? (
          <EmptyState
            title="No assessments found"
            description="No assessment records match your current filter parameters."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchTerm('')
              setDifficultyFilter('all')
              setStatusFilter('all')
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E5DF] bg-[#F8F7F3]/80 text-[#626763] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Assessment Title</th>
                  <th className="py-3 px-4">Mapped Skill</th>
                  <th className="py-3 px-4">Benchmark Specs</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {filteredAssessments.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#171918]">{item.title}</p>
                      <p className="text-[11px] text-[#626763]">{item.category}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" size="sm" className="bg-white border-[#E5E5DF] text-[#171918] font-medium text-[11px]">
                        {item.skill}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 text-[#626763] text-[11px]">
                        <span>{item.questionsCount} Qs</span>
                        <span>•</span>
                        <span>{item.estimatedMinutes} mins</span>
                        <span>•</span>
                        <span className="font-semibold text-[#1F6B4F]">{item.passingScore}% pass</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getDifficultyBadge(item.difficulty)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#1F6B4F] transition-colors cursor-pointer"
                          title="View Details"
                          aria-label={`View details for ${item.title}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(item.id)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                          title="Duplicate Exam"
                          aria-label={`Duplicate ${item.title}`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                          title="Edit Specs"
                          aria-label={`Edit ${item.title}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePromptDelete(item.id, item.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Exam"
                          aria-label={`Delete ${item.title}`}
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
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        centeredTitle={true}
        title={selectedRecord ? 'Edit Assessment' : 'Create New Assessment'}
        description={
          selectedRecord
            ? 'Update benchmark thresholds, evaluation timers, and curriculum categorization.'
            : 'Configure a standardized proctored exam for SkillPath learners'
        }
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          {/* Section 1: Exam Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <ClipboardCheck className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Exam Identity
              </h4>
            </div>
            <Input
              id="asm-title"
              label="Assessment Title"
              size="sm"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. React 19 State & Performance"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                id="asm-skill"
                label="Mapped Skill"
                size="sm"
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                placeholder="e.g. React"
                required
              />
              <Select
                label="Category"
                size="sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                options={[
                  { value: 'Technical', label: 'Technical' },
                  { value: 'Soft Skills', label: 'Soft Skills' },
                  { value: 'Tooling', label: 'Tooling' },
                  { value: 'Domain', label: 'Domain' },
                ]}
              />
            </div>
          </div>

          {/* Section 2: Benchmark Parameters */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <Timer className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Benchmark Parameters
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Input
                id="asm-questions"
                label="Question Count"
                size="sm"
                type="number"
                min="5"
                max="50"
                value={formData.questionsCount}
                onChange={(e) => setFormData({ ...formData, questionsCount: Number(e.target.value) })}
                required
              />
              <Input
                id="asm-minutes"
                label="Time Limit (Minutes)"
                size="sm"
                type="number"
                min="5"
                max="120"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
                required
              />
              <Input
                id="asm-passing"
                label="Passing Score (%)"
                size="sm"
                type="number"
                min="40"
                max="100"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Section 3: Publishing State */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <Award className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Publishing State
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Difficulty Tier"
                size="sm"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                options={[
                  { value: 'Beginner', label: 'Beginner' },
                  { value: 'Intermediate', label: 'Intermediate' },
                  { value: 'Advanced', label: 'Advanced' },
                ]}
              />
              <Select
                label="Lifecycle Status"
                size="sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={[
                  { value: 'published', label: 'Published (Active)' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5DF]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {selectedRecord ? 'Save Changes' : 'Publish Assessment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Assessment Modal */}
      {selectedRecord && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          centeredTitle={true}
          title={selectedRecord.title}
          description="Detailed benchmark telemetry and certification criteria."
          size="md"
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
              <div>
                <span className="text-[#626763] text-[11px]">Skill Domain</span>
                <p className="font-semibold text-sm text-[#171918] mt-0.5">{selectedRecord.skill}</p>
              </div>
              <div>
                <span className="text-[#626763] text-[11px]">Difficulty</span>
                <p className="font-semibold text-sm text-[#1F6B4F] mt-0.5">{selectedRecord.difficulty}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-[#E5E5DF] text-center">
                <span className="text-[10px] text-[#626763] uppercase tracking-wider font-semibold">Total Questions</span>
                <p className="font-bold text-lg text-[#171918] mt-0.5">{selectedRecord.questionsCount}</p>
              </div>
              <div className="p-3 rounded-xl border border-[#E5E5DF] text-center">
                <span className="text-[10px] text-[#626763] uppercase tracking-wider font-semibold">Attempts</span>
                <p className="font-bold text-lg text-[#171918] mt-0.5">{selectedRecord.attemptsCount}</p>
              </div>
              <div className="p-3 rounded-xl border border-[#E5E5DF] text-center">
                <span className="text-[10px] text-[#626763] uppercase tracking-wider font-semibold">Average Score</span>
                <p className="font-bold text-lg text-[#1F6B4F] mt-0.5">{selectedRecord.averageScore}%</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5DF] space-y-1 bg-white">
              <p className="font-semibold text-[#171918]">Certification Benchmark</p>
              <p className="text-[#626763] leading-relaxed">
                Learners must score at least <strong>{selectedRecord.passingScore}%</strong> within{' '}
                <strong>{selectedRecord.estimatedMinutes} minutes</strong> to achieve recognized SkillPath mastery credentials.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E5DF]">
              <Button variant="outline" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setAssessmentToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="danger"
        title="Delete Assessment Exam?"
        description={`Are you sure you want to remove "${assessmentToDelete?.title}"? Learner attempt history associated with this assessment will be unlinked.`}
        confirmText="Delete Assessment"
        cancelText="Cancel"
      />
    </div>
  )
}
