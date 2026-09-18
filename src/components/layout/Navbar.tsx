import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { Menu, X, ArrowRight, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  const [isScrolled, setIsScrolled] = useState(false)

  // Track scroll position for subtle elevation transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const navLinks = [
    { label: 'Home', href: ROUTES.HOME },
    { label: 'Features', href: ROUTES.FEATURES },
    { label: 'Learning Paths', href: ROUTES.ROADMAP },
    { label: 'Resources', href: ROUTES.RESOURCES },
    { label: 'Careers', href: ROUTES.CAREERS },
  ]

  const isActive = (path: string) => {
    if (path === ROUTES.HOME) {
      return location.pathname === ROUTES.HOME
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate(ROUTES.HOME)
  }

  return (
    <header
      role="banner"
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#E5E5DF] shadow-[0_2px_8px_0_rgba(23,25,24,0.04)]'
          : 'bg-white/85 backdrop-blur-sm border-b border-[#E5E5DF]/70 shadow-[0_1px_3px_0_rgba(23,25,24,0.02)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] focus-visible:ring-offset-2 transition-transform hover:opacity-95"
          aria-label="SkillPath Home"
        >
          <SkillPathLogo size="md" />
        </Link>

        {/* Desktop Navigation (Center) */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                to={link.href}
                aria-current={active ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-normal transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] focus-visible:ring-offset-2 ${
                  active
                    ? 'bg-[#D8E8DE]/60 text-[#1F6B4F] shadow-2xs font-bold'
                    : 'text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Action Buttons (Right) */}
        <div className="hidden md:flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={user?.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] focus-visible:ring-offset-2 rounded-lg"
              >
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Dashboard
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-[#626763] hover:text-red-700 hover:bg-red-50"
                title="Sign out of your account"
                aria-label="Sign out of your account"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={ROUTES.LOGIN}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] focus-visible:ring-offset-2 rounded-lg"
              >
                <Button variant="ghost" size="sm" className="font-semibold text-xs text-[#171918]">
                  Log in
                </Button>
              </Link>

              <Link
                to={ROUTES.REGISTER}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] focus-visible:ring-offset-2 rounded-lg"
              >
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  className="shadow-2xs font-semibold text-xs"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] transition-colors cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-18 z-30 bg-[#171918]/25 backdrop-blur-xs md:hidden animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            className="relative z-40 md:hidden border-b border-[#E5E5DF] bg-white px-4 pt-3 pb-6 space-y-3 shadow-md animate-fadeIn"
            role="region"
            aria-label="Mobile Navigation"
          >
            <nav aria-label="Mobile Links" className="space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#D8E8DE]/60 text-[#1F6B4F] font-semibold'
                        : 'text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="pt-3 border-t border-[#E5E5DF] flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="primary" className="w-full justify-center">
                      <LayoutDashboard className="w-4 h-4 mr-1.5" />
                      Go to Dashboard
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full justify-center text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-1.5" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center text-sm font-semibold">
                      Log in
                    </Button>
                  </Link>
                  <Link to={ROUTES.REGISTER} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="primary"
                      className="w-full justify-center text-sm font-semibold"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
