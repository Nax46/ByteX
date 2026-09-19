import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Target, ArrowRight, Compass, Sparkles } from 'lucide-react'

interface CareerContextBannerProps {
  careerGoal: string
  totalResourcesCount: number
  recommendedCount: number
  activeGapsCount: number
}

export const CareerContextBanner: React.FC<CareerContextBannerProps> = ({
  careerGoal,
  totalResourcesCount,
  recommendedCount,
  activeGapsCount,
}) => {
  return (
    <Card className="p-6 sm:p-8 bg-gradient-to-r from-[#1F6B4F] via-[#16523C] to-[#0F3A2B] text-white border-0 shadow-md relative overflow-hidden">
      {/* Background Accent Graphics */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-[#D8E8DE]/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="forest" size="sm" className="bg-[#D8E8DE] text-[#1F6B4F] font-bold">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Career-Aware Intelligence
            </Badge>
            <span className="text-xs text-white/80 font-medium flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Active Pathway
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Personalized Learning Resources
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              For your <span className="text-[#D8E8DE] underline decoration-white/30 underline-offset-4">{careerGoal}</span> Journey
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
            Resources are selected around your verified skill gaps, high-priority career bottlenecks, and structured roadmap modules.
          </p>

          <div className="pt-1 flex items-center gap-4 text-xs text-white/80 flex-wrap">
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{recommendedCount}</strong> Recommended
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{activeGapsCount}</strong> Active Skill Gaps
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-md font-medium">
              <strong className="text-white">{totalResourcesCount}</strong> Verified Catalog Items
            </span>
          </div>
        </div>

        {/* Action Button Link to Skill Gap & Roadmap */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
          <Link to={ROUTES.SKILL_GAP} className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-semibold"
              leftIcon={<Target className="w-3.5 h-3.5" />}
            >
              View Skill Gaps
            </Button>
          </Link>

          <Link to={ROUTES.ROADMAP} className="w-full">
            <Button
              variant="primary"
              size="sm"
              className="w-full bg-[#D8E8DE] text-[#1F6B4F] hover:bg-white text-xs font-bold shadow-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Back to Roadmap
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
