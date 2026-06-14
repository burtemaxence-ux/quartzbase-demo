import Link from 'next/link'
import { Construction } from 'lucide-react'

export default function EmployeeStubPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
        style={{ background: 'var(--accent-light)' }}
      >
        <Construction className="h-6 w-6" style={{ color: 'var(--accent)' }} />
      </div>

      <h1
        className="text-[18px] font-semibold tracking-tight mb-2"
        style={{ fontFamily: 'var(--font-syne)', color: 'var(--text-primary)' }}
      >
        Module non inclus dans la démo
      </h1>
      <p className="text-[13px] mb-8" style={{ color: 'var(--text-secondary)' }}>
        Cette fonctionnalité est disponible dans la version complète.
      </p>

      <Link href="/employee" className="btn-primary">
        ← Mon espace
      </Link>
    </div>
  )
}
