import { Topbar } from '@/components/topbar'

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar role="manager" />
      <main className="flex-1 overflow-y-auto pt-11" style={{ background: 'var(--bg-page)' }}>
        {children}
      </main>
    </div>
  )
}
