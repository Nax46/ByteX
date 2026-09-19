import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProjectRecommendation, RecommendedProject } from '@/types/project.types'
import {
  Rocket,
  Clock,
  ExternalLink,
  CheckCircle2,
  Play,
  Award,
  Sparkles,
  ArrowRight,
  Code2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface BuildThisNextCardProps {
  recommendation: ProjectRecommendation
  onUpdateStatus: (projectId: string, nextStatus: RecommendedProject['status']) => void
}

export const BuildThisNextCard: React.FC<BuildThisNextCardProps> = ({
  recommendation,
  onUpdateStatus,
}) => {
  const { project, relevanceScore, recommendationReason, primarySkillName, targetSkillGap } =
    recommendation
  const isStarted = project.status === 'IN_PROGRESS'
  const isSubmitted = project.status === 'SUBMITTED'

  return (
    <Card className="p-6 sm:p-7 border-[#1F6B4F]/40 bg-gradient-to-r from-white via-[#F4F9F6] to-white shadow-md relative overflow-hidden space-y-5 group">
      {/* Top Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1F6B4F] via-[#2D8A66] to-[#D8E8DE]" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E5E5DF] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="forest" size="sm" className="bg-[#1F6B4F] text-white font-bold">
              <Rocket className="w-3.5 h-3.5 inline mr-1" />
              YOUR NEXT RECOMMENDED BUILD
            </Badge>

            <Badge variant="forest" size="sm" className="bg-[#D8E8DE] text-[#1F6B4F] font-bold">
              <Sparkles className="w-3 h-3 inline mr-1" />
              {Math.round(relevanceScore)}% Relevance Match
            </Badge>

            <Badge
              variant={project.difficulty === 'ADVANCED' ? 'warning' : 'forest'}
              size="sm"
            >
              {project.difficulty}
            </Badge>

            {isStarted && <Badge variant="warning" size="sm">In Progress</Badge>}
            {isSubmitted && <Badge variant="forest" size="sm">Submitted</Badge>}
          </div>

          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#171918] tracking-tight group-hover:text-[#1F6B4F] transition-colors duration-200 pt-1">
            {project.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#626763] font-semibold bg-white px-3.5 py-1.5 rounded-lg border border-[#E5E5DF] shadow-xs shrink-0">
          <Clock className="w-4 h-4 text-[#1F6B4F]" />
          <span>Estimated Time: ~{project.estimatedHours} Hours</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left Column: Description & Why Recommendation */}
        <div className="md:col-span-7 space-y-3">
          <p className="text-xs sm:text-sm text-[#626763] leading-relaxed">
            {project.description}
          </p>

          {/* Factual Recommendation Reason Callout */}
          <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-[#1F6B4F] font-bold">
              <Award className="w-4 h-4" />
              <span>Addresses Skill Gap: {primarySkillName} {targetSkillGap > 0 ? `(-${targetSkillGap} pts)` : ''}</span>
            </div>
            <p className="text-xs text-[#626763]">
              <strong className="text-[#171918]">Why this project?</strong> {recommendationReason}
            </p>
          </div>
        </div>

        {/* Right Column: Technologies & Skills Reinforced */}
        <div className="md:col-span-5 bg-white p-4 rounded-xl border border-[#E5E5DF] space-y-3 text-xs">
          <div>
            <span className="block text-[11px] font-bold text-[#8E948F] uppercase tracking-wider mb-1.5">
              Technologies Used
            </span>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies?.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-[#F8F7F3] text-[#171918] font-medium border border-[#E5E5DF]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E5DF]">
            <span className="block text-[11px] font-bold text-[#8E948F] uppercase tracking-wider mb-1.5">
              Skills Strengthened
            </span>
            <div className="flex flex-wrap gap-1.5">
              {project.skillsReinforced?.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md bg-[#E5F3EB] text-[#1F6B4F] text-[11px] font-semibold border border-[#1F6B4F]/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Action Buttons */}
      <div className="pt-4 border-t border-[#E5E5DF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Link to={ROUTES.RESOURCES}>
            <Button variant="outline" size="sm" className="text-xs font-semibold" leftIcon={<Code2 className="w-3.5 h-3.5" />}>
              View Help Resources
            </Button>
          </Link>
          {project.githubStarterUrl && (
            <a
              href={project.githubStarterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline" size="sm" className="text-xs font-semibold" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                GitHub Starter Template
              </Button>
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isSubmitted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus(project.id, isStarted ? 'SUBMITTED' : 'IN_PROGRESS')}
              className="text-xs font-semibold"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#1F6B4F]" />}
            >
              {isStarted ? 'Mark Completed' : 'Start Working'}
            </Button>
          ) : (
            <span className="text-xs font-bold text-[#1F6B4F] flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Completed
            </span>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => onUpdateStatus(project.id, isStarted ? 'SUBMITTED' : 'IN_PROGRESS')}
            className="text-xs font-bold shadow-xs"
            rightIcon={isStarted ? <ArrowRight className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          >
            {isStarted ? 'Submit Project' : 'Start Project'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
