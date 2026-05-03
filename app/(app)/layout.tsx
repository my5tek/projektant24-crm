import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('display_name').eq('id', user.id).single()

  return (
    <div className="flex min-h-screen">
      <Sidebar displayName={profile?.display_name ?? 'User'} />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  )
}
