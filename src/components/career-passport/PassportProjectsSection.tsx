import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'
import { FolderGit2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { RecommendedProject } from '@/types/project.types'

interface PassportProjectsSectionProps {
  projects: RecommendedProject[]
}

export const PassportProjectsSection: React.FC<PassportProjectsSectionProps> = ({
  projects,
}) => {
  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DF]/70">
        <div>
          <h2 className="font-heading text-base sm:text-lg font-bold text-[#171918] flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#1F6B4F]" />
            Featured Engineering Projects
          </h2>
          <p className="text-xs text-[#626763] mt-0.5">
            Production-grade application builds demonstrating architectural capabilities
          </p>
        </div>
        <Link to={ROUTES.PROJECTS} className="print:hidden">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            View All Projects
          </Button>
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-3 flex flex-col justify-between hover:border-[#C2D8C9] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-sm font-bold text-[#171918]">{proj.title}</h3>
                  <Badge
                    variant={
                      proj.status === 'SUBMITTED'
                        ? 'forest'
                        : proj.status === 'IN_PROGRESS'
                        ? 'warning'
                        : 'outline'
                    }
                    size="sm"
                  >
                    {proj.status === 'SUBMITTED' ? '✓ Verified Build' : proj.status || 'AVAILABLE'}
                  </Badge>
                </div>

                <p className="text-xs text-[#626763] leading-relaxed line-clamp-2">
                  {proj.description}
                </p>

                {proj.skillsReinforced && proj.skillsReinforced.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {proj.skillsReinforced.map((skill: string) => (
                      <span
                        key={skill}
                        className="text-[11px] px-2 py-0.5 rounded bg-[#D8E8DE]/70 text-[#1F6B4F] font-medium border border-[#C2D8C9]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E5E5DF]/60 flex items-center justify-between text-xs text-[#626763]">
                <span className="flex items-center gap-1 text-[#1F6B4F] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Portfolio Verified
                </span>
                <Link to={ROUTES.PROJECTS} className="text-[#1F6B4F] font-semibold hover:underline print:hidden">
                  Project Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-[#626763] space-y-3">
          <p>No project builds recorded yet. Select a recommended project to build your portfolio.</p>
          <Link to={ROUTES.PROJECTS} className="print:hidden">
            <Button variant="outline" size="sm">
              Explore Projects Catalog
            </Button>
          </Link>
        </div>
      )}
    </Card>
  )
}

export default PassportProjectsSection
