'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { ClipboardList, Handshake, Activity, Users, AlertTriangle, DollarSign, LogOut, ArrowLeft, Menu, X, Shield } from 'lucide-react'
import { NotificationCenter } from '@/components/shared/notification-center'
import { BrandSignature } from '@/components/brand/brand-signature'
import { useState } from 'react'

const sidebarItems = [
  { href: '/ops', icon: ClipboardList, label: 'Requests' },
  { href: '/ops/matching', icon: Handshake, label: 'Matching' },
  { href: '/ops/active', icon: Activity, label: 'Active Supports' },
  { href: '/ops/partners', icon: Users, label: 'Partners' },
  { href: '/ops/issues', icon: AlertTriangle, label: 'Issues' },
  { href: '/ops/finance', icon: DollarSign, label: 'Finance' },
]

export function OpsSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const doLogout = useAuthStore((s) => s.logout)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-xl bg-card border border-border shadow-sm"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-full lg:h-screen w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <BrandSignature markSize={16} />
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto" role="tablist" aria-label="Operations navigation">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); setMobileOpen(false) }}
                role="tab"
                aria-selected={isActive}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? 'text-accent font-semibold bg-accent/5 border-r-2 border-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => { doLogout(); router.push('/login') }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export function OpsHeader() {
  const pathname = usePathname()
  const currentItem = sidebarItems.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'))

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border px-4 h-14 flex items-center justify-between sticky top-0 z-30 ml-0 lg:ml-64" role="banner">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">{currentItem?.label || 'Operations'}</h1>
      </div>
      <div className="flex items-center gap-2">
        <NotificationCenter />
      </div>
    </header>
  )
}
