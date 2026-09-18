import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import {
  Menu,
  Bell,
  Search,
  LogOut,
  Settings,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface AdminHeaderProps {
  onMobileMenuToggle: () => void
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <header className="sticky top-0 z-20 w-full h-18 border-b border-[#E5E5DF] bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile menu toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] md:hidden cursor-pointer"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Admin Search Bar */}
        <div className="hidden sm:flex items-center relative w-64 lg:w-80">
          <Search className="w-4 h-4 text-[#8E948F] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students, skills, paths, assessments..."
            className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#171918] placeholder-[#8E948F] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right: Badge, Notifications, User Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Environment Badge */}
        <Badge
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE] font-semibold text-[11px]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B4F] mr-1.5 animate-pulse" />
          Admin Portal
        </Badge>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors cursor-pointer"
          aria-label="Notifications"
          onClick={() => alert('All platform systems nominal. No pending critical alerts.')}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1F6B4F] ring-2 ring-white" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#F8F7F3] transition-colors focus:outline-none cursor-pointer"
          >
            <Avatar
              name={user?.name || 'Admin'}
              size="sm"
              status="online"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#171918] truncate max-w-[130px]">
                {user?.name || 'Admin'}
              </span>
              <span className="text-[11px] text-[#1F6B4F] font-medium truncate max-w-[130px]">
                Platform Administrator
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8E948F] hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E5E5DF] shadow-md py-2 z-40 animate-fadeIn">
                <div className="px-4 py-2 border-b border-[#E5E5DF]">
                  <p className="text-xs font-semibold text-[#171918] truncate">{user?.name || 'Admin'}</p>
                  <p className="text-[11px] text-[#626763] truncate">{user?.email || 'admin@skillpath.demo'}</p>
                  <Badge variant="outline" size="sm" className="mt-1 bg-emerald-50 text-emerald-700 text-[10px]">
                    Role: Admin
                  </Badge>
                </div>

                <div className="py-1">
                  <Link
                    to={ROUTES.ADMIN_SETTINGS}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]"
                  >
                    <Settings className="w-4 h-4" />
                    Platform Settings
                  </Link>

                  <Link
                    to={ROUTES.DASHBOARD}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]"
                  >
                    <RotateCcw className="w-4 h-4 text-[#1F6B4F]" />
                    Switch to Student View
                  </Link>
                </div>

                <div className="border-t border-[#E5E5DF] pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
