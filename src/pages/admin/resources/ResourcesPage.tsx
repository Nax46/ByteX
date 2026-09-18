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
import { resourceService } from '@/services/resourceService'
import { AdminResourceRecord, ResourceType } from '@/data/admin/demo.admin.resources'
import { ROUTES } from '@/constants/routes'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Code2,
  FolderGit2,
  HelpCircle,
  Globe,
  Sliders,
} from 'lucide-react'

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<AdminResourceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<AdminResourceRecord | null>(null)

  // Destructive Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<{ id: string; title: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    type: 'Course' as ResourceType,
    skill: 'React',
    difficulty: 'Beginner' as AdminResourceRecord['difficulty'],
    duration: '2 hours',
    studentsEnrolled: 150,
    status: 'active' as AdminResourceRecord['status'],
    url: 'https://',
    provider: 'SkillPath Academy',
  })

  const loadResources = async () => {
    try {
      const data = await resourceService.getResources()
      setResources(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadResources()
  }, [])

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.provider.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'all' || r.type === typeFilter
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [resources, searchTerm, typeFilter, statusFilter])

  const handleOpenAdd = () => {
    setEditingResource(null)
    setFormData({
      title: '',
      type: 'Course',
      skill: 'React',
      difficulty: 'Beginner',
      duration: '3 hours',
      studentsEnrolled: 120,
      status: 'active',
      url: 'https://',
      provider: 'SkillPath Academy',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (res: AdminResourceRecord) => {
    setEditingResource(res)
    setFormData({
      title: res.title,
      type: res.type,
      skill: res.skill,
      difficulty: res.difficulty,
      duration: res.duration,
      studentsEnrolled: res.studentsEnrolled,
      status: res.status,
      url: res.url,
      provider: res.provider,
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return

    if (editingResource) {
      await resourceService.updateResource(editingResource.id, formData)
    } else {
      await resourceService.createResource(formData)
    }

    setIsModalOpen(false)
    await loadResources()
  }

  const handlePromptDelete = (id: string, title: string) => {
    setResourceToDelete({ id, title })
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return
    setIsDeleting(true)
    try {
      await resourceService.deleteResource(resourceToDelete.id)
      await loadResources()
      setDeleteConfirmOpen(false)
      setResourceToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'Course':
        return <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" />
      case 'Video':
        return <Video className="w-3.5 h-3.5 text-blue-600" />
      case 'Article':
        return <FileText className="w-3.5 h-3.5 text-amber-600" />
      case 'Practice':
        return <Code2 className="w-3.5 h-3.5 text-purple-600" />
      case 'Project':
        return <FolderGit2 className="w-3.5 h-3.5 text-emerald-600" />
      case 'Quiz':
        return <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <PageHeader
          title="Learning Resources"
          subtitle="Manage courses, tutorials, lab projects, and exercises linked with skill milestones."
          breadcrumbs={[
            { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
            { label: 'Resources' },
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
        title="Learning Resources"
        subtitle="Manage courses, tutorials, lab projects, and exercises linked with skill milestones."
        breadcrumbs={[
          { label: 'Admin', href: ROUTES.ADMIN_DASHBOARD },
          { label: 'Resources' },
        ]}
        badge={
          <Badge variant="outline" className="bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-xs">
            {resources.length} Verified Assets
          </Badge>
        }
        actions={
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Resource
          </Button>
        }
      />

      {/* Filter Bar */}
      <Card className="p-4 bg-white border-[#E5E5DF]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E948F] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Search resources"
              placeholder="Search resource title, skill, or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
            />
          </div>

          <Select
            size="sm"
            aria-label="Filter by resource type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Resource Types' },
              { value: 'Course', label: 'Course' },
              { value: 'Video', label: 'Video' },
              { value: 'Article', label: 'Article' },
              { value: 'Practice', label: 'Practice' },
              { value: 'Project', label: 'Project' },
              { value: 'Quiz', label: 'Quiz' },
            ]}
          />

          <Select
            size="sm"
            aria-label="Filter by publication status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'draft', label: 'Draft' },
              { value: 'archived', label: 'Archived' },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white border-[#E5E5DF] overflow-hidden">
        {filteredResources.length === 0 ? (
          <EmptyState
            title="No resources found"
            description="No learning materials match your current filter parameters."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchTerm('')
              setTypeFilter('all')
              setStatusFilter('all')
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E5DF] bg-[#F8F7F3]/80 text-[#626763] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Curriculum Asset</th>
                  <th className="py-3 px-4">Modality</th>
                  <th className="py-3 px-4">Domain Skill</th>
                  <th className="py-3 px-4">Specs & Enrolled</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {filteredResources.map((res) => (
                  <tr key={res.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 p-1 rounded-md bg-[#F8F7F3] border border-[#E5E5DF]">
                          {getTypeIcon(res.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#171918]">{res.title}</p>
                          <p className="text-[11px] text-[#626763]">{res.provider}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" size="sm" className="bg-white border-[#E5E5DF] text-[#171918] text-[11px]">
                        {res.type}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#1F6B4F]">{res.skill}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[11px] text-[#626763]">
                        <p>{res.duration} • {res.difficulty}</p>
                        <p className="text-[10px] text-[#8E948F]">{res.studentsEnrolled} active learners</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={res.status === 'active' ? 'success' : 'outline'}
                        size="sm"
                      >
                        {res.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#1F6B4F] transition-colors"
                          title="Open Resource URL"
                          aria-label={`Open external URL for ${res.title}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(res)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                          title="Edit Resource"
                          aria-label={`Edit ${res.title}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePromptDelete(res.id, res.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Resource"
                          aria-label={`Delete ${res.title}`}
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

      {/* Add / Edit Resource Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        centeredTitle={true}
        title={editingResource ? 'Edit Learning Resource' : 'Add Curriculum Resource'}
        description={
          editingResource
            ? 'Update educational asset links, provider attribution, and milestone mappings.'
            : 'Catalog a verified instructional asset for SkillPath roadmap curricula'
        }
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          {/* Section 1: Resource Identification */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Resource Identification
              </h4>
            </div>
            <Input
              id="res-title"
              label="Resource Title"
              size="sm"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Modern CSS Grid & Flexbox Masterclass"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Resource Modality / Type"
                size="sm"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                options={[
                  { value: 'Course', label: 'Course' },
                  { value: 'Video', label: 'Video' },
                  { value: 'Article', label: 'Article' },
                  { value: 'Practice', label: 'Practice' },
                  { value: 'Project', label: 'Project' },
                  { value: 'Quiz', label: 'Quiz' },
                ]}
              />
              <Input
                id="res-skill"
                label="Mapped Skill Competency"
                size="sm"
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                placeholder="e.g. React"
                required
              />
            </div>
          </div>

          {/* Section 2: Curriculum Parameters */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <Sliders className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Curriculum Parameters
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
              <Input
                id="res-duration"
                label="Estimated Duration"
                size="sm"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 45 mins"
                required
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

          {/* Section 3: Link & Source Provider */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 pb-1 border-b border-[#E5E5DF]">
              <Globe className="w-3.5 h-3.5 text-[#1F6B4F]" />
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#626763]">
                Link & Source Provider
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                id="res-url"
                label="Resource URL"
                type="url"
                size="sm"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
                required
              />
              <Input
                id="res-provider"
                label="Author / Publishing Provider"
                size="sm"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g. MDN Web Docs"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5DF]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingResource ? 'Save Changes' : 'Publish Resource'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setResourceToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="danger"
        title="Delete Learning Resource?"
        description={`Are you sure you want to remove "${resourceToDelete?.title}"? Any student roadmap milestones pointing directly to this URL will be preserved but unlinked.`}
        confirmText="Delete Resource"
        cancelText="Cancel"
      />
    </div>
  )
}
