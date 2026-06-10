import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let query = supabase.from('requests').select('*')

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  const { data: partner } = await supabase
    .from('support_partners')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  const { data: ops } = await supabase
    .from('operations_team')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (customer) {
    query = query.eq('customer_id', customer.id)
  } else if (partner) {
    const { data: assignments } = await supabase
      .from('assignments')
      .select('request_id')
      .eq('partner_id', partner.id)
    const ids = assignments?.map((a) => a.request_id) || []
    query = query.in('id', ids)
  } else if (!ops) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!customer) return NextResponse.json({ error: 'Only customers can create requests' }, { status: 403 })

  const body = await request.json()

  const { data, error } = await supabase
    .from('requests')
    .insert({ ...body, customer_id: customer.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
