'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { ArrowLeft, LogOut, ClipboardList, Handshake, Activity, Users, AlertTriangle, DollarSign } from 'lucide-react'
import Image from 'next/image'

export function OpsHeader({ title }: { title: string }) {
  const router = useRouter()
  const doLogout = useAuthStore((s) => s.logout)

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border px-4 h-14 flex items-center justify-between sticky top-0 z-40" role="banner">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-xl hover:bg-muted transition-colors btn-press" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-amber">Operations</span>
        <button
          onClick={() => { doLogout(); router.push('/login') }}
          className="text-xs text-destructive font-medium hover:underline"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

const items = [
  { href: '/ops', label: 'Requests', icon: ClipboardList },
  { href: '/ops/matching', label: 'Matching', icon: Handshake },
  { href: '/ops/active', label: 'Active Supports', icon: Activity },
  { href: '/ops/partners', label: 'Partners', icon: Users },
  { href: '/ops/issues', label: 'Issues', icon: AlertTriangle },
  { href: '/ops/finance', label: 'Finance', icon: DollarSign },
]

export function OpsSidebar() {
  const router = useRouter()
  const doLogout = useAuthStore((s) => s.logout)
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 overflow-y-auto flex flex-col" role="navigation" aria-label="Operations sidebar">
      <div className="p-5 border-b border-border flex items-center gap-2">
        <Image src="/logo-horizontal.png" alt="WITHH" width={60} height={17} className="object-contain" />
        <span className="text-xs text-amber font-medium">Ops</span>
      </div>
      <nav className="p-3 space-y-1 flex-1">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all btn-press ${
                isActive
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : ''}`} />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <button
          onClick={() => { doLogout(); router.push('/login') }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/5 transition-colors btn-press"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
