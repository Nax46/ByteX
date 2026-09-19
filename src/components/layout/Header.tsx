import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
  BookOpen,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { notificationsApi } from '@/api/endpoints/notifications.api'

interface HeaderProps {
  onMobileMenuToggle: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    const loadUnreadCount = async () => {
      try {
        const summary = await notificationsApi.getSummary()
        if (isMounted) setUnreadCount(summary.unreadCount)
      } catch (e) {
        console.warn('Failed to load unread count:', e)
      }
    }
    loadUnreadCount()
    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <header className="sticky top-0 z-20 w-full h-18 border-b border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_3px_0_rgba(23,25,24,0.03),inset_0_-1px_0_0_rgba(229,229,223,0.6),inset_0_1px_0_0_rgba(255,255,255,0.9)] px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile menu button & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] md:hidden"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="hidden sm:flex items-center relative w-64 lg:w-80">
          <Search className="w-4 h-4 text-[#8E948F] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search skills, courses, projects..."
            className="w-full bg-[#F8F7F3] border border-[#E5E5DF] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#171918] placeholder-[#8E948F] focus:outline-none focus:border-[#1F6B4F] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Right: Notifications & User profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell with Dynamic Unread Badge */}
        <Link
          to={ROUTES.NOTIFICATIONS}
          className="relative p-2 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#1F6B4F] ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#F8F7F3] transition-colors focus:outline-none cursor-pointer"
          >
            <Avatar
              name={typeof user?.name === 'string' ? user.name : typeof user?.fullName === 'string' ? user.fullName : 'Student'}
              size="sm"
              status="online"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#171918] truncate max-w-[130px]">
                {typeof user?.name === 'string' ? user.name : typeof user?.fullName === 'string' ? user.fullName : 'Student'}
              </span>
              <span className="text-[11px] text-[#626763] truncate max-w-[130px]">
                {typeof user?.education === 'object' && user.education?.degree ? user.education.degree : typeof user?.education === 'string' ? user.education : user?.careerGoal || 'Learner'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8E948F] hidden sm:block" />
          </button>

          {/* Profile Dropdown Popup */}
          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E5E5DF] shadow-md py-2 z-40 animate-fadeIn">
                <div className="px-4 py-2 border-b border-[#E5E5DF]">
                  <p className="text-xs font-semibold text-[#171918] truncate">{user?.name || 'Student'}</p>
                  {user?.email && (
                    <p className="text-[11px] text-[#626763] truncate">{user.email}</p>
                  )}
                  {user?.careerGoal && (
                    <Badge variant="forest" size="sm" className="mt-1.5">
                      Goal: {user.careerGoal}
                    </Badge>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    to={ROUTES.PROFILE}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#1F6B4F]" />
                    My Profile
                  </Link>
                  <Link
                    to={ROUTES.ROADMAP}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#1F6B4F]" />
                    My Learning Path
                  </Link>
                  <Link
                    to={ROUTES.SETTINGS}
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#626763]" />
                    Settings
                  </Link>
                </div>

                <div className="pt-1 border-t border-[#E5E5DF]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#D9534F] hover:bg-[#FCE8E6]/40 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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

export default Header
