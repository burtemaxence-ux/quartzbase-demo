'use client'

import { Bell } from 'lucide-react'

export function NotificationsBell({ isMobile }: { isMobile?: boolean }) {
  return (
    <button
      onClick={() => alert('🎭 Mode démo — notifications désactivées')}
      className="relative flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-150"
      style={{
        width: isMobile ? 36 : 32,
        height: isMobile ? 36 : 32,
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
      }}
      title="Notifications"
    >
      <Bell className="h-4 w-4" />
      <span
        className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
        style={{ background: 'var(--danger)' }}
      />
    </button>
  )
}
