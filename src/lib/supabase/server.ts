import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey || url === 'your_supabase_project_url') {
    throw new Error('Supabase not configured')
  }

  return createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey || url === 'your_supabase_project_url') {
    throw new Error('Supabase not configured')
  }

  return createServerClient(url, serviceKey,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: { persistSession: false },
    }
  )
}
