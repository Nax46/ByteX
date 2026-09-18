import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { LoadingState } from '@/components/common/LoadingState'
import { resourcesApi } from '@/api/endpoints/resources.api'
import { LearningResource } from '@/types/resource.types'
import { ROUTES } from '@/constants/routes'
import { Search, ExternalLink, Clock, BookOpen } from 'lucide-react'

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<LearningResource[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedSkill, setSelectedSkill] = useState<string>('ALL')

  useEffect(() => {
    let isMounted = true
    const loadResources = async () => {
      setIsLoading(true)
      try {
        const data = await resourcesApi.getResources()
        if (isMounted) {
          setResources(data || [])
        }
      } catch (err) {
        console.error('Failed to load learning resources:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadResources()
    return () => {
      isMounted = false
    }
  }, [])

  const handleToggleCompleted = async (res: LearningResource) => {
    const nextCompleted = !res.isCompleted
    try {
      await resourcesApi.markCompleted(res.id, nextCompleted)
      setResources((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, isCompleted: nextCompleted } : r))
      )
    } catch (err) {
      console.error('Failed to update resource completion:', err)
    }
  }

  if (isLoading) {
    return <LoadingState message="Curating high-quality learning resources..." minHeight="min-h-[350px]" />
  }

  const resourceTypes = [
    'ALL',
    ...Array.from(new Set(resources.map((r) => r.type).filter(Boolean))),
  ]
  const skillsList = [
    'ALL',
    ...Array.from(new Set(resources.map((r) => r.skillTag).filter(Boolean))),
  ]

  const filteredResources = resources.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skillTag?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'ALL' || item.type === selectedType
    const matchesSkill = selectedSkill === 'ALL' || item.skillTag === selectedSkill

    return matchesSearch && matchesType && matchesSkill
  })

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Learning Resources"
        subtitle="Handpicked courses, official documentation, practice exercises, and starter guides."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Resources' },
        ]}
      />

      {/* Search & Filters */}
      <Card className="p-5 border-[#E5E5DF] bg-white space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E948F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, courses, articles..."
            className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg pl-10 pr-4 py-2 text-sm text-[#171918] placeholder-[#8E948F] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
          {resourceTypes.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="font-semibold text-[#626763] shrink-0">Type:</span>
              {resourceTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 rounded-md transition-all duration-200 shrink-0 font-medium cursor-pointer ${
                    selectedType === type
                      ? 'bg-[#1F6B4F] text-white shadow-2xs scale-[1.02]'
                      : 'bg-[#F8F7F3] text-[#626763] hover:text-[#171918] border border-[#E5E5DF] hover:border-[#D0D0C8]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {skillsList.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="font-semibold text-[#626763] shrink-0">Skill:</span>
              {skillsList.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-2.5 py-1 rounded-md transition-all duration-200 shrink-0 font-medium cursor-pointer ${
                    selectedSkill === skill
                      ? 'bg-[#1F6B4F] text-white shadow-2xs scale-[1.02]'
                      : 'bg-[#F8F7F3] text-[#626763] hover:text-[#171918] border border-[#E5E5DF] hover:border-[#D0D0C8]'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Resource Cards Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredResources.map((res, index) => {
            const staggerClass =
              index % 4 === 0 ? 'stagger-1' : index % 4 === 1 ? 'stagger-2' : index % 4 === 2 ? 'stagger-3' : 'stagger-4'

            return (
              <Card
                key={res.id}
                className={`p-5 sm:p-6 border-[#E5E5DF] bg-white flex flex-col justify-between space-y-4 hover-lift animate-slideUp ${staggerClass} group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="forest" size="sm">{res.skillTag || 'Curriculum'}</Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#626763]">{res.type}</span>
                      <span className="text-[11px] text-[#8E948F]">•</span>
                      <span className="text-[11px] text-[#8E948F]">{res.provider}</span>
                    </div>
                  </div>

                  <h3 className="font-heading text-base font-bold text-[#171918] leading-snug group-hover:text-[#1F6B4F] transition-colors duration-200">
                    {res.title}
                  </h3>

                  <p className="text-xs text-[#626763] leading-relaxed line-clamp-2">
                    {res.description}
                  </p>

                  <div className="pt-1">
                    <ProgressBar
                      value={res.isCompleted ? 100 : 0}
                      size="sm"
                      variant="forest"
                      label={res.isCompleted ? 'Completed' : 'Not started'}
                      showPercentage={res.isCompleted}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E5DF] flex items-center justify-between text-xs">
                  <span className="text-[#626763] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1F6B4F]" />
                    {res.estimatedDuration || 'Self-paced'}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleCompleted(res)}
                      className="text-xs"
                    >
                      {res.isCompleted ? 'Mark Incomplete' : 'Mark Done'}
                    </Button>
                    <a
                      href={res.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="primary"
                        size="sm"
                        rightIcon={<ExternalLink className="w-3.5 h-3.5 group-hover-arrow" />}
                      >
                        Open
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-8 text-center space-y-4 bg-white border-[#E5E5DF]">
          <BookOpen className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No resources match your filters</h3>
          <p className="text-xs text-[#626763] max-w-md mx-auto">
            Try resetting your search query or selecting a different skill filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setSelectedType('ALL')
              setSelectedSkill('ALL')
            }}
          >
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  )
}
