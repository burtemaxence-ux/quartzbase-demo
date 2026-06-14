import { Construction } from 'lucide-react'
import Link from 'next/link'

export default function SettingsStubPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
        style={{ background: 'var(--accent-light)' }}
      >
        <Construction className="h-6 w-6" style={{ color: 'var(--accent)' }} />
      </div>
      <h1
        className="text-[20px] font-semibold tracking-tight mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        Module non inclus dans la démo
      </h1>
      <p className="text-[14px] mb-1" style={{ color: 'var(--text-secondary)' }}>
        Cette section est disponible dans la version complète de Quartzbase.
      </p>
      <p className="text-[12px] mb-8" style={{ color: 'var(--text-tertiary)' }}>
        🎭 Mode démo · Données fictives
      </p>
      <Link href="/manager/settings/organisation" className="btn-primary">
        ← Organisation
      </Link>
    </div>
  )
}
