import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Zap,
  Briefcase,
  Flag,
  BrainCircuit,
  Target,
  ShieldCheck,
  ClipboardCheck,
  Map,
  BookOpen,
  Dumbbell,
  FolderKanban,
  TrendingUp,
  BadgeCheck,
  Award,
  ContactRound,
  Trophy,
  Swords,
  Users,
  Sparkles,
  BriefcaseBusiness,
  Bell,
  User,
  Settings,
  X,
} from 'lucide-react'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

interface NavSection {
  title: string
  items: Array<{ label: string; to: string; icon: React.ReactNode }>
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const location = useLocation()

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Today's Action", to: ROUTES.TODAY, icon: <Zap className="w-4 h-4" /> },
      ],
    },
    {
      title: 'My Career',
      items: [
        { label: 'Careers', to: ROUTES.CAREERS, icon: <Briefcase className="w-4 h-4" /> },
        { label: 'Career Mission', to: ROUTES.CAREER_MISSION, icon: <Flag className="w-4 h-4" /> },
        { label: 'My Skills', to: ROUTES.SKILLS, icon: <BrainCircuit className="w-4 h-4" /> },
        { label: 'Skill Gaps', to: ROUTES.SKILL_GAP, icon: <Target className="w-4 h-4" /> },
        { label: 'Career Readiness', to: ROUTES.CAREER_READINESS, icon: <ShieldCheck className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Learn',
      items: [
        { label: 'Assessment', to: ROUTES.ASSESSMENT, icon: <ClipboardCheck className="w-4 h-4" /> },
        { label: 'Learning Path', to: ROUTES.ROADMAP, icon: <Map className="w-4 h-4" /> },
        { label: 'Resources', to: ROUTES.RESOURCES, icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Challenges', to: ROUTES.CHALLENGES, icon: <Dumbbell className="w-4 h-4" /> },
        { label: 'Projects', to: ROUTES.PROJECTS, icon: <FolderKanban className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Progress',
      items: [
        { label: 'Progress', to: ROUTES.PROGRESS, icon: <TrendingUp className="w-4 h-4" /> },
        { label: 'Skill Evidence', to: ROUTES.SKILL_EVIDENCE, icon: <BadgeCheck className="w-4 h-4" /> },
        { label: 'Achievements', to: ROUTES.ACHIEVEMENTS, icon: <Award className="w-4 h-4" /> },
        { label: 'Career Passport', to: ROUTES.CAREER_PASSPORT, icon: <ContactRound className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Community',
      items: [
        { label: 'Career League', to: ROUTES.CAREER_LEAGUE, icon: <Trophy className="w-4 h-4" /> },
        { label: 'Skill Battles', to: ROUTES.SKILL_BATTLES, icon: <Swords className="w-4 h-4" /> },
        { label: 'Squads', to: ROUTES.SQUADS, icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      title: 'AI Assistant',
      items: [
        { label: 'AI Mentor', to: ROUTES.MENTOR, icon: <Sparkles className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Opportunities',
      items: [
        { label: 'Opportunities', to: ROUTES.OPPORTUNITIES, icon: <BriefcaseBusiness className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Notifications', to: ROUTES.NOTIFICATIONS, icon: <Bell className="w-4 h-4" /> },
        { label: 'Profile', to: ROUTES.PROFILE, icon: <User className="w-4 h-4" /> },
        { label: 'Settings', to: ROUTES.SETTINGS, icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#171918]/30 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white border-r border-[#E5E5DF] p-5 flex flex-col justify-between shadow-xl z-10 animate-slideRight">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E5DF]">
            <SkillPathLogo size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3]"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links grouped by conceptual area */}
          <nav className="mt-3 space-y-4 overflow-y-auto max-h-[75vh] pr-1">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="text-[10px] font-bold text-[#8E948F] uppercase tracking-wider px-3 pt-1 pb-1">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.to
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
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
            ))}
          </nav>
        </div>

        <div className="pt-3 border-t border-[#E5E5DF] text-[11px] text-[#8E948F] text-center">
          AI SkillPath • Career Intelligence Platform
        </div>
      </div>
    </div>
  )
}

export default MobileNav
