import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: reqData } = await supabase.from('requests').select('customer_id').eq('id', id).single()
  if (!reqData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: customer } = await supabase.from('customers').select('id').eq('auth_id', user.id).single()
  if (!customer || customer.id !== reqData.customer_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('requests')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
