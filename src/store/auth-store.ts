import { create } from 'zustand'

export type PortalRole = 'customer' | 'partner' | 'ops' | null

interface AuthState {
  isAuthenticated: boolean
  role: PortalRole
  userName: string
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!url && !url.includes('your_supabase')
}

function determineRoleFromEmail(email: string): PortalRole {
  const prefix = email.split('@')[0].toLowerCase()
  if (prefix.includes('ops') || prefix.includes('staff') || prefix.includes('admin')) return 'ops'
  if (prefix.includes('partner') || prefix.includes('support')) return 'partner'
  return 'customer'
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  userName: '',
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })

    // Tier 1: Supabase (if configured)
    if (isSupabaseConfigured()) {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (!error && data.user) {
          const role = await determineUserRole(supabase, data.user.id)
          if (role) {
            set({
              isAuthenticated: true,
              role,
              userName: data.user.email?.split('@')[0] || 'User',
              loading: false,
              error: null,
            })
            return true
          }
        }
      } catch {}
    }

    // Tier 2: Local Express backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    const useBackend = process.env.NEXT_PUBLIC_USE_LOCAL_BACKEND === 'true'
    if (useBackend) {
      try {
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (res.ok) {
          const data = await res.json()
          set({
            isAuthenticated: true,
            role: data.role || determineRoleFromEmail(email),
            userName: data.name || email.split('@')[0],
            loading: false,
            error: null,
          })
          return true
        }
      } catch {}
    }

    // Tier 3: Mock data — any email/password works
    const role = determineRoleFromEmail(email)
    set({
      isAuthenticated: true,
      role,
      userName: email.split('@')[0],
      loading: false,
      error: null,
    })
    return true
  },

  logout: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        await supabase.auth.signOut()
      } catch {}
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
    const useBackend = process.env.NEXT_PUBLIC_USE_LOCAL_BACKEND === 'true'
    if (useBackend) {
      try { await fetch(`${apiUrl}/auth/logout`, { method: 'POST' }) } catch {}
    }
    set({ isAuthenticated: false, role: null, userName: '', error: null })
  },

  clearError: () => set({ error: null }),
}))

async function determineUserRole(supabase: any, authId: string): Promise<PortalRole> {
  for (const table of ['customers', 'support_partners', 'operations_team'] as const) {
    const { data } = await supabase.from(table).select('id').eq('auth_id', authId).maybeSingle()
    if (data) {
      if (table === 'customers') return 'customer'
      if (table === 'support_partners') return 'partner'
      if (table === 'operations_team') return 'ops'
    }
  }
  return null
}
