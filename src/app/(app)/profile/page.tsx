'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Heart, HelpCircle, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? '')
    })
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const links = [
    { label: 'Account', icon: User, href: '#' },
    { label: 'Preferences', icon: Heart, href: '#' },
    { label: 'Trusted Contacts', icon: Heart, href: '#' },
    { label: 'Help', icon: HelpCircle, href: '#' },
  ]

  return (
    <div className="max-w-lg mx-auto px-5 pt-8 pb-8">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">Profile</h1>
      <p className="text-sm text-muted-foreground mb-8">{email}</p>

      <div className="space-y-1">
        {links.map((link, i) => {
          const Icon = link.icon
          return (
            <button
              key={i}
              className="w-full bg-card rounded-2xl border border-border px-4 py-3.5 flex items-center gap-3 text-left transition-all hover:border-primary/20 min-h-[48px]"
            >
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-foreground">{link.label}</span>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleSignOut}
        className="w-full text-center text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors mt-8 py-2"
      >
        Sign out
      </button>
    </div>
  )
}
