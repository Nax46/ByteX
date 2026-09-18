import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5E5DF] bg-white text-[#626763] text-sm select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Mission Column (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to={ROUTES.HOME} className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] rounded-lg">
              <SkillPathLogo size="md" />
            </Link>
            <p className="text-xs sm:text-sm text-[#626763] leading-relaxed max-w-sm">
              Smart Education & Skill Development platform designed to bridge the gap between academic learning and industry readiness through diagnostic evaluation, personalized pathways, and verified progress.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#D8E8DE]/50 border border-[#C2D8C9] text-[#1F6B4F] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B4F] animate-pulse" />
              <span>Smart Education & Career Roadmap</span>
            </div>
          </div>

          {/* Learning Journey Column (Span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#171918]">
              Learning Journey
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to={ROUTES.ASSESSMENT}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Skill Assessments
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.SKILL_GAP}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Skill Gap Matrix
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.ROADMAP}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Learning Roadmaps
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.RESOURCES}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Curated Resources
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.PROJECTS}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Recommended Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Discovery Column (Span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#171918]">
              Platform & Careers
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to={ROUTES.FEATURES}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Platform Features
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.HOW_IT_WORKS}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  How SkillPath Works
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.CAREERS}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Career Exploration
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.CAREER_READINESS}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Career Readiness Index
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.PROGRESS}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Progress Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Access Column (Span 2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#171918]">
              Student Access
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.REGISTER}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.DASHBOARD}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.PROFILE}
                  className="text-[#626763] hover:text-[#1F6B4F] transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  Student Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E948F] gap-3">
          <p>© {new Date().getFullYear()} SkillPath. Smart Education & Skill Development.</p>
          <p className="font-medium text-[#626763]">Know where you are. Build where you're going.</p>
        </div>
      </div>
    </footer>
  )
}
