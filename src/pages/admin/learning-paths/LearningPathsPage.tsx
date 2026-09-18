import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { learningPathService } from '@/services/learningPathService'
import { AdminLearningPathRecord, LearningPathStep } from '@/data/admin/demo.admin.learningPaths'
import { ROUTES } from '@/constants/routes'
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Compass,
  TrendingUp,
  BookOpen,
} from 'lucide-react'

export const LearningPathsPage: React.FC = () => {
  const [paths, setPaths] = useState<AdminLearningPathRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStepsModalOpen, setIsStepsModalOpen] = useState(false)
  const [selectedPath, setSelectedPath] = useState<AdminLearningPathRecord | null>(null)

  // Destructive Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pathToDelete, setPathToDelete] = useState<{ id: string; career: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    career: '',
    category: 'Engineering',
    studentsEnrolled: 250,
    completionRate: 60,
    status: 'active' as AdminLearningPathRecord['status'],
    description: '',
  })

  // Step addition inside steps modal
  const [newStepTitle, setNewStepTitle] = useState('')
  const [newStepWeeks, setNewStepWeeks] = useState(3)

  const loadPaths = async () => {
    try {
      const data = await learningPathService.getLearningPaths()
      setPaths(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPaths()
  }, [])

  const handleOpenAdd = () => {
    setSelectedPath(null)
    setFormData({
      career: '',
      category: 'Engineering',
      studentsEnrolled: 180,
      completionRate: 50,
      status: 'active',
      description: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (path: AdminLearningPathRecord) => {
    setSelectedPath(path)
    setFormData({
      career: path.career,
      category: path.category,
      studentsEnrolled: path.studentsEnrolled,
      completionRate: path.completionRate,
      status: path.status,
      description: path.description,
    })
    setIsModalOpen(true)
  }

  const handleOpenSteps = (path: AdminLearningPathRecord) => {
    setSelectedPath(path)
    setNewStepTitle('')
    setNewStepWeeks(3)
    setIsStepsModalOpen(true)
  }

  const handleSavePath = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.career) return

    if (selectedPath) {
      await learningPathService.updateLearningPath(selectedPath.id, {
        ...formData,
      })
    } else {
      await learningPathService.createLearningPath({
        ...formData,
        stepsCount: 4,
        steps: [
          { id: `s-${Date.now()}-1`, title: 'Foundational Knowledge', estimatedWeeks: 2, skillsCovered: ['Fundamentals'], isCore: true },
          { id: `s-${Date.now()}-2`, title: 'Core Concepts & Tooling', estimatedWeeks: 3, skillsCovered: ['Core Tools'], isCore: true },
          { id: `s-${Date.now()}-3`, title: 'Advanced Patterns & Architecture', estimatedWeeks: 4, skillsCovered: ['Architecture'], isCore: true },
          { id: `s-${Date.now()}-4`, title: 'Industry Portfolio Capstone', estimatedWeeks: 3, skillsCovered: ['Capstone'], isCore: true },
        ],
      })
    }

    setIsModalOpen(false)
    await loadPaths()
  }

  const handlePromptDelete = (id: string, career: string) => {
    setPathToDelete({ id, career })
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!pathToDelete) return
    setIsDeleting(true)
    try {
      await learningPathService.deleteLearningPath(pathToDelete.id)
      await loadPaths()
      setDeleteConfirmOpen(false)
      setPathToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddStep = async () => {
    if (!selectedPath || !newStepTitle) return

    const newStep: LearningPathStep = {
      id: `step-${Date.now()}`,
      title: newStepTitle,
      estimatedWeeks: Number(newStepWeeks),
      skillsCovered: ['Specialization'],
      isCore: true,
    }

    const updatedSteps = [...selectedPath.steps, newStep]
    const updated = await learningPathService.updateLearningPath(selectedPath.id, {
      steps: updatedSteps,
      stepsCount: updatedSteps.length,
    })

    setSelectedPath(updated)
    setNewStepTitle('')
    await loadPaths()
  }

  const handleRemoveStep = async (stepId: string) => {
    if (!selectedPath) return

    const updatedSteps = selectedPath.steps.filter((s) => s.id !== stepId)
    const updated = await learningPathService.updateLearningPath(selectedPath.id, {
      steps: updatedSteps,
      stepsCount: updatedSteps.length,
    })

    setSelectedPath(updated)
    await loadPaths()
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title="Career Learning Paths"
          subtitle="Architect structured milestone roadmaps, project sequences, and curriculum progress."
          breadcrumbs={[
            { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
            { label: 'Learning Paths' },
          ]}
        />
        <TableSkeleton rows={5} columns={5} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Career Learning Paths"
        subtitle="Architect structured milestone roadmaps, project sequences, and curriculum progress."
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Learning Paths' },
        ]}
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            {paths.length} Career Roadmaps Active
          </Badge>
        }
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Learning Path
          </Button>
        }
      />

      {/* Roadmaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((path) => (
          <Card key={path.id} className="p-5 bg-white border-[#E5E5DF] flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" size="sm" className="bg-[#F8F7F3] text-[#1F6B4F] font-semibold text-[10px]">
                  {path.category}
                </Badge>
                <Badge
                  variant={path.status === 'active' ? 'success' : 'outline'}
                  size="sm"
                >
                  {path.status.toUpperCase()}
                </Badge>
              </div>

              <div>
                <h3 className="font-heading text-base font-bold text-[#171918]">
                  {path.career}
                </h3>
                <p className="text-xs text-[#626763] mt-1 line-clamp-2">
                  {path.description}
                </p>
              </div>

              {/* Progress & Stats */}
              <div className="pt-2 border-t border-[#E5E5DF] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#626763]">Cohort Completion</span>
                  <span className="font-semibold text-[#1F6B4F]">{path.completionRate}%</span>
                </div>
                <ProgressBar value={path.completionRate} size="sm" />

                <div className="flex items-center justify-between text-[11px] text-[#626763] pt-1">
                  <span>{path.studentsEnrolled} Learners</span>
                  <span>{path.stepsCount} Milestone Phases</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E5E5DF] mt-4 flex items-center justify-between">
              <button
                onClick={() => handleOpenSteps(path)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F6B4F] hover:text-[#154d38] cursor-pointer"
                aria-label={`Manage milestones for ${path.career}`}
              >
                <Layers className="w-3.5 h-3.5" />
                Manage Steps ({path.stepsCount})
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(path)}
                  className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                  title="Edit Path Specs"
                  aria-label={`Edit ${path.career}`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePromptDelete(path.id, path.career)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Path"
                  aria-label={`Delete ${path.career}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Path Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        centeredTitle={true}
        title={selectedPath ? 'Edit Career Roadmap' : 'Create Career Learning Path'}
        description={
          selectedPath
            ? 'Refine roadmap specifications, target career tracks, and cohort milestones.'
            : 'Configure a phased curriculum sequence for a target professional occupation'
        }
        size="lg"
      >
        <form onSubmit={handleSavePath} className="space-y-4 pt-1">
          {/* Section 1: Track Profile */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <Compass className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Track Profile
              </h4>
            </div>
            <Input
              id="path-career"
              label="Target Career Goal"
              size="sm"
              value={formData.career}
              onChange={(e) => setFormData({ ...formData, career: e.target.value })}
              placeholder="e.g. Cloud DevOps Engineer"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Track Category"
                size="sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Data & Analytics', label: 'Data & Analytics' },
                  { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
                  { value: 'Design & Product', label: 'Design & Product' },
                  { value: 'Security & Infrastructure', label: 'Security & Infrastructure' },
                ]}
              />
              <Select
                label="Lifecycle Status"
                size="sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>
          </div>

          {/* Section 2: Cohort Metrics */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <TrendingUp className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Cohort Metrics
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                id="path-students"
                label="Enrolled Students"
                size="sm"
                type="number"
                min="0"
                value={formData.studentsEnrolled}
                onChange={(e) => setFormData({ ...formData, studentsEnrolled: Number(e.target.value) })}
                required
              />
              <Input
                id="path-completion"
                label="Average Completion Rate (%)"
                size="sm"
                type="number"
                min="0"
                max="100"
                value={formData.completionRate}
                onChange={(e) => setFormData({ ...formData, completionRate: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Section 3: Overview Description */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Roadmap Overview
              </h4>
            </div>
            <div className="space-y-1 text-xs">
              <label htmlFor="path-desc" className="font-medium text-[#171918]">
                Curriculum Scope & Prerequisites
              </label>
              <textarea
                id="path-desc"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
                placeholder="Describe curriculum milestones, industry tech stack, and expected job market outcomes..."
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5DF]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {selectedPath ? 'Save Changes' : 'Create Path'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Roadmap Steps Editor Modal */}
      {selectedPath && (
        <Modal
          isOpen={isStepsModalOpen}
          onClose={() => setIsStepsModalOpen(false)}
          centeredTitle={true}
          title={`Roadmap Steps: ${selectedPath.career}`}
          description="Sequence core milestone phases and expected completion horizons."
          size="lg"
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* Steps List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {selectedPath.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3 rounded-xl border border-[#E5E5DF] bg-[#F8F7F3] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-white border border-[#E5E5DF] flex items-center justify-center font-bold text-xs text-[#1F6B4F] shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-semibold text-sm text-[#171918]">{step.title}</h5>
                      <span className="text-[11px] text-[#626763]">{step.estimatedWeeks} Weeks Estimated</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveStep(step.id)}
                    className="p-1.5 rounded-md text-[#626763] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove Step"
                    aria-label={`Remove step ${step.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Step Form */}
            <div className="p-3.5 rounded-xl border border-[#D8E8DE] bg-[#D8E8DE]/20 space-y-2">
              <span className="font-semibold text-xs text-[#1F6B4F]">Add Next Milestone Step</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. Next.js App Router & Server Actions"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  className="flex-1 h-9 px-3 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#171918] focus:outline-none focus:border-[#1F6B4F]"
                />
                <input
                  type="number"
                  placeholder="Weeks"
                  min="1"
                  max="12"
                  value={newStepWeeks}
                  onChange={(e) => setNewStepWeeks(Number(e.target.value))}
                  className="w-full sm:w-24 h-9 px-3 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#171918] focus:outline-none focus:border-[#1F6B4F]"
                />
                <Button variant="primary" size="sm" onClick={handleAddStep}>
                  Add Step
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E5DF]">
              <Button variant="outline" size="sm" onClick={() => setIsStepsModalOpen(false)}>
                Done
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
          setPathToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="danger"
        title="Delete Career Learning Path?"
        description={`Are you sure you want to remove the roadmap for "${pathToDelete?.career}"? This will unlink current enrolled milestones.`}
        confirmText="Delete Path"
        cancelText="Cancel"
      />
    </div>
  )
}
