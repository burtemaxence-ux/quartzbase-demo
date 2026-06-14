import { Topbar } from '@/components/topbar'
import { BottomNav, MobileHeader } from '@/components/bottom-nav'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop topbar */}
      <div className="hidden md:block">
        <Topbar role="employee" />
      </div>
      {/* Mobile header */}
      <MobileHeader role="employee" />

      <main
        className="flex-1"
        style={{
          padding: '24px 20px',
          paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px) + 24px)',
          background: 'var(--bg-page)',
          maxWidth: '640px',
          margin: '0 auto',
          width: '100%',
          paddingTop: '80px',
        }}
      >
        {children}
      </main>

      <BottomNav role="employee" />
    </div>
  )
}
