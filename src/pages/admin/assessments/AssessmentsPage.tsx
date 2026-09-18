import React, { useEffect, useState, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { assessmentService } from '@/services/assessmentService'
import { AdminAssessmentRecord } from '@/data/admin/demo.admin.assessments'
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Copy,
  Trash2,
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

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete assessment "${title}"?`)) {
      await assessmentService.deleteAssessment(id)
      await loadAssessments()
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

  if (isLoading) {
    return <LoadingState message="Loading assessments catalog..." minHeight="min-h-[400px]" />
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Assessment Management"
        subtitle="Manage competency benchmarks, question sets, scoring thresholds, and learner completions."
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            {assessments.length} Total Assessments
          </Badge>
        }
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Assessment
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card className="p-4 bg-white border-[#E5E5DF]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E948F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assessment title or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
            />
          </div>

          <Select
            label=""
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
            label=""
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

      {/* Assessments Data Table */}
      <Card className="bg-white border-[#E5E5DF] overflow-hidden">
        {filteredAssessments.length === 0 ? (
          <EmptyState
            title="No assessments found"
            description="Try changing your search keywords or filter criteria."
            actionLabel="Reset Filters"
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
                <tr className="border-b border-[#E5E5DF] bg-[#F8F7F3]/70 text-[#626763] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4">Mapped Skill</th>
                  <th className="py-3 px-4 text-center">Questions</th>
                  <th className="py-3 px-4 text-center">Attempts</th>
                  <th className="py-3 px-4 text-center">Average Score</th>
                  <th className="py-3 px-4 text-center">Difficulty</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {filteredAssessments.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8F7F3]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-[#171918]">{item.title}</span>
                        <div className="flex items-center gap-2 text-[11px] text-[#626763]">
                          <span>{item.estimatedMinutes} mins</span>
                          <span>•</span>
                          <span>Passing: {item.passingScore}%</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" size="sm" className="bg-[#F8F7F3] text-[#171918] font-medium">
                        {item.skill}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-[#171918]">
                      {item.questionsCount}
                    </td>

                    <td className="py-3.5 px-4 text-center font-medium text-[#171918]">
                      {item.attemptsCount}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-[#1F6B4F]">{item.averageScore}%</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          item.difficulty === 'Beginner'
                            ? 'success'
                            : item.difficulty === 'Intermediate'
                            ? 'forest'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {item.difficulty}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={item.status === 'published' ? 'success' : item.status === 'draft' ? 'outline' : 'warning'}
                        size="sm"
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#1F6B4F] transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                          title="Edit Assessment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(item.id)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#1F6B4F] transition-colors cursor-pointer"
                          title="Duplicate Assessment"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Assessment"
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
        title={selectedRecord ? 'Edit Assessment' : 'Create New Assessment'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Input
            id="asm-title"
            label="Assessment Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. React 19 State & Performance"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="asm-skill"
              label="Mapped Skill"
              value={formData.skill}
              onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
              placeholder="e.g. React"
              required
            />
            <Select
              label="Category"
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

          <div className="grid grid-cols-3 gap-3">
            <Input
              id="asm-questions"
              label="Questions"
              type="number"
              min="5"
              max="50"
              value={formData.questionsCount}
              onChange={(e) => setFormData({ ...formData, questionsCount: Number(e.target.value) })}
              required
            />
            <Input
              id="asm-minutes"
              label="Minutes"
              type="number"
              min="5"
              max="120"
              value={formData.estimatedMinutes}
              onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
              required
            />
            <Input
              id="asm-passing"
              label="Passing (%)"
              type="number"
              min="40"
              max="100"
              value={formData.passingScore}
              onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Difficulty"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
              options={[
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
            />
            <Select
              label="Publish Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E5DF]">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
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
          title={selectedRecord.title}
          size="md"
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF]">
              <div>
                <span className="text-[#626763]">Skill Domain:</span>
                <p className="font-semibold text-sm text-[#171918] mt-0.5">{selectedRecord.skill}</p>
              </div>
              <div>
                <span className="text-[#626763]">Difficulty:</span>
                <p className="font-semibold text-sm text-[#1F6B4F] mt-0.5">{selectedRecord.difficulty}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg border border-[#E5E5DF] text-center">
                <span className="text-[10px] text-[#626763]">Total Questions</span>
                <p className="font-bold text-base text-[#171918]">{selectedRecord.questionsCount}</p>
              </div>
              <div className="p-2.5 rounded-lg border border-[#E5E5DF] text-center">
                <span className="text-[10px] text-[#626763]">Attempts Recorded</span>
                <p className="font-bold text-base text-[#171918]">{selectedRecord.attemptsCount}</p>
              </div>
              <div className="p-2.5 rounded-lg border border-[#E5E5DF] text-center">
                <span className="text-[10px] text-[#626763]">Average Score</span>
                <p className="font-bold text-base text-[#1F6B4F]">{selectedRecord.averageScore}%</p>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-[#E5E5DF] space-y-1">
              <p className="font-semibold text-[#171918]">Scoring Benchmarks</p>
              <p className="text-[#626763]">
                Learners must score at least <strong>{selectedRecord.passingScore}%</strong> within{' '}
                <strong>{selectedRecord.estimatedMinutes} minutes</strong> to achieve certification.
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
    </div>
  )
}
