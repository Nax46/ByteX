import React, { useEffect, useState, useMemo } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { skillService } from '@/services/skillService'
import { AdminSkillRecord } from '@/data/admin/demo.admin.skills'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react'

export const SkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<AdminSkillRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<AdminSkillRecord | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Frontend Development',
    studentsLearning: 100,
    averageScore: 75,
    status: 'active' as AdminSkillRecord['status'],
    targetBenchmark: 80,
    description: '',
  })

  const loadSkills = async () => {
    try {
      const data = await skillService.getSkills()
      setSkills(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSkills()
  }, [])

  const categories = useMemo(() => {
    return Array.from(new Set(skills.map((s) => s.category)))
  }, [skills])

  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [skills, searchTerm, categoryFilter])

  const handleOpenAdd = () => {
    setEditingSkill(null)
    setFormData({
      name: '',
      category: 'Frontend Development',
      studentsLearning: 120,
      averageScore: 78,
      status: 'active',
      targetBenchmark: 80,
      description: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (skill: AdminSkillRecord) => {
    setEditingSkill(skill)
    setFormData({
      name: skill.name,
      category: skill.category,
      studentsLearning: skill.studentsLearning,
      averageScore: skill.averageScore,
      status: skill.status,
      targetBenchmark: skill.targetBenchmark,
      description: skill.description,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return

    if (editingSkill) {
      await skillService.updateSkill(editingSkill.id, formData)
    } else {
      await skillService.createSkill(formData)
    }

    setIsModalOpen(false)
    await loadSkills()
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove skill "${name}"?`)) {
      await skillService.deleteSkill(id)
      await loadSkills()
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading skill taxonomy..." minHeight="min-h-[400px]" />
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Skills Management"
        subtitle="Manage competency taxonomy, curriculum alignment, benchmarks, and active learners per domain."
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            {skills.length} Tracked Skills
          </Badge>
        }
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Skill
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card className="p-4 bg-white border-[#E5E5DF]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E948F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skill by name, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
            />
          </div>

          <Select
            label=""
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Skill Categories' },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>
      </Card>

      {/* Skills Table */}
      <Card className="bg-white border-[#E5E5DF] overflow-hidden">
        {filteredSkills.length === 0 ? (
          <EmptyState
            title="No skills found"
            description="No competencies match your current filter parameters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchTerm('')
              setCategoryFilter('all')
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E5DF] bg-[#F8F7F3]/70 text-[#626763] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Skill Domain</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Students Learning</th>
                  <th className="py-3 px-4 min-w-[140px]">Avg Score vs Target</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="hover:bg-[#F8F7F3]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-sm text-[#171918]">{skill.name}</span>
                        <p className="text-[11px] text-[#626763] line-clamp-1 max-w-sm">{skill.description}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" size="sm" className="bg-[#F8F7F3] text-[#171918] font-medium">
                        {skill.category}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-[#171918]">{skill.studentsLearning}</span>
                      <span className="text-[11px] text-[#626763] ml-1">students</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-[#1F6B4F]">{skill.averageScore}%</span>
                          <span className="text-[#8E948F]">Benchmark: {skill.targetBenchmark}%</span>
                        </div>
                        <ProgressBar value={skill.averageScore} size="sm" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={skill.status === 'active' ? 'success' : skill.status === 'in-review' ? 'warning' : 'outline'}
                        size="sm"
                      >
                        {skill.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(skill)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                          title="Edit Skill"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id, skill.name)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Skill"
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

      {/* Add / Edit Skill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSkill ? 'Edit Skill Definition' : 'Add New Competency'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Input
            id="skill-name"
            label="Skill Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. TypeScript"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="skill-category"
              label="Taxonomy Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Core Programming"
              required
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'in-review', label: 'In-Review' },
                { value: 'deprecated', label: 'Deprecated' },
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              id="skill-students"
              label="Students Learning"
              type="number"
              min="0"
              value={formData.studentsLearning}
              onChange={(e) => setFormData({ ...formData, studentsLearning: Number(e.target.value) })}
              required
            />
            <Input
              id="skill-avg"
              label="Average Score (%)"
              type="number"
              min="0"
              max="100"
              value={formData.averageScore}
              onChange={(e) => setFormData({ ...formData, averageScore: Number(e.target.value) })}
              required
            />
            <Input
              id="skill-target"
              label="Benchmark (%)"
              type="number"
              min="0"
              max="100"
              value={formData.targetBenchmark}
              onChange={(e) => setFormData({ ...formData, targetBenchmark: Number(e.target.value) })}
              required
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-[#171918]">Competency Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors"
              placeholder="Describe scope, concepts tested, and prerequisites..."
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E5DF]">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingSkill ? 'Save Changes' : 'Create Skill'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
