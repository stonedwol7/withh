import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: ops } = await supabase
    .from('operations_team')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!ops) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [requests, partners, events] = await Promise.all([
    supabase.from('requests').select('*').order('created_at', { ascending: false }).then(r => r.data || []),
    supabase.from('support_partners').select('*').order('rating', { ascending: false }).then(r => r.data || []),
    supabase.from('journey_events').select('*').order('created_at', { ascending: false }).then(r => r.data || []),
  ])

  return NextResponse.json({ requests, partners, events })
}
