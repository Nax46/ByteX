import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'
import {
  X,
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
  ShieldCheck,
} from 'lucide-react'

interface AdminMobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  if (!isOpen) return null

  const adminNavItems = [
    { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD, icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { label: 'Students', to: ROUTES.ADMIN_STUDENTS, icon: <Users className="w-5 h-5 shrink-0" /> },
    { label: 'Assessments', to: ROUTES.ADMIN_ASSESSMENTS, icon: <ClipboardCheck className="w-5 h-5 shrink-0" /> },
    { label: 'Skills', to: ROUTES.ADMIN_SKILLS, icon: <BrainCircuit className="w-5 h-5 shrink-0" /> },
    { label: 'Learning Resources', to: ROUTES.ADMIN_RESOURCES, icon: <BookOpen className="w-5 h-5 shrink-0" /> },
    { label: 'Learning Paths', to: ROUTES.ADMIN_LEARNING_PATHS, icon: <Map className="w-5 h-5 shrink-0" /> },
    { label: 'Careers', to: ROUTES.ADMIN_CAREERS, icon: <Briefcase className="w-5 h-5 shrink-0" /> },
    { label: 'Analytics', to: ROUTES.ADMIN_ANALYTICS, icon: <BarChart3 className="w-5 h-5 shrink-0" /> },
    { label: 'Settings', to: ROUTES.ADMIN_SETTINGS, icon: <Settings className="w-5 h-5 shrink-0" /> },
  ]

  const handleLogout = () => {
    logout()
    onClose()
    navigate(ROUTES.LOGIN)
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white border-r border-[#E5E5DF] shadow-xl flex flex-col z-50 animate-slideRight">
        {/* Header */}
        <div className="h-18 border-b border-[#E5E5DF] flex items-center justify-between px-5">
          <NavLink
            to={ROUTES.ADMIN_DASHBOARD}
            onClick={() => {
              onClose()
              const container = document.getElementById('admin-main-container')
              if (container) {
                container.scrollTo({ top: 0, behavior: 'smooth' })
              }
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] rounded-lg"
            title="Admin Dashboard"
          >
            <SkillPathLogo size="sm" />
            <Badge variant="outline" size="sm" className="bg-[#D8E8DE]/60 text-[#1F6B4F] text-[10px]">
              Admin
            </Badge>
          </NavLink>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {adminNavItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== ROUTES.ADMIN_DASHBOARD && location.pathname.startsWith(item.to + '/'))

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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E5DF] bg-[#F8F7F3]/40 space-y-2">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="w-4 h-4 text-[#1F6B4F]" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#171918] truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-[#626763] truncate">{user?.email || 'admin@skillpath.demo'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
