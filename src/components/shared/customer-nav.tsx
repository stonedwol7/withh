'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Home, ClipboardList, MessageSquare, User, Route, ArrowLeft } from 'lucide-react'
import { NotificationCenter } from '@/components/shared/notification-center'
import { BrandSignature } from '@/components/brand/brand-signature'

const navItems = [
  { href: '/customer', icon: Home, label: 'Home' },
  { href: '/customer/journey', icon: Route, label: 'Journey' },
  { href: '/customer/requests', icon: ClipboardList, label: 'Requests' },
  { href: '/customer/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/customer/profile', icon: User, label: 'Profile' },
]

export function CustomerBottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border ios-safe-bottom z-50" role="tablist" aria-label="Main navigation">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-0 transition-colors btn-press"
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-full animate-scale-in" />
              )}
              <item.icon
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive ? 'text-accent scale-110' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-all duration-200 ${
                  isActive ? 'text-accent font-semibold' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export function CustomerHeader({ title, showBack = true }: { title?: string; showBack?: boolean }) {
  const router = useRouter()

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border px-4 h-14 flex items-center justify-between sticky top-0 z-40" role="banner">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-xl hover:bg-muted transition-colors btn-press" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        {title ? (
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        ) : (
          <BrandSignature size="sm" />
        )}
      </div>
      <div className="flex items-center gap-2">
        <NotificationCenter />
      </div>
    </header>
  )
}

export function CustomerHeaderWithLogout() {
  const router = useRouter()
  const userName = useAuthStore((s) => s.userName)
  const doLogout = useAuthStore((s) => s.logout)

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border px-4 h-14 flex items-center justify-between sticky top-0 z-40" role="banner">
      <BrandSignature size="sm" />
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{userName}</span>
        <button
          onClick={() => { doLogout(); router.push('/login') }}
          className="text-xs text-destructive font-medium hover:underline btn-press"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
