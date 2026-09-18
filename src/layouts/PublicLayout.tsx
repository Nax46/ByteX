import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3] text-[#171918] relative overflow-x-hidden">
      {/* Ambient Color Refraction Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="ambient-orb-forest w-[600px] h-[600px] -top-40 -left-20" />
        <div className="ambient-orb-amber w-[500px] h-[500px] top-[30%] -right-32" />
        <div className="ambient-orb-lavender w-[550px] h-[550px] bottom-0 left-1/3" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
