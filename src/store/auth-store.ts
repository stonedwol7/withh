import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'

export type PortalRole = 'customer' | 'partner' | 'ops' | null

interface AuthState {
  isAuthenticated: boolean
  role: PortalRole
  userName: string
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  determineRole: () => Promise<PortalRole>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  userName: '',
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      set({ loading: false, error: error?.message || 'Login failed' })
      return false
    }

    const role = await determineUserRole(data.user.id)
    if (!role) {
      await supabase.auth.signOut()
      set({ loading: false, error: 'No role found for this user. Contact support.' })
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
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ isAuthenticated: false, role: null, userName: '', error: null })
  },

  determineRole: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const role = await determineUserRole(user.id)
    return role
  },

  clearError: () => set({ error: null }),
}))

async function determineUserRole(authId: string): Promise<PortalRole> {
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_id', authId)
    .single()
  if (customer) return 'customer'

  const { data: partner } = await supabase
    .from('support_partners')
    .select('id')
    .eq('auth_id', authId)
    .single()
  if (partner) return 'partner'

  const { data: ops } = await supabase
    .from('operations_team')
    .select('id')
    .eq('auth_id', authId)
    .single()
  if (ops) return 'ops'

  return null
}
