import React from 'react'
import { Sparkles, ArrowRight, HelpCircle, Target, ShieldCheck, Map } from 'lucide-react'
import { AIPersonalizationContext } from '@/api/endpoints/mentor.api'

interface MentorStarterPromptsProps {
  context?: AIPersonalizationContext | null
  onSelectPrompt: (promptText: string) => void
}

export const MentorStarterPrompts: React.FC<MentorStarterPromptsProps> = ({
  context,
  onSelectPrompt,
}) => {
  const topSkill = context?.topPrioritySkill || 'Node.js'
  const targetCareer = context?.targetCareer || 'Full Stack Developer'

  const prompts = [
    {
      icon: Target,
      label: 'What should I focus on today?',
      query: 'What should I focus on today based on my current career roadmap and bottleneck?',
      badge: 'Today Action',
    },
    {
      icon: HelpCircle,
      label: `Why is ${topSkill} my priority bottleneck?`,
      query: `Why is ${topSkill} identified as my priority skill gap for a ${targetCareer}?`,
      badge: 'Skill Gap',
    },
    {
      icon: Map,
      label: 'Explain my current roadmap sequence',
      query: `How does my current roadmap prepare me for a ${targetCareer} role?`,
      badge: 'Roadmap',
    },
    {
      icon: ShieldCheck,
      label: `How do I build evidence for ${topSkill}?`,
      query: `What practical challenge or project will demonstrate verified evidence for ${topSkill}?`,
      badge: 'Evidence',
    },
  ]

  return (
    <div className="my-6 p-4 rounded-xl bg-white border border-[#E5E5DF] shadow-2xs space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#171918] uppercase tracking-wider">
        <Sparkles className="w-4 h-4 text-[#1F6B4F]" />
        <span>Context-Aware Quick Prompts</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {prompts.map((item, idx) => {
          const Icon = item.icon
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.query)}
              className="flex items-start justify-between p-3 rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] hover:bg-[#D8E8DE]/30 hover:border-[#1F6B4F]/40 transition-all text-left group cursor-pointer"
            >
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-[#1F6B4F]" />
                  <span className="text-xs font-medium text-[#171918] group-hover:text-[#1F6B4F] transition-colors">
                    {item.label}
                  </span>
                </div>
                <span className="inline-block px-1.5 py-0.5 rounded bg-white text-[10px] font-medium text-[#626763] border border-[#E5E5DF]">
                  {item.badge}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#626763] group-hover:text-[#1F6B4F] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
