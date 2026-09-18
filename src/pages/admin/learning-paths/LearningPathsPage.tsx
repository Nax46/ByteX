import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { learningPathService } from '@/services/learningPathService'
import { AdminLearningPathRecord, LearningPathStep } from '@/data/admin/demo.admin.learningPaths'
import {
  Map,
  Plus,
  Edit2,
  Trash2,
  Layers,
} from 'lucide-react'

export const LearningPathsPage: React.FC = () => {
  const [paths, setPaths] = useState<AdminLearningPathRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isStepsModalOpen, setIsStepsModalOpen] = useState(false)
  const [selectedPath, setSelectedPath] = useState<AdminLearningPathRecord | null>(null)

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

  const handleDeletePath = async (id: string, career: string) => {
    if (window.confirm(`Delete roadmap for "${career}"?`)) {
      await learningPathService.deleteLearningPath(id)
      await loadPaths()
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
    return <LoadingState message="Loading career learning paths..." minHeight="min-h-[400px]" />
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Learning Path Management"
        subtitle="Manage structured career roadmaps, step progressions, student milestones, and cohort completion rates."
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            {paths.length} Career Roadmaps
          </Badge>
        }
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Learning Path
          </Button>
        }
      />

      {/* Grid of Learning Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paths.map((path) => (
          <Card key={path.id} className="p-6 bg-white border-[#E5E5DF] flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center font-bold">
                  <Map className="w-5 h-5" />
                </div>
                <Badge
                  variant={path.status === 'active' ? 'success' : path.status === 'draft' ? 'outline' : 'warning'}
                  size="sm"
                >
                  {path.status.toUpperCase()}
                </Badge>
              </div>

              <div>
                <h3 className="font-heading text-lg font-bold text-[#171918]">{path.career}</h3>
                <p className="text-xs text-[#626763] line-clamp-2 mt-1">{path.description}</p>
              </div>

              <div className="pt-2 border-t border-[#E5E5DF] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#626763]">Curriculum Steps</span>
                  <span className="font-semibold text-[#171918]">{path.stepsCount} milestones</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#626763]">Enrolled Learners</span>
                  <span className="font-semibold text-[#171918]">{path.studentsEnrolled} students</span>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#626763]">Cohort Completion Rate</span>
                    <span className="font-bold text-[#1F6B4F]">{path.completionRate}%</span>
                  </div>
                  <ProgressBar value={path.completionRate} size="sm" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-[#E5E5DF] flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenSteps(path)}
                className="text-xs"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                Manage Steps
              </Button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(path)}
                  className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                  title="Edit Path Details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePath(path.id, path.career)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Path"
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
        title={selectedPath ? 'Edit Learning Path' : 'Create Career Learning Path'}
        size="md"
      >
        <form onSubmit={handleSavePath} className="space-y-4 pt-2">
          <Input
            id="path-career"
            label="Target Career Goal"
            value={formData.career}
            onChange={(e) => setFormData({ ...formData, career: e.target.value })}
            placeholder="e.g. Cloud DevOps Engineer"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Track Category"
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
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="path-students"
              label="Enrolled Students"
              type="number"
              min="0"
              value={formData.studentsEnrolled}
              onChange={(e) => setFormData({ ...formData, studentsEnrolled: Number(e.target.value) })}
              required
            />
            <Input
              id="path-completion"
              label="Completion Rate (%)"
              type="number"
              min="0"
              max="100"
              value={formData.completionRate}
              onChange={(e) => setFormData({ ...formData, completionRate: Number(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-[#171918]">Roadmap Overview</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors"
              placeholder="Describe curriculum milestones, industry stack, and target career outcomes..."
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E5DF]">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
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
          title={`Manage Roadmap Steps: ${selectedPath.career}`}
          size="lg"
        >
          <div className="space-y-4 pt-2 text-xs">
            {/* Steps List */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {selectedPath.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3 rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white border border-[#E5E5DF] flex items-center justify-center font-bold text-[11px] text-[#1F6B4F]">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="font-semibold text-sm text-[#171918]">{step.title}</h5>
                      <span className="text-[11px] text-[#626763]">{step.estimatedWeeks} Weeks Estimated</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveStep(step.id)}
                    className="p-1.5 rounded text-[#626763] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Remove Step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Step Form */}
            <div className="p-3 rounded-xl border border-[#D8E8DE] bg-[#D8E8DE]/20 space-y-2">
              <span className="font-semibold text-xs text-[#1F6B4F]">Add Next Milestone Step</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Next.js App Router & SSR"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  className="flex-1 p-2 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#171918]"
                />
                <input
                  type="number"
                  placeholder="Weeks"
                  min="1"
                  max="12"
                  value={newStepWeeks}
                  onChange={(e) => setNewStepWeeks(Number(e.target.value))}
                  className="w-20 p-2 text-xs rounded-lg border border-[#E5E5DF] bg-white text-[#171918]"
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
    </div>
  )
}
