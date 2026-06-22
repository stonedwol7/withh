import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const UNAUTHORIZED = NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

async function checkOps() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: team } = await admin
    .from('operations_team')
    .select('id')
    .eq('auth_id', user.id)
    .limit(1)
  return (team && team.length > 0) ? admin : null
}

export async function GET(request: Request) {
  const admin = await checkOps()
  if (!admin) return UNAUTHORIZED

  const url = new URL(request.url)
  const type = url.searchParams.get('type')

  if (type === 'requests') {
    const { data } = await admin.from('requests').select('*').order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  if (type === 'partners') {
    const { data } = await admin.from('support_partners').select('*').order('name')
    return NextResponse.json(data || [])
  }

  if (type === 'assignments') {
    const { data } = await admin
      .from('assignments')
      .select('*, requests(*), support_partners(*)')
      .order('assigned_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}

export async function POST(request: Request) {
  const admin = await checkOps()
  if (!admin) return UNAUTHORIZED

  const body = await request.json()
  const { action } = body

  if (action === 'assign') {
    const { request_id, partner_id } = body
    if (!request_id || !partner_id) {
      return NextResponse.json({ error: 'request_id and partner_id required' }, { status: 400 })
    }

    const { data, error } = await admin
      .from('assignments')
      .insert({
        request_id,
        partner_id,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      } as any)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'update_status') {
    const { request_id, status } = body
    if (!request_id || !status) {
      return NextResponse.json({ error: 'request_id and status required' }, { status: 400 })
    }

    const { error } = await admin
      .from('requests')
      .update({ status, updated_at: new Date().toISOString() } as any)
      .eq('id', request_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await admin.from('journey_events').insert({
      request_id,
      event_type: status === 'cancelled' ? 'cancelled' : status === 'completed' ? 'journey_completed' : 'status_updated',
      notes: `Status changed to ${status}`,
      created_at: new Date().toISOString(),
    } as any)

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
