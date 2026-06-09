'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Home, Calendar, Wallet, User, MessageSquare, ArrowLeft } from 'lucide-react'
import { NotificationCenter } from '@/components/shared/notification-center'
import { BrandSignature } from '@/components/brand/brand-signature'

export function PartnerHeader({ title, showBack = true }: { title?: string; showBack?: boolean }) {
  const router = useRouter()
  const doLogout = useAuthStore((s) => s.logout)
  const userName = useAuthStore((s) => s.userName)

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border px-4 h-14 flex items-center justify-between sticky top-0 z-40" role="banner">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => router.back()} className="p-1.5 -ml-1.5 rounded-xl hover:bg-muted transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        {title ? (
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        ) : (
          <BrandSignature markSize={16} />
        )}
      </div>
      <div className="flex items-center gap-2">
        <NotificationCenter />
        <span className="text-xs text-muted-foreground hidden sm:inline">{userName}</span>
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

const navItems = [
  { href: '/partner', icon: Home, label: 'Home' },
  { href: '/partner/assignments', icon: Calendar, label: 'Assignments' },
  { href: '/partner/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/partner/earnings', icon: Wallet, label: 'Earnings' },
  { href: '/partner/profile', icon: User, label: 'Profile' },
]

export function PartnerBottomNav() {
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
              className="relative flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-0"
            >
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-full animate-scale-in" />
              )}
              <item.icon
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive ? 'text-accent' : 'text-muted-foreground'
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
