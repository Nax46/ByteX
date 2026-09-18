import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminHeader } from '@/components/layout/AdminHeader'
import { AdminMobileNav } from '@/components/layout/AdminMobileNav'

export const AdminLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="h-screen w-full flex bg-[#F8F7F3] text-[#171918] overflow-hidden select-none">
      {/* Fixed Left Sidebar (Desktop) */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Mobile Drawer Navigation */}
      <AdminMobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Right Content Area: Independently Scrollable Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        <div className="shrink-0">
          <AdminHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        </div>

        <main
          id="admin-main-container"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto select-text"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
