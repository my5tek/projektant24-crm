import Topbar from '@/components/layout/Topbar'
import { getTasks, getProfiles } from '@/lib/db/tasks'
import { createClient } from '@/lib/supabase/server'
import TaskBoard from '@/components/tasks/TaskBoard'

export default async function ZadaniaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [tasks, profiles] = await Promise.all([getTasks(), getProfiles()])
  return (
    <>
      <Topbar title="Zadania" />
      <div className="p-7"><TaskBoard tasks={tasks} profiles={profiles} currentUserId={user!.id} /></div>
    </>
  )
}
