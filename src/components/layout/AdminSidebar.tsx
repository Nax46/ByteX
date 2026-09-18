import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BrainCircuit,
  BookOpen,
  Map,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

interface AdminSidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const adminNavItems: NavItem[] = [
    { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD, icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { label: 'Students', to: ROUTES.ADMIN_STUDENTS, icon: <Users className="w-4 h-4 shrink-0" /> },
    { label: 'Assessments', to: ROUTES.ADMIN_ASSESSMENTS, icon: <ClipboardCheck className="w-4 h-4 shrink-0" /> },
    { label: 'Skills', to: ROUTES.ADMIN_SKILLS, icon: <BrainCircuit className="w-4 h-4 shrink-0" /> },
    { label: 'Learning Resources', to: ROUTES.ADMIN_RESOURCES, icon: <BookOpen className="w-4 h-4 shrink-0" /> },
    { label: 'Learning Paths', to: ROUTES.ADMIN_LEARNING_PATHS, icon: <Map className="w-4 h-4 shrink-0" /> },
    { label: 'Careers', to: ROUTES.ADMIN_CAREERS, icon: <Briefcase className="w-4 h-4 shrink-0" /> },
    { label: 'Analytics', to: ROUTES.ADMIN_ANALYTICS, icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
    { label: 'Settings', to: ROUTES.ADMIN_SETTINGS, icon: <Settings className="w-4 h-4 shrink-0" /> },
  ]

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const handleLogoClick = () => {
    const container = document.getElementById('admin-main-container')
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-[#E5E5DF] bg-white transition-all duration-200 z-30 select-none h-screen shrink-0 sticky top-0',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-18 border-b border-[#E5E5DF] flex items-center justify-between px-5">
        <NavLink
          to={ROUTES.ADMIN_DASHBOARD}
          onClick={handleLogoClick}
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] rounded-lg"
          title="Admin Dashboard"
        >
          <SkillPathLogo showText={!isCollapsed} size="sm" />
          {!isCollapsed && (
            <Badge variant="outline" size="sm" className="bg-[#D8E8DE]/60 text-[#1F6B4F] text-[10px] font-semibold py-0.5">
              Admin
            </Badge>
          )}
        </NavLink>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors cursor-pointer"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        {adminNavItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== ROUTES.ADMIN_DASHBOARD && location.pathname.startsWith(item.to + '/'))

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsed ? item.label : undefined}
              aria-label={item.label}
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
            className="p-2 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom: Admin Profile & Logout */}
      <div className="border-t border-[#E5E5DF] p-3 space-y-1 bg-[#F8F7F3]/40">
        {!isCollapsed && (
          <div className="px-3 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1F6B4F] text-white flex items-center justify-center font-bold text-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#171918] truncate">
                {user?.name || 'SkillPath Admin'}
              </p>
              <p className="text-[10px] text-[#626763] truncate">
                {user?.email || 'admin@skillpath.demo'}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          aria-label="Log out of admin session"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0 text-red-600" />
          {!isCollapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
