'use client'

import SettingsSidebar from './_sidebar'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 44px)' }}>
      <SettingsSidebar />
      <main
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        {children}
      </main>
    </div>
  )
}
