import React, { useState, useEffect, useCallback } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { projectsApi } from '@/api/endpoints/projects.api'
import { RecommendedProject } from '@/types/project.types'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { Clock, ArrowRight, FolderGit2, Code, AlertCircle, ExternalLink, Check } from 'lucide-react'

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth()
  const targetCareer = user?.careerGoal || 'target career'
  const [projects, setProjects] = useState<RecommendedProject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data = await projectsApi.getRecommendedProjects()
      setProjects(data || [])
    } catch (err: unknown) {
      console.error('Failed to load recommended projects:', err)
      const message =
        err instanceof Error ? err.message : 'Failed to load recommended practical projects from server.'
      setErrorMsg(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleToggleProjectStatus = async (proj: RecommendedProject) => {
    const nextStatus = proj.status === 'IN_PROGRESS' ? 'SUBMITTED' : 'IN_PROGRESS'
    try {
      await projectsApi.updateProjectStatus(proj.id, nextStatus)
      setProjects((prev) =>
        prev.map((p) => (p.id === proj.id ? { ...p, status: nextStatus } : p))
      )
    } catch (err) {
      console.error('Failed to update project status:', err)
    }
  }

  if (isLoading) {
    return <LoadingState message="Fetching practical engineering projects..." minHeight="min-h-[350px]" />
  }

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Hands-on Practice Projects"
        subtitle={`Apply what you learn by building real-world applications for your ${targetCareer} path.`}
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Projects' },
        ]}
      />

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-xs font-semibold text-[#9B1C1C] flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#C81E1E] shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadProjects} className="text-xs h-7">
            Retry
          </Button>
        </div>
      )}

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((proj) => (
            <Card key={proj.id} hoverEffect className="p-6 bg-white border-[#E5E5DF]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="w-8 h-8 rounded-lg bg-[#D8E8DE]/60 text-[#1F6B4F] flex items-center justify-center shrink-0">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-[#171918]">{proj.title}</h3>
                    <Badge
                      variant={proj.difficulty === 'ADVANCED' ? 'warning' : 'forest'}
                      size="sm"
                    >
                      {proj.difficulty}
                    </Badge>
                    {proj.primarySkillName && (
                      <Badge variant="outline" size="sm" className="text-[10px]">
                        {proj.primarySkillName}
                      </Badge>
                    )}
                    {proj.relevanceScore != null && (
                      <Badge variant="outline" size="sm" className="text-[10px] text-[#1F6B4F] border-[#1F6B4F]/30 bg-[#1F6B4F]/5 font-mono">
                        {Math.round(proj.relevanceScore)}% Match
                      </Badge>
                    )}
                    {proj.status === 'IN_PROGRESS' && (
                      <Badge variant="warning" size="sm">In Progress</Badge>
                    )}
                    {proj.status === 'SUBMITTED' && (
                      <Badge variant="forest" size="sm">Completed</Badge>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#626763] leading-relaxed max-w-2xl">
                    {proj.description}
                  </p>

                  {proj.recommendationReason && (
                    <p className="text-[11px] text-[#1F6B4F] font-medium italic">
                      {proj.recommendationReason}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-[#626763] font-medium">Reinforces:</span>
                    {proj.skillsReinforced?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#F8F7F3] text-[#171918] border border-[#E5E5DF]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E5E5DF]">
                  <span className="text-xs text-[#626763] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    ~{proj.estimatedHours} Hours
                  </span>
                  <div className="flex items-center gap-2">
                    {proj.githubStarterUrl && (
                      <a
                        href={proj.githubStarterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-visible:outline-none"
                      >
                        <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Starter
                        </Button>
                      </a>
                    )}
                    <Button
                      variant={proj.status === 'SUBMITTED' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleProjectStatus(proj)}
                      rightIcon={proj.status === 'SUBMITTED' ? <Check className="w-3.5 h-3.5 text-[#1F6B4F]" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      className={proj.status === 'SUBMITTED' ? 'text-xs text-[#1F6B4F] border-[#1F6B4F]/30 bg-[#1F6B4F]/5' : 'text-xs'}
                    >
                      {proj.status === 'SUBMITTED'
                        ? 'Completed'
                        : proj.status === 'IN_PROGRESS'
                        ? 'Submit Project'
                        : 'Start Project'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center space-y-4 bg-white border-[#E5E5DF]">
          <Code className="w-12 h-12 text-[#1F6B4F] mx-auto opacity-75" />
          <h3 className="font-heading text-lg font-bold text-[#171918]">No recommended projects yet</h3>
          <p className="text-xs text-[#626763] max-w-md mx-auto">
            Once you advance in your roadmap milestones, targeted hands-on projects reinforcing those skills will appear here.
          </p>
          <Button variant="outline" size="sm" onClick={loadProjects}>
            Refresh Recommendations
          </Button>
        </Card>
      )}
    </div>
  )
}
