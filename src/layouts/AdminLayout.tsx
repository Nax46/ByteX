import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminHeader } from '@/components/layout/AdminHeader'
import { AdminMobileNav } from '@/components/layout/AdminMobileNav'

export const AdminLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#171918] select-none">
      {/* Fixed Left Sidebar (Desktop only — truly fixed, never scrolls) */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Mobile Drawer Navigation */}
      <AdminMobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Right Content Area — offset to the right of the fixed sidebar */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-200 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Sticky top header inside the scrollable column */}
        <div className="sticky top-0 z-20 shrink-0">
          <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        </div>

        <main
          id="admin-main-container"
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto select-text"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
