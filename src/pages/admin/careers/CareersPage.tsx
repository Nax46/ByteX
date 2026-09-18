import React, { useEffect, useState, useMemo } from 'react'
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
import { EmptyState } from '@/components/common/EmptyState'
import { careerService } from '@/services/careerService'
import { AdminCareerRecord } from '@/data/admin/demo.admin.careers'
import { ROUTES } from '@/constants/routes'
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Briefcase,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react'

export const CareersPage: React.FC = () => {
  const [careers, setCareers] = useState<AdminCareerRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCareer, setSelectedCareer] = useState<AdminCareerRecord | null>(null)

  // Destructive Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [careerToDelete, setCareerToDelete] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handlePromptDelete = (id: string, title: string) => {
    setCareerToDelete({ id, title })
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!careerToDelete) return
    setIsDeleting(true)
    try {
      await careerService.deleteCareer(careerToDelete.id)
      await loadCareers()
      setDeleteConfirmOpen(false)
      setCareerToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const getDemandBadge = (demand: AdminCareerRecord['marketDemand']) => {
    switch (demand) {
      case 'Very High':
        return <Badge variant="forest" size="sm">Very High Demand</Badge>
      case 'High':
        return <Badge variant="success" size="sm">High Demand</Badge>
      case 'Medium':
        return <Badge variant="outline" size="sm">Medium Demand</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title="Industry Career Targets"
          subtitle="Define target job profiles, market salary benchmarks, and prerequisite competency clusters."
          breadcrumbs={[
            { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
            { label: 'Careers' },
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
        title="Industry Career Targets"
        subtitle="Define target job profiles, market salary benchmarks, and prerequisite competency clusters."
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Careers' },
        ]}
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            {careers.length} Industry Tracks Active
          </Badge>
        }
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Career Target
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card className="p-4 bg-white border-[#E5E5DF]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E948F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Search career roles"
              placeholder="Search career role, category, or core skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
            />
          </div>

          <Select
            size="sm"
            aria-label="Filter by lifecycle status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'emerging', label: 'Emerging' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white border-[#E5E5DF] overflow-hidden">
        {filteredCareers.length === 0 ? (
          <EmptyState
            title="No career tracks found"
            description="No career profiles match your filter criteria."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchTerm('')
              setStatusFilter('all')
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E5DF] bg-[#F8F7F3]/80 text-[#626763] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Career Track</th>
                  <th className="py-3 px-4">Domain Category</th>
                  <th className="py-3 px-4">Market Demand & Pay</th>
                  <th className="py-3 px-4 min-w-[140px]">Readiness Alignment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {filteredCareers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#171918]">{c.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.requiredSkills.slice(0, 3).map((sk) => (
                          <span key={sk} className="px-1.5 py-0.5 rounded bg-[#F8F7F3] border border-[#E5E5DF] text-[10px] text-[#626763]">
                            {sk}
                          </span>
                        ))}
                        {c.requiredSkills.length > 3 && (
                          <span className="text-[10px] text-[#8E948F]">+{c.requiredSkills.length - 3}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[#626763] font-medium">{c.category}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {getDemandBadge(c.marketDemand)}
                        <p className="text-[11px] font-semibold text-[#171918]">{c.averageSalaryRange}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-[#1F6B4F]">{c.averageSkillAlignment}% aligned</span>
                          <span className="text-[#8E948F]">{c.studentsInterested} interested</span>
                        </div>
                        <ProgressBar value={c.averageSkillAlignment} size="sm" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={c.status === 'active' ? 'success' : c.status === 'emerging' ? 'forest' : 'outline'}
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
                          title="View Role Intelligence"
                          aria-label={`View role intelligence for ${c.title}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                          title="Edit Career Track"
                          aria-label={`Edit ${c.title}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePromptDelete(c.id, c.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Career Track"
                          aria-label={`Delete ${c.title}`}
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
        centeredTitle={true}
        title={selectedCareer ? 'Edit Career Track' : 'Create Target Career Track'}
        description={
          selectedCareer
            ? 'Update industry compensation brackets, core skill requirements, and market demand telemetry.'
            : 'Register an industry role target with prerequisite skill competencies'
        }
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          {/* Section 1: Career Profile */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <Briefcase className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Career Profile
              </h4>
            </div>
            <Input
              id="career-title"
              label="Role Title"
              size="sm"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Frontend Architect"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Domain Category"
                size="sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { value: 'Software Engineering', label: 'Software Engineering' },
                  { value: 'Data Science & Analytics', label: 'Data Science & Analytics' },
                  { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
                  { value: 'Product & Design', label: 'Product & Design' },
                  { value: 'Cloud & DevOps', label: 'Cloud & DevOps' },
                  { value: 'Cybersecurity', label: 'Cybersecurity' },
                ]}
              />
              <Select
                label="Lifecycle Status"
                size="sm"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'emerging', label: 'Emerging' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </div>
          </div>

          {/* Section 2: Market Telemetry */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <TrendingUp className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Market Telemetry
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Market Demand Tier"
                size="sm"
                value={formData.marketDemand}
                onChange={(e) => setFormData({ ...formData, marketDemand: e.target.value as any })}
                options={[
                  { value: 'Very High', label: 'Very High Demand' },
                  { value: 'High', label: 'High Demand' },
                  { value: 'Medium', label: 'Medium Demand' },
                ]}
              />
              <Input
                id="career-salary"
                label="Average Salary Range"
                size="sm"
                value={formData.averageSalaryRange}
                onChange={(e) => setFormData({ ...formData, averageSalaryRange: e.target.value })}
                placeholder="e.g. ₹8L - ₹16L / yr"
                required
              />
            </div>
          </div>

          {/* Section 3: Required Skill Competencies */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <BrainCircuit className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Required Skill Competencies
              </h4>
            </div>
            <Input
              id="career-skills"
              label="Prerequisite Skills (Comma Separated)"
              size="sm"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              placeholder="e.g. HTML, CSS, JavaScript, React, TypeScript"
              required
            />
            <div className="space-y-1 text-xs">
              <label htmlFor="career-desc" className="font-medium text-[#171918]">
                Role Scope & Expectations
              </label>
              <textarea
                id="career-desc"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
                placeholder="Describe day-to-day responsibilities, industry expectations, and hiring velocity..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5DF]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {selectedCareer ? 'Save Changes' : 'Create Career Track'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Role Intelligence Modal */}
      {selectedCareer && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          centeredTitle={true}
          title={selectedCareer.title}
          description="Industry hiring intelligence and skill prerequisite breakdown."
          size="md"
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF]">
              <div>
                <span className="text-[#626763] text-[11px]">Domain Track</span>
                <p className="font-semibold text-sm text-[#171918] mt-0.5">{selectedCareer.category}</p>
              </div>
              <div>
                <span className="text-[#626763] text-[11px]">Market Salary</span>
                <p className="font-semibold text-sm text-[#1F6B4F] mt-0.5">{selectedCareer.averageSalaryRange}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5DF] space-y-2">
              <span className="font-semibold text-[#171918] text-xs">Mandatory Skill Competencies</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCareer.requiredSkills.map((sk) => (
                  <Badge key={sk} variant="outline" size="sm" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE]">
                    {sk}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5DF] space-y-1">
              <span className="font-semibold text-[#171918] text-xs">Role Overview</span>
              <p className="text-[#626763] leading-relaxed">
                {selectedCareer.description || 'Comprehensive career roadmap leading towards enterprise mastery.'}
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
          setCareerToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="danger"
        title="Delete Career Goal Track?"
        description={`Are you sure you want to remove "${careerToDelete?.title}"? Active learner targets referencing this role will need to be remapped.`}
        confirmText="Delete Career"
        cancelText="Cancel"
      />
    </div>
  )
}
