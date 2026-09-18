import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  BrainCircuit,
  ClipboardCheck,
  Map,
  BookOpen,
  Briefcase,
  TrendingUp,
  User,
  Settings,
  X,
} from 'lucide-react'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const location = useLocation()

  const navItems = [
    { label: 'Overview', to: ROUTES.DASHBOARD, icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'My Skills', to: ROUTES.SKILLS, icon: <BrainCircuit className="w-5 h-5" /> },
    { label: 'Assessment', to: ROUTES.ASSESSMENT, icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: 'Learning Path', to: ROUTES.ROADMAP, icon: <Map className="w-5 h-5" /> },
    { label: 'Resources', to: ROUTES.RESOURCES, icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Careers', to: ROUTES.CAREERS, icon: <Briefcase className="w-5 h-5" /> },
    { label: 'Progress', to: ROUTES.PROGRESS, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Profile', to: ROUTES.PROFILE, icon: <User className="w-5 h-5" /> },
    { label: 'Settings', to: ROUTES.SETTINGS, icon: <Settings className="w-5 h-5" /> },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#171918]/30 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white border-r border-[#E5E5DF] p-5 flex flex-col justify-between shadow-xl z-10 animate-slideRight">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#E5E5DF]">
            <SkillPathLogo size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="mt-4 space-y-1 overflow-y-auto max-h-[70vh]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#D8E8DE]/70 text-[#1F6B4F] font-semibold'
                      : 'text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#E5E5DF] text-[11px] text-[#8E948F] text-center">
          SkillPath • Smart Education & Skill Development
        </div>
      </div>
    </div>
  )
}
