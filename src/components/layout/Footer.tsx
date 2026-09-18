import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E5E5DF] bg-white text-[#626763] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <SkillPathLogo size="md" />
            <p className="text-xs sm:text-sm text-[#626763] max-w-sm leading-relaxed pt-1">
              Understand your skills, discover your gaps, and follow a learning path designed around your goals. Built for modern students and aspiring developers.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#171918]">Platform</h4>
            <ul className="space-y-2 text-xs text-[#626763]">
              <li>
                <Link to={ROUTES.HOW_IT_WORKS} className="hover:text-[#1F6B4F] transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to={ROUTES.ASSESSMENT} className="hover:text-[#1F6B4F] transition-colors">Skill Assessments</Link>
              </li>
              <li>
                <Link to={ROUTES.ROADMAP} className="hover:text-[#1F6B4F] transition-colors">Personalized Roadmaps</Link>
              </li>
              <li>
                <Link to={ROUTES.CAREERS} className="hover:text-[#1F6B4F] transition-colors">Career Paths</Link>
              </li>
              <li>
                <Link to={ROUTES.RESOURCES} className="hover:text-[#1F6B4F] transition-colors">Learning Resources</Link>
              </li>
            </ul>
          </div>

          {/* Student Access */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#171918]">Account</h4>
            <ul className="space-y-2 text-xs text-[#626763]">
              <li>
                <Link to={ROUTES.LOGIN} className="hover:text-[#1F6B4F] transition-colors">Student Log in</Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER} className="hover:text-[#1F6B4F] transition-colors">Get Started</Link>
              </li>
              <li>
                <Link to={ROUTES.DASHBOARD} className="hover:text-[#1F6B4F] transition-colors">Student Dashboard</Link>
              </li>
              <li>
                <Link to={ROUTES.SKILL_GAP} className="hover:text-[#1F6B4F] transition-colors">Skill Gap Matrix</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E5E5DF] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8E948F] gap-4">
          <p>© {new Date().getFullYear()} SkillPath. Smart Education & Skill Development.</p>
          <p>Know where you are. Build where you're going.</p>
        </div>
      </div>
    </footer>
  )
}
