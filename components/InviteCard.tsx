'use client'

import { useState } from 'react'

export default function InviteCard({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    const link = `${window.location.origin}/join/${inviteCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Invite:</span>
      <code className="text-xs bg-gray-100 rounded px-2 py-1 font-mono tracking-widest">
        {inviteCode}
      </code>
      <button
        onClick={copyLink}
        className="text-xs text-blue-500 hover:text-blue-700 transition-colors whitespace-nowrap"
      >
        {copied ? '✓ Copied!' : 'Copy link'}
      </button>
    </div>
  )
}
