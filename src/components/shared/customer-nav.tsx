'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Home, ClipboardList, MessageSquare, User, Calendar, ArrowLeft } from 'lucide-react'
import { NotificationCenter } from '@/components/shared/notification-center'
import Image from 'next/image'

const navItems = [
  { href: '/customer', icon: Home, label: 'Home' },
  { href: '/customer/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/customer/requests', icon: ClipboardList, label: 'Requests' },
  { href: '/customer/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/customer/profile', icon: User, label: 'Profile' },
]

export function CustomerBottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border ios-safe-bottom z-50" role="tablist" aria-label="Main navigation">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-muted-foreground'}`}
              />
              <span
                className={`text-[10px] font-medium ${isActive ? 'text-accent' : 'text-muted-foreground'}`}
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
    <header className="bg-card border-b border-border px-4 h-14 flex items-center justify-between" role="banner">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => router.back()} className="p-1 -ml-1 rounded-lg hover:bg-muted transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        {title ? (
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        ) : (
          <Image src="/logo-horizontal.png" alt="WITHH" width={100} height={28} className="object-contain" />
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
    <header className="bg-card border-b border-border px-4 h-14 flex items-center justify-between" role="banner">
      <Image src="/logo-horizontal.png" alt="WITHH" width={100} height={28} className="object-contain" />
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{userName}</span>
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
