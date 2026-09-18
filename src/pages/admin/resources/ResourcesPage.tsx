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
import { resourceService } from '@/services/resourceService'
import { AdminResourceRecord, ResourceType } from '@/data/admin/demo.admin.resources'
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
} from 'lucide-react'

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<AdminResourceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<AdminResourceRecord | null>(null)
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

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete resource "${title}"?`)) {
      await resourceService.deleteResource(id)
      await loadResources()
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
    return <LoadingState message="Loading learning resources..." minHeight="min-h-[400px]" />
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Learning Resources"
        subtitle="Manage courses, tutorials, lab projects, and exercises linked with skill milestones."
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E948F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resource title, skill, or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] focus:bg-white focus:outline-none focus:border-[#1F6B4F] transition-colors text-[#171918]"
            />
          </div>

          <Select
            label=""
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
            label=""
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
            description="No learning resources match your current filter parameters."
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
                <tr className="border-b border-[#E5E5DF] bg-[#F8F7F3]/70 text-[#626763] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Title & Provider</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4">Skill Mapped</th>
                  <th className="py-3 px-4 text-center">Difficulty</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4 text-center">Enrolled</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DF]">
                {filteredResources.map((res) => (
                  <tr key={res.id} className="hover:bg-[#F8F7F3]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-[#171918] hover:text-[#1F6B4F] inline-flex items-center gap-1 transition-colors"
                        >
                          <span>{res.title}</span>
                          <ExternalLink className="w-3 h-3 text-[#8E948F]" />
                        </a>
                        <p className="text-[11px] text-[#626763]">{res.provider}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8F7F3] border border-[#E5E5DF] text-[11px] font-medium text-[#171918]">
                        {getTypeIcon(res.type)}
                        <span>{res.type}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="outline" size="sm" className="bg-[#F8F7F3] text-[#171918] font-medium">
                        {res.skill}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          res.difficulty === 'Beginner'
                            ? 'success'
                            : res.difficulty === 'Intermediate'
                            ? 'forest'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {res.difficulty}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-center text-[#626763] font-medium">
                      {res.duration}
                    </td>

                    <td className="py-3.5 px-4 text-center font-semibold text-[#171918]">
                      {res.studentsEnrolled}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={res.status === 'active' ? 'success' : res.status === 'draft' ? 'outline' : 'warning'}
                        size="sm"
                      >
                        {res.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(res)}
                          className="p-1.5 rounded-md hover:bg-[#F8F7F3] text-[#626763] hover:text-[#171918] transition-colors cursor-pointer"
                          title="Edit Resource"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(res.id, res.title)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-[#626763] hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Resource"
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
        title={editingResource ? 'Edit Resource' : 'Add Curriculum Resource'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <Input
            id="res-title"
            label="Resource Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Modern CSS Grid & Flexbox"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Resource Modality / Type"
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
              label="Mapped Skill"
              value={formData.skill}
              onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
              placeholder="e.g. React"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
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

            <Input
              id="res-duration"
              label="Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g. 45 mins"
              required
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
              id="res-url"
              label="Resource URL"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              required
            />

            <Input
              id="res-provider"
              label="Author / Provider"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              placeholder="e.g. MDN Web Docs"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E5E5DF]">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingResource ? 'Save Changes' : 'Publish Resource'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
