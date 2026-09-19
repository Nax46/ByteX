import React, { useState, useEffect, useRef } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import {
  mentorApi,
  MentorMessage,
  AIPersonalizationContext,
} from '@/api/endpoints/mentor.api'
import { MentorHeaderBanner } from '@/components/mentor/MentorHeaderBanner'
import { MentorStarterPrompts } from '@/components/mentor/MentorStarterPrompts'
import { MentorChatMessage } from '@/components/mentor/MentorChatMessage'
import { Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'

export const MentorPage: React.FC = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<MentorMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingContext, setIsLoadingContext] = useState(true)
  const [aiContext, setAiContext] = useState<AIPersonalizationContext | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load context & history on mount
  useEffect(() => {
    const initMentor = async () => {
      setIsLoadingContext(true)
      try {
        // Fetch live personalization summary & context
        const summaryData = await mentorApi.getPersonalizedSummary()
        if (summaryData?.context) {
          setAiContext(summaryData.context)
        }

        // Fetch local chat history or create greeting
        const history = await mentorApi.getChatHistory()
        if (history && history.length > 0) {
          setMessages(history)
        } else {
          const studentName = user?.name || summaryData?.context?.studentName || 'Student'
          const targetRole = summaryData?.context?.targetCareer || 'Full Stack Developer'
          const topSkill = summaryData?.context?.topPrioritySkill || 'Node.js'
          const topGap = summaryData?.context?.topPriorityGap ?? 45

          const initMsg: MentorMessage = {
            id: 'm_init',
            role: 'assistant',
            content: `Hello ${studentName}! I am your AI Career Mentor. I have analyzed your live SkillPath context for your target career as a ${targetRole}.\n\nYour current highest-priority bottleneck is ${topSkill} (Gap: -${topGap} points). How can I guide your next step today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedFollowUpQuestions: [
              'What should I focus on today?',
              `Why is ${topSkill} my priority bottleneck?`,
              'How does my roadmap connect to my career goal?',
            ],
            suggestedActions: [
              { label: "Today's Action", route: ROUTES.TODAY },
              { label: 'View Roadmap', route: ROUTES.ROADMAP },
            ],
          }
          setMessages([initMsg])
          mentorApi.saveChatHistory([initMsg])
        }
      } catch {
        const fallbackMsg: MentorMessage = {
          id: 'm_init_fb',
          role: 'assistant',
          content: `Hello ${user?.name || 'Student'}! I am your AI Career Mentor. Ask me any questions about your career goal, priority skill gaps, roadmap steps, or practical challenges.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            { label: "Today's Action", route: ROUTES.TODAY },
            { label: 'View Roadmap', route: ROUTES.ROADMAP },
          ],
        }
        setMessages([fallbackMsg])
      } finally {
        setIsLoadingContext(false)
      }
    }

    initMentor()
  }, [user?.name])

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom()
  }, [messages, isSending])

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputValue).trim()
    if (!queryText || isSending) return

    setSendError(null)

    const userMsg: MentorMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    mentorApi.saveChatHistory(updatedMessages)

    if (!textToSend) {
      setInputValue('')
    }
    setIsSending(true)

    try {
      const response = await mentorApi.sendMessage({ message: queryText })
      if (response?.message) {
        const newHistory = [...updatedMessages, response.message]
        setMessages(newHistory)
        mentorApi.saveChatHistory(newHistory)
      }
    } catch (err: unknown) {
      const errMsg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Unable to communicate with the mentor service.'
      setSendError(errMsg)
    } finally {
      setIsSending(false)
    }
  }

  const handleClearHistory = () => {
    mentorApi.clearChatHistory()
    const initMsg: MentorMessage = {
      id: 'm_init_reset_' + Date.now(),
      role: 'assistant',
      content: `Conversation reset. What questions do you have about your career path, skill gaps, or current roadmap step?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUpQuestions: [
        'What should I focus on today?',
        'Explain my priority skill gap',
        'What challenge should I attempt next?',
      ],
      suggestedActions: [
        { label: "Today's Action", route: ROUTES.TODAY },
        { label: 'View Roadmap', route: ROUTES.ROADMAP },
      ],
    }
    setMessages([initMsg])
    mentorApi.saveChatHistory([initMsg])
  }

  const showStarterPrompts = messages.length <= 1

  return (
    <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col animate-fadeIn py-2">
      <PageHeader
        title="AI Mentor Intelligence & Career Guidance"
        subtitle="Context-aware career advice, skill gap explanations, and roadmap guidance powered by your live platform state."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'AI Mentor' },
        ]}
      />

      {/* Context Banner */}
      <MentorHeaderBanner
        context={aiContext}
        onClearHistory={handleClearHistory}
        hasMessages={messages.length > 1}
      />

      {/* Main Chat Container */}
      <Card className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-hidden bg-white border-[#E5E5DF] shadow-sm relative">
        {/* Messages List Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoadingContext ? (
            <div className="flex items-center justify-center py-16 text-[#626763] text-sm gap-2">
              <Sparkles className="w-5 h-5 animate-spin text-[#1F6B4F]" />
              <span>Initializing mentor context...</span>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MentorChatMessage
                  key={msg.id}
                  message={msg}
                  userName={user?.name}
                  onSelectFollowUp={(prompt) => handleSendMessage(prompt)}
                />
              ))}

              {/* Contextual Prompts when message history is minimal */}
              {showStarterPrompts && (
                <MentorStarterPrompts
                  context={aiContext}
                  onSelectPrompt={(prompt) => handleSendMessage(prompt)}
                />
              )}

              {/* Sending Indicator */}
              {isSending && (
                <div className="flex items-center gap-3 my-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center shrink-0 border border-[#1F6B4F]/20">
                    <Sparkles className="w-4 h-4 animate-spin text-[#1F6B4F]" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F8F7F3] text-xs text-[#626763] border border-[#E5E5DF] flex items-center gap-2">
                    <span className="font-medium text-[#171918]">Analyzing SkillPath context & generating response...</span>
                  </div>
                </div>
              )}

              {/* Error Message & Retry */}
              {sendError && (
                <div className="my-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{sendError}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage()}
                    leftIcon={<RefreshCw className="w-3 h-3" />}
                    className="text-xs border-red-300 hover:bg-red-100 text-red-800 shrink-0"
                  >
                    Retry
                  </Button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="pt-4 border-t border-[#E5E5DF] flex gap-2 items-center"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your skill gaps, roadmap, bottlenecks, or today's action..."
            className="flex-1 text-xs sm:text-sm"
            disabled={isSending || isLoadingContext}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!inputValue.trim() || isSending || isLoadingContext}
            isLoading={isSending}
            rightIcon={<Send className="w-4 h-4" />}
            className="bg-[#1F6B4F] hover:bg-[#17523C] text-white shrink-0"
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  )
}
