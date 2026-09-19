import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { ROUTES } from '@/constants/routes'
import { Zap, Dumbbell, BadgeCheck, ContactRound, ArrowRight } from 'lucide-react'

export const DashboardNextMove: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: "Today's Action",
      desc: 'Complete daily high-priority focus task',
      to: ROUTES.TODAY,
      icon: <Zap className="w-4 h-4 text-[#1F6B4F]" />,
    },
    {
      step: '2',
      title: 'Practice Challenge',
      desc: 'Solve micro-drill scenarios under time limits',
      to: ROUTES.CHALLENGES,
      icon: <Dumbbell className="w-4 h-4 text-[#1F6B4F]" />,
    },
    {
      step: '3',
      title: 'Skill Evidence',
      desc: 'Verify proof of work & repo submissions',
      to: ROUTES.SKILL_EVIDENCE,
      icon: <BadgeCheck className="w-4 h-4 text-[#1F6B4F]" />,
    },
    {
      step: '4',
      title: 'Career Passport',
      desc: 'Publish verified readiness credentials',
      to: ROUTES.CAREER_PASSPORT,
      icon: <ContactRound className="w-4 h-4 text-[#1F6B4F]" />,
    },
  ]

  return (
    <Card glass="interactive" className="p-6 border-white/80 animate-slideUp">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E5DF]/70">
        <div>
          <h3 className="font-heading text-base font-bold text-[#171918]">
            Your Career Acceleration Cycle
          </h3>
          <p className="text-xs text-[#626763] mt-0.5">
            Continuous loop connecting action, practice, proof, and career credentials
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s) => (
          <Link key={s.step} to={s.to} className="group block">
            <div className="p-4 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] hover:border-[#1F6B4F]/40 hover:bg-white transition-all h-full flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#D8E8DE] text-[#1F6B4F] text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                  {s.icon}
                </div>
                <h4 className="font-heading text-sm font-bold text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
                  {s.title}
                </h4>
                <p className="text-xs text-[#626763] line-clamp-2">
                  {s.desc}
                </p>
              </div>
              <div className="pt-3 flex items-center text-xs font-semibold text-[#1F6B4F] group-hover:translate-x-1 transition-transform">
                Explore <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}

export default DashboardNextMove
