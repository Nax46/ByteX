import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/common/LoadingState'
import { skillsApi, ISkillGapPriorityReadout } from '@/api/endpoints/skills.api'
import { ROUTES } from '@/constants/routes'
import { Clock, ArrowRight, FolderGit2 } from 'lucide-react'

export const ProjectsPage: React.FC = () => {
  const [readout, setReadout] = useState<ISkillGapPriorityReadout | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    skillsApi.getSkillGapPriority()
      .then((data) => setReadout(data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading practice projects..." minHeight="min-h-[350px]" />
  }

  const snapshots = readout?.snapshots || []
  const targetCareer = readout?.targetCareerTitle || 'Full Stack Web Developer'

  // Derive practice projects dynamically from active skill gaps
  const projects = snapshots.map((s, idx) => ({
    id: `proj-${s.skillId}`,
    title: `${s.skillName} Real-World Implementation Project`,
    description: `Hands-on practical application project building real components for ${s.skillName}. Target level: ${s.targetLevel}%.`,
    difficulty: s.gap > 30 ? 'ADVANCED' : 'INTERMEDIATE',
    status: s.gap === 0 ? 'COMPLETED' : idx === 0 ? 'IN_PROGRESS' : 'UPCOMING',
    skillsReinforced: [s.skillName, s.category],
    estimatedHours: Math.max(4, Math.round(s.gap / 5)),
  }))

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

      <div className="space-y-4">
        {projects.length === 0 ? (
          <Card className="p-8 text-center text-xs text-[#626763]">
            No projects available yet. Complete your skill assessment to generate tailored project recommendations.
          </Card>
        ) : (
          projects.map((proj) => (
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
                    {proj.status === 'IN_PROGRESS' && (
                      <Badge variant="warning" size="sm">In Progress</Badge>
                    )}
                    {proj.status === 'COMPLETED' && (
                      <Badge variant="forest" size="sm">Completed</Badge>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#626763] leading-relaxed max-w-2xl">
                    {proj.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-[#626763] font-medium">Reinforces:</span>
                    {proj.skillsReinforced.map((skill, idx) => (
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
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {proj.status === 'IN_PROGRESS' ? 'Resume Project' : proj.status === 'COMPLETED' ? 'Review Project' : 'Start Project'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
