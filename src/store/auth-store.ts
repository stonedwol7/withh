import { create } from 'zustand'

export type PortalRole = 'customer' | 'partner' | 'ops' | null

interface AuthState {
  isAuthenticated: boolean
  role: PortalRole
  userName: string
  login: (role: 'customer' | 'partner' | 'ops', name: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  userName: '',
  login: async (role, userName) => {
    const useBackend = process.env.NEXT_PUBLIC_USE_LOCAL_BACKEND === 'true'
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

    if (useBackend) {
      try {
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, userName }),
        })
        if (res.ok) {
          set({ isAuthenticated: true, role, userName })
          return
        }
      } catch {}
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabase = !!url && url !== 'your_supabase_project_url'
    if (hasSupabase) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: `${role}@withh.com`, password: 'demo123456', role }),
        })
        if (res.ok) {
          set({ isAuthenticated: true, role, userName })
          return
        }
      } catch {}
    }
    set({ isAuthenticated: true, role, userName })
  },
  logout: async () => {
    const useBackend = process.env.NEXT_PUBLIC_USE_LOCAL_BACKEND === 'true'
    if (useBackend) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
        await fetch(`${apiUrl}/auth/logout`, { method: 'POST' })
      } catch {}
    }
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    set({ isAuthenticated: false, role: null, userName: '' })
  },
}))
