import React from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { MOCK_DASHBOARD_DATA } from '@/mocks/dashboard.mock'
import { ROUTES } from '@/constants/routes'
import { Clock, ArrowRight, FolderGit2 } from 'lucide-react'

export const ProjectsPage: React.FC = () => {
  const projects = MOCK_DASHBOARD_DATA.recommendedProjects

  return (
    <div className="space-y-7 max-w-5xl mx-auto animate-fadeIn py-2">
      <PageHeader
        title="Hands-on Practice Projects"
        subtitle="Apply what you learn by building real-world web components and frontend applications."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Projects' },
        ]}
      />

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
                  {proj.status === 'IN_PROGRESS' && (
                    <Badge variant="warning" size="sm">In Progress</Badge>
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
                  {proj.status === 'IN_PROGRESS' ? 'Resume Project' : 'Start Project'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
