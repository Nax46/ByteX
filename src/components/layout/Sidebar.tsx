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
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation()

  const mainNavItems: NavItem[] = [
    { label: 'Overview', to: ROUTES.DASHBOARD, icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { label: 'My Skills', to: ROUTES.SKILLS, icon: <BrainCircuit className="w-4 h-4 shrink-0" /> },
    { label: 'Assessment', to: ROUTES.ASSESSMENT, icon: <ClipboardCheck className="w-4 h-4 shrink-0" /> },
    { label: 'Learning Path', to: ROUTES.ROADMAP, icon: <Map className="w-4 h-4 shrink-0" /> },
    { label: 'Resources', to: ROUTES.RESOURCES, icon: <BookOpen className="w-4 h-4 shrink-0" /> },
    { label: 'Careers', to: ROUTES.CAREERS, icon: <Briefcase className="w-4 h-4 shrink-0" /> },
    { label: 'Progress', to: ROUTES.PROGRESS, icon: <TrendingUp className="w-4 h-4 shrink-0" /> },
    { label: 'Profile', to: ROUTES.PROFILE, icon: <User className="w-4 h-4 shrink-0" /> },
  ]

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-[#E5E5DF] bg-white transition-all duration-200 z-30 select-none h-screen sticky top-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-18 border-b border-[#E5E5DF] flex items-center justify-between px-5">
        <NavLink to={ROUTES.DASHBOARD} className="flex items-center">
          <SkillPathLogo showText={!isCollapsed} size="sm" />
        </NavLink>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        {mainNavItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== ROUTES.DASHBOARD && location.pathname.startsWith(item.to + '/'))

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-[#D8E8DE]/70 text-[#1F6B4F] font-semibold shadow-2xs'
                  : 'text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#1F6B4F] rounded-r-full" />
              )}
              <span
                className={cn(
                  'transition-all duration-200 group-hover:scale-110',
                  isActive ? 'text-[#1F6B4F]' : 'group-hover:text-[#171918]'
                )}
              >
                {item.icon}
              </span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </div>

      {/* Expand Button when collapsed */}
      {isCollapsed && (
        <div className="p-3 border-t border-[#E5E5DF] flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="border-t border-[#E5E5DF] p-3 space-y-1">
        <NavLink
          to={ROUTES.SETTINGS}
          title={isCollapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            location.pathname === ROUTES.SETTINGS
              ? 'bg-[#D8E8DE]/70 text-[#1F6B4F] font-semibold'
              : 'text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Settings</span>}
        </NavLink>

        <button
          onClick={() => alert('SkillPath Support: Reach our team at support@skillpath.edu')}
          title={isCollapsed ? 'Help' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors text-left"
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Help & FAQs</span>}
        </button>
      </div>
    </aside>
  )
}
