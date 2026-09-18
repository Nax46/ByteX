import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { Menu, X, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const navLinks = [
    { label: 'How It Works', href: ROUTES.HOW_IT_WORKS },
    { label: 'Assessments', href: ROUTES.ASSESSMENT },
    { label: 'Learning Paths', href: ROUTES.ROADMAP },
    { label: 'Careers', href: ROUTES.CAREERS },
    { label: 'Resources', href: ROUTES.RESOURCES },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_1px_3px_0_rgba(23,25,24,0.03),inset_0_-1px_0_0_rgba(229,229,223,0.6),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <SkillPathLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative py-1.5 text-sm font-medium transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1F6B4F] after:rounded-full after:transition-all after:duration-250 ${
                  active
                    ? 'text-[#1F6B4F] font-semibold after:scale-x-100'
                    : 'text-[#626763] hover:text-[#171918] after:scale-x-0 hover:after:scale-x-100 after:opacity-60'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link to={ROUTES.DASHBOARD}>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#EFECE6] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5E5DF] bg-white px-4 pt-3 pb-6 space-y-3 shadow-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#E5E5DF] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link to={ROUTES.DASHBOARD} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
