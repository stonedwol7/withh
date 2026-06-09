'use client'

import { useState } from 'react'
import { Share2, Check, Copy, ExternalLink } from 'lucide-react'

interface ShareJourneyProps {
  requestId: string
  title?: string
}

export function ShareJourney({ requestId, title = 'Share Journey' }: ShareJourneyProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/journey/${requestId}`
    : ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WITHH Support Journey',
          text: 'Track my support journey in real-time',
          url: shareUrl,
        })
      } catch {}
    } else {
      handleCopy()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        {copied ? 'Link Copied!' : title}
      </button>
      {copied && (
        <span className="flex items-center gap-1 text-xs text-green">
          <Check className="w-3 h-3" /> Copied
        </span>
      )}
    </div>
  )
}
