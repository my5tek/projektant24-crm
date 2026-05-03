import Topbar from '@/components/layout/Topbar'
import KpiRow from '@/components/dashboard/KpiRow'
import PaymentSchedule from '@/components/dashboard/PaymentSchedule'
import TasksPanel from '@/components/dashboard/TasksPanel'
import { StatusBadge } from '@/components/ui/Badge'
import { getProjects } from '@/lib/db/projects'
import { getFinanceSummary } from '@/lib/db/transactions'
import { getTasks, getProfiles } from '@/lib/db/tasks'
import { createClient } from '@/lib/supabase/server'
import { formatShortDate, isOverdue } from '@/lib/utils/formatters'
import Link from 'next/link'

const TYPE_SHORT: Record<string, string> = {
  projekt_std: 'Standard', projekt_cnc: 'CNC', pomiar_projekt: 'P+Proj', pomiar_projekt_montaz: 'P+Proj+M'
}

export default async function DashboardPage() {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const today = now.toISOString().slice(0, 10)

  let supabase
  try {
    supabase = await createClient()
  } catch (err: any) {
    return (
      <>
        <Topbar title="Dashboard" />
        <div className="p-7">
          <div className="bg-red-900 border border-red-500 p-4 rounded text-white">
            <h2 className="font-bold text-lg mb-2">Błąd tworzenia klienta Supabase</h2>
            <p className="text-red-300 text-sm">{err?.message || 'Nieznany błąd'}</p>
            <p className="text-red-400 text-xs mt-2">URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p className="text-red-400 text-xs">Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0,20)}...</p>
          </div>
        </div>
      </>
    )
  }

  const [projects, summary, tasks, profiles] = await Promise.all([
    getProjects(),
    getFinanceSummary(month),
    getTasks(),
    getProfiles(),
  ])

  const { data: unpaidPhases } = await supabase
    .from('payment_phases').select('*, projects(client_name)').eq('paid', false).order('sort_order')

  const tasksDue = tasks.filter((t: any) => t.status !== 'done' && (t.due_date === today || isOverdue(t.due_date))).length
  const activeProjects = projects.filter(p => p.status !== 'zarchiwizowany')

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-7 flex flex-col gap-5">
        <KpiRow income={summary.income} expense={summary.expense} profit={summary.profit} tasksDue={tasksDue} />

        <div className="grid grid-cols-[1fr_340px] gap-5">
          <div className="bg-white">
            <div className="px-5 py-3.5 border-b border-paper flex justify-between items-center">
              <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Aktywne projekty</h2>
              <Link href="/projekty/nowy" className="text-[11px] font-bold uppercase tracking-widest text-white bg-orange px-3 py-1.5 hover:bg-orange-d transition-colors">+ Nowy</Link>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>{['Klient','Typ','Status','Termin'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-[0.15em] text-mid font-semibold px-4 py-2.5 border-b border-paper">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {activeProjects.slice(0, 6).map(p => (
                  <tr key={p.id} className="hover:bg-paper">
                    <td className="px-4 py-2.5 border-b border-paper">
                      <Link href={`/projekty/${p.id}`} className="text-sm font-semibold hover:text-orange transition-colors">{p.client_name}</Link>
                    </td>
                    <td className="px-4 py-2.5 border-b border-paper text-xs text-mid">{TYPE_SHORT[p.type]}</td>
                    <td className="px-4 py-2.5 border-b border-paper"><StatusBadge status={p.status} /></td>
                    <td className={`px-4 py-2.5 border-b border-paper text-xs ${isOverdue(p.deadline_doc) ? 'text-orange-d font-semibold' : 'text-mid'}`}>
                      {isOverdue(p.deadline_doc) && '⚠ '}{formatShortDate(p.deadline_doc)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaymentSchedule unpaidPhases={(unpaidPhases ?? []) as any} />
        </div>

        <TasksPanel tasks={tasks} profiles={profiles} />
      </div>
    </>
  )
}