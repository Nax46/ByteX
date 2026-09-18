import React, { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { mentorApi, MentorMessage } from '@/api/endpoints/mentor.api'
import { Compass, Send, Sparkles } from 'lucide-react'

export const MentorPage: React.FC = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<MentorMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await mentorApi.getChatHistory()
        if (history && history.length > 0) {
          setMessages(history)
        } else {
          setMessages([
            {
              id: 'm_init',
              role: 'assistant',
              content: `Hello ${user?.name || 'there'}! I'm your AI learning mentor. Ask me any questions about your personalized roadmap, technical concepts, project architecture, or career preparation. What would you like to explore today?`,
              timestamp: 'Just now',
            },
          ])
        }
      } catch {
        setMessages([
          {
            id: 'm_init',
            role: 'assistant',
            content: `Hello ${user?.name || 'there'}! I'm your AI learning mentor. Ask me any questions about your personalized roadmap, technical concepts, project architecture, or career preparation. What would you like to explore today?`,
            timestamp: 'Just now',
          },
        ])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [user?.name])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSending) return

    const userMsg: MentorMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: 'Just now',
    }

    setMessages((prev) => [...prev, userMsg])
    const promptText = inputValue
    setInputValue('')
    setIsSending(true)

    try {
      const response = await mentorApi.sendMessage({ message: promptText })
      if (response?.message) {
        setMessages((prev) => [...prev, response.message])
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Unable to communicate with the mentor service. Please ensure the backend API server is online.'
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: msg,
          timestamp: 'Just now',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col animate-fadeIn py-2">
      <PageHeader
        title="Learning Guide & Mentorship"
        subtitle="Clarify technical concepts, ask questions about your roadmap, and receive actionable guidance."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Mentorship' },
        ]}
      />

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-hidden bg-white border-[#E5E5DF] shadow-sm">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12 text-[#626763] text-sm gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-[#1F6B4F]" />
              <span>Connecting with mentor...</span>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                ) : (
                  <Avatar name={user?.name || 'Student'} size="sm" />
                )}

                <div
                  className={`max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1F6B4F] text-white rounded-br-none'
                      : 'bg-[#F8F7F3] text-[#171918] border border-[#E5E5DF] rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {isSending && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D8E8DE] text-[#1F6B4F] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-[#F8F7F3] text-xs text-[#626763] border border-[#E5E5DF]">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t border-[#E5E5DF] flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your roadmap, JavaScript concepts, or next steps..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!inputValue.trim() || isSending}
            isLoading={isSending}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  )
}
