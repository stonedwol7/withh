import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { partnerId } = await request.json()
  if (!partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 })

  const adminClient = await createAdminClient()

  const { data: assignment, error: assignErr } = await adminClient
    .from('assignments')
    .insert({ request_id: id, partner_id: partnerId, assigned_by: user.id, status: 'assigned' })
    .select()
    .single()

  if (assignErr) return NextResponse.json({ error: assignErr.message }, { status: 500 })

  await adminClient
    .from('requests')
    .update({ status: 'partner_assigned', updated_at: new Date().toISOString() })
    .eq('id', id)

  await adminClient
    .from('journey_events')
    .insert({ request_id: id, event_type: 'partner_assigned', notes: 'Support partner assigned to request' })

  return NextResponse.json(assignment)
}
