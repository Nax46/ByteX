import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export const StudentLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#171918] selection:bg-[#D8E8DE] selection:text-[#1F6B4F] overflow-x-hidden">
      {/* Ambient decorative orbs — fixed behind everything */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="ambient-orb-forest w-[550px] h-[550px] -top-32 -right-24" />
        <div className="ambient-orb-amber w-[450px] h-[450px] top-[40%] -left-32" />
        <div className="ambient-orb-lavender w-[500px] h-[500px] -bottom-32 right-1/4" />
      </div>

      {/* Desktop Sidebar — truly fixed, never scrolls with page content */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Right content column — offset left by the fixed sidebar width */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-200 relative z-10 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Header is sticky inside the scrolling column */}
        <Header onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary fallbackTitle="Dashboard Render Exception">
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
