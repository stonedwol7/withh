import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const requestId = searchParams.get('requestId')
  if (!requestId) return NextResponse.json({ error: 'requestId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: reqData } = await supabase.from('requests').select('customer_id').eq('id', requestId).single()
  if (!reqData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: customer } = await supabase.from('customers').select('id').eq('auth_id', user.id).maybeSingle()
  const { data: partner } = await supabase.from('support_partners').select('id').eq('auth_id', user.id).maybeSingle()
  const { data: ops } = await supabase.from('operations_team').select('id').eq('auth_id', user.id).maybeSingle()

  const isCustomer = customer?.id === reqData.customer_id
  let isAssignedPartner = false
  if (partner) {
    const { data: assignment } = await supabase.from('assignments').select('id').eq('request_id', requestId).eq('partner_id', partner.id).maybeSingle()
    isAssignedPartner = !!assignment
  }
  const isOps = !!ops

  if (!isCustomer && !isAssignedPartner && !isOps) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('journey_messages')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { requestId, senderType, senderName, content } = body

  const { data, error } = await supabase
    .from('journey_messages')
    .insert({ request_id: requestId, sender_type: senderType, sender_name: senderName, content })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
