'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Map, MessageSquare, User } from 'lucide-react'
import { Toaster } from 'sonner'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/journey', label: 'Journey', icon: Map },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border ios-safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={`text-[9px] tracking-wide ${isActive ? 'font-medium' : 'font-normal'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      <Toaster position="top-center" richColors />
    </div>
  )
}
