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
import { careerService } from '@/services/careerService'
import { AdminCareerRecord } from '@/data/admin/demo.admin.careers'
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react'

export const CareersPage: React.FC = () => {
  const [careers, setCareers] = useState<AdminCareerRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCareer, setSelectedCareer] = useState<AdminCareerRecord | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    category: 'Software Engineering',
    requiredSkills: 'HTML & CSS, JavaScript, React',
    studentsInterested: 150,
    averageSkillAlignment: 65,
    status: 'active' as AdminCareerRecord['status'],
    marketDemand: 'High' as AdminCareerRecord['marketDemand'],
    averageSalaryRange: '₹6L - ₹12L / yr',
    description: '',
  })

  const loadCareers = async () => {
    try {
      const data = await careerService.getCareers()
      setCareers(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCareers()
  }, [])

  const filteredCareers = useMemo(() => {
    return careers.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [careers, searchTerm, statusFilter])

  const handleOpenAdd = () => {
    setSelectedCareer(null)
    setFormData({
      title: '',
      category: 'Software Engineering',
      requiredSkills: 'HTML & CSS, JavaScript, React',
      studentsInterested: 120,
      averageSkillAlignment: 65,
      status: 'active',
      marketDemand: 'High',
      averageSalaryRange: '₹6L - ₹12L / yr',
      description: '',
    })
    setIsEditModalOpen(true)
  }

  const handleOpenEdit = (c: AdminCareerRecord) => {
    setSelectedCareer(c)
    setFormData({
      title: c.title,
      category: c.category,
      requiredSkills: c.requiredSkills.join(', '),
      studentsInterested: c.studentsInterested,
      averageSkillAlignment: c.averageSkillAlignment,
      status: c.status,
      marketDemand: c.marketDemand,
      averageSalaryRange: c.averageSalaryRange,
      description: c.description,
    })
    setIsEditModalOpen(true)
  }

  const handleOpenView = (c: AdminCareerRecord) => {
    setSelectedCareer(c)
    setIsViewModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return

    const skillsArray = formData.requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (selectedCareer) {
      await careerService.updateCareer(selectedCareer.id, {
        ...formData,
        requiredSkills: skillsArray,
      })
    } else {
      await careerService.createCareer({
        ...formData,
        requiredSkills: skillsArray,
      })
    }

    setIsEditModalOpen(false)
    await loadCareers()
  }

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete career goal track "${title}"?`)) {
      await careerService.deleteCareer(id)
      await loadCareers()
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading career paths..." minHeight="min-h-[400px]" />
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Career Path Management"
        subtitle="Configure target industry occupations, market requirements, skill stacks, and alignment metrics."
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            {careers.length} Verified Occupations
          </Badge>
        }
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Career Path
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
              placeholder="Search career title, category, or required skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
            />
          </div>

          <Select
            label=""
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Career Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'emerging', label: 'Emerging' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </Card>

      {/* Data Table */}
      <Card className="bg-white border-[#E5E5DF] overflow-hidden">
        {filteredCareers.length === 0 ? (
          <EmptyState
            title="No careers found"
            description="No career profiles match your search criteria."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchTerm('')
              setStatusFilter('all')
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E5DF] bg-[#F8F7F3]/70 text-[#626763] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Career Occupation</th>
                  <th className="py-3 px-4">Required Skills</th>
                  <th className="py-3 px-4 text-center">Interested</th>
                  <th className="py-3 px-4 min-w-[140px]">Skill Alignment</th>
                  <th className="py-3 px-4 text-center">Demand</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {filteredCareers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F7F3]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-sm text-[#171918]">{c.title}</span>
                        <p className="text-[11px] text-[#626763]">{c.category}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.requiredSkills.map((s, idx) => (
                          <Badge key={idx} variant="outline" size="sm" className="bg-[#F8F7F3] text-[10px] text-[#171918]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-[#171918]">{c.studentsInterested}</span>
                      <span className="text-[11px] text-[#626763] ml-1">students</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-bold text-[#1F6B4F]">{c.averageSkillAlignment}%</span>
                          <span className="text-[#8E948F]">Cohort Avg</span>
                        </div>
                        <ProgressBar value={c.averageSkillAlignment} size="sm" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={c.marketDemand === 'Very High' ? 'forest' : 'success'}
                        size="sm"
                      >
                        {c.marketDemand}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={c.status === 'active' ? 'success' : c.status === 'emerging' ? 'warning' : 'outline'}
                        size="sm"
                      >
                        {c.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenView(c)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#1F6B4F] transition-colors cursor-pointer"
                          title="View Occupation Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                          title="Edit Career Path"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Career Path"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedCareer ? 'Edit Career Track' : 'Add Target Occupation'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Input
            id="car-title"
            label="Occupation Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Solutions Architect"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="car-category"
              label="Industry Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Cloud & Infrastructure"
              required
            />
            <Select
              label="Market Demand"
              value={formData.marketDemand}
              onChange={(e) => setFormData({ ...formData, marketDemand: e.target.value as any })}
              options={[
                { value: 'Very High', label: 'Very High' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
              ]}
            />
          </div>

          <Input
            id="car-skills"
            label="Required Skills (comma separated)"
            value={formData.requiredSkills}
            onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
            placeholder="HTML & CSS, JavaScript, React..."
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="car-salary"
              label="Average Salary Range"
              value={formData.averageSalaryRange}
              onChange={(e) => setFormData({ ...formData, averageSalaryRange: e.target.value })}
              placeholder="e.g. ₹8L - ₹18L / yr"
              required
            />
            <Select
              label="Track Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'emerging', label: 'Emerging' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-[#171918]">Career Role Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2.5 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors"
              placeholder="Key responsibilities, domain prerequisites, and hiring expectations..."
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E5DF]">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedCareer ? 'Save Changes' : 'Create Career Track'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Career Modal */}
      {selectedCareer && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={selectedCareer.title}
          size="md"
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-[#F8F7F3] border border-[#E5E5DF] space-y-2">
              <p className="text-xs text-[#626763]">{selectedCareer.description}</p>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-medium text-[#171918]">
                <span>Category: {selectedCareer.category}</span>
                <span>•</span>
                <span>Salary: {selectedCareer.averageSalaryRange}</span>
                <span>•</span>
                <span>Demand: {selectedCareer.marketDemand}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-[#171918] block mb-2">Required Competency Stack</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCareer.requiredSkills.map((s, idx) => (
                  <Badge key={idx} variant="forest" size="sm">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-[#E5E5DF] flex items-center justify-between">
              <div>
                <span className="text-[#626763]">Average Student Alignment</span>
                <p className="font-bold text-lg text-[#1F6B4F] mt-0.5">{selectedCareer.averageSkillAlignment}%</p>
              </div>
              <div className="text-right">
                <span className="text-[#626763]">Active Cohort Interest</span>
                <p className="font-bold text-lg text-[#171918] mt-0.5">{selectedCareer.studentsInterested} learners</p>
              </div>
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
