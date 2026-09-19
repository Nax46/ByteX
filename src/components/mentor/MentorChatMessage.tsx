import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Compass, ExternalLink, Sparkles, MessageSquare } from 'lucide-react'
import { MentorMessage } from '@/api/endpoints/mentor.api'

interface MentorChatMessageProps {
  message: MentorMessage
  userName?: string
  onSelectFollowUp?: (questionText: string) => void
}

export const MentorChatMessage: React.FC<MentorChatMessageProps> = ({
  message,
  userName = 'Student',
  onSelectFollowUp,
}) => {
  const navigate = useNavigate()
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex items-start gap-3 my-3 animate-fadeIn ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar Icon */}
      {isUser ? (
        <Avatar name={userName} size="sm" />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center shrink-0 shadow-2xs border border-[#1F6B4F]/20">
          <Compass className="w-4.5 h-4.5" />
        </div>
      )}

      {/* Bubble Box */}
      <div
        className={`max-w-xl space-y-3 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
          isUser
            ? 'bg-[#1F6B4F] text-white rounded-tr-xs'
            : 'bg-[#F8F7F3] text-[#171918] border border-[#E5E5DF] rounded-tl-xs'
        }`}
      >
        {/* Main Content */}
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Fallback Notice */}
        {message.isFallback && !isUser && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#626763] pt-1 italic border-t border-[#E5E5DF]">
            <Sparkles className="w-3 h-3 text-[#1F6B4F]" />
            <span>Generated using verified platform SkillPath rules.</span>
          </div>
        )}

        {/* Why It Matters Callout */}
        {message.whyItMatters && !isUser && (
          <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200/60 text-emerald-900 text-xs">
            <span className="font-semibold block mb-0.5">Why this matters:</span>
            <span>{message.whyItMatters}</span>
          </div>
        )}

        {/* Action CTAs */}
        {!isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="pt-2 border-t border-[#E5E5DF] space-y-1.5">
            <span className="text-[11px] font-medium text-[#626763] uppercase tracking-wider block">
              Recommended Platform Actions:
            </span>
            <div className="flex flex-wrap gap-2">
              {message.suggestedActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => action.route && navigate(action.route)}
                  rightIcon={<ExternalLink className="w-3 h-3" />}
                  className="text-xs bg-white text-[#1F6B4F] border-[#1F6B4F]/30 hover:bg-[#D8E8DE]/40"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Follow-Up Questions */}
        {!isUser && message.suggestedFollowUpQuestions && message.suggestedFollowUpQuestions.length > 0 && (
          <div className="pt-2 border-t border-[#E5E5DF] space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#626763]">
              <MessageSquare className="w-3 h-3 text-[#1F6B4F]" />
              <span>Suggested Follow-Ups:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestedFollowUpQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectFollowUp && onSelectFollowUp(q)}
                  className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#E5E5DF] text-[#171918] hover:border-[#1F6B4F] hover:text-[#1F6B4F] transition-colors text-left cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] text-right pt-1 ${
            isUser ? 'text-emerald-100' : 'text-[#626763]'
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  )
}
