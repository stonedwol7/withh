import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PUBLIC_FIELDS = 'id, name, bio, languages, rating, completed_journeys, specializations, availability_status, location'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const availableOnly = searchParams.get('available')

    let query = supabase.from('support_partners').select(PUBLIC_FIELDS)
    if (availableOnly !== 'all') query = query.eq('availability_status', 'available')

    const { data, error } = await query.order('rating', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }
}
