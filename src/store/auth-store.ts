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

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  userName: '',
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })

    if (isSupabaseConfigured()) {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          set({ loading: false, error: error.message })
          return false
        }
        if (!data.user) {
          set({ loading: false, error: 'No user returned from authentication' })
          return false
        }
        const role = await determineUserRole(supabase, data.user.id)
        if (!role) {
          set({ loading: false, error: 'Account not fully set up. Please contact support.' })
          return false
        }
        set({
          isAuthenticated: true,
          role,
          userName: data.user.email?.split('@')[0] || 'User',
          loading: false,
          error: null,
        })
        return true
      } catch (err: any) {
        set({ loading: false, error: err?.message || 'Authentication failed' })
        return false
      }
    }

    set({ loading: false, error: 'Supabase not configured' })
    return false
  },

  logout: async () => {
    if (isSupabaseConfigured()) {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        await supabase.auth.signOut()
      } catch {}
    }
    set({ isAuthenticated: false, role: null, userName: '', error: null })
  },

  clearError: () => set({ error: null }),
}))

async function determineUserRole(supabase: any, authId: string): Promise<PortalRole> {
  const [customer, partner, ops] = await Promise.all([
    supabase.from('customers').select('id').eq('auth_id', authId).maybeSingle(),
    supabase.from('support_partners').select('id').eq('auth_id', authId).maybeSingle(),
    supabase.from('operations_team').select('id').eq('auth_id', authId).maybeSingle(),
  ])
  if (customer.data) return 'customer'
  if (partner.data) return 'partner'
  if (ops.data) return 'ops'
  return null
}
