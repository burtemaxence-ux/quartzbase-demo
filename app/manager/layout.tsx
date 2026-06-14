import { Topbar } from '@/components/topbar'
import { SidebarShell } from '@/components/sidebar-shell'

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Topbar role="manager" />
      <div className="flex flex-1 overflow-hidden pt-11">
        <div className="hidden md:flex">
          <SidebarShell role="manager" />
        </div>
        <main className="flex-1 overflow-y-auto p-7" style={{ background: 'var(--bg-page)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
