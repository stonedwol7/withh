import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: partners } = await supabase
      .from('support_partners')
      .select('id')
      .eq('auth_id', user.id)
      .limit(1) as any

    if (partners && partners.length > 0) {
      redirect('/partner')
    }
  }

  redirect('/journey')
}
