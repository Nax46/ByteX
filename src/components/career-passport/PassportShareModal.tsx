import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShieldCheck, Copy, Check, X, Globe, Lock } from 'lucide-react'

interface PassportShareModalProps {
  isOpen: boolean
  onClose: () => void
  studentName: string
  targetRole: string
  readinessScore: number
}

export const PassportShareModal: React.FC<PassportShareModalProps> = ({
  isOpen,
  onClose,
  studentName,
  targetRole,
  readinessScore,
}) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Generate deterministic share URL using current window location
  const shareUrl = `${window.location.origin}/career-passport`

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <Card className="w-full max-w-md p-6 bg-white border-[#E5E5DF] space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#626763] hover:text-[#171918] hover:bg-[#F8F7F3] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#D8E8DE] text-[#1F6B4F]">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <Badge variant="forest" size="sm">
              Public Credential Link
            </Badge>
          </div>
          <h3 className="font-heading text-xl font-bold text-[#171918]">
            Share Career Passport
          </h3>
          <p className="text-xs text-[#626763] leading-relaxed">
            Share your verified {targetRole} credential, demonstrated evidence, and readiness readout ({readinessScore}%) with recruiters or employers.
          </p>
        </div>

        {/* Credential Details Card */}
        <div className="p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#626763]">Student:</span>
            <span className="font-bold text-[#171918]">{studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#626763]">Target Career:</span>
            <span className="font-bold text-[#1F6B4F]">{targetRole}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#626763]">Status:</span>
            <span className="font-semibold text-[#1F6B4F] flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Authenticated Learner Passport
            </span>
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#171918] block">Shareable Passport Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E5E5DF] bg-[#F8F7F3] text-[#171918] focus:outline-none"
            />
            <Button
              variant="primary"
              size="sm"
              leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Security Note */}
        <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#626763]">
          <Lock className="w-3.5 h-3.5 text-[#1F6B4F]" />
          <span>Credential verification is secured through ByteX auth protocols.</span>
        </div>
      </Card>
    </div>
  )
}

export default PassportShareModal
