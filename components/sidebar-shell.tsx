'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'

interface SidebarShellProps {
  role?: 'manager' | 'employee' | 'supervisor'
}

export function SidebarShell({ role = 'manager' }: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <Sidebar
      role={role}
      collapsed={collapsed}
      onToggle={() => setCollapsed(c => !c)}
    />
  )
}
