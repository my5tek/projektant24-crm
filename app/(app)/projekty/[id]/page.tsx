import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/lib/db/projects'
import { getPhases } from '@/lib/db/phases'
import { getTasks } from '@/lib/db/tasks'
import { getTransactions } from '@/lib/db/transactions'
import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import PhaseList from '@/components/projects/PhaseList'
import MaterialCostBlock from '@/components/projects/MaterialCostBlock'
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils/formatters'

const TYPE_LABELS: Record<string, string> = {
  projekt_std: 'Standard', projekt_cnc: 'CNC Full',
  pomiar_projekt: 'Pomiar + Projekt', pomiar_projekt_montaz: 'Pomiar + Projekt + Montaż',
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [project, phases, tasks, transactions] = await Promise.all([
    getProject(id).catch(() => null),
    getPhases(id),
    getTasks({ projectId: id }),
    getTransactions({ projectId: id }),
  ])
  if (!project) notFound()

  const { data: materialCost } = await supabase.from('material_costs')
    .select('*').eq('project_id', id).single()

  const totalValue = project.meters && project.rate_per_mb
    ? project.meters * project.rate_per_mb + (['pomiar_projekt', 'pomiar_projekt_montaz'].includes(project.type) ? 300 : 0)
    : null
  const income  = transactions.filter((t: any) => t.type === 'przychod').reduce((s: number, t: any) => s + t.amount, 0)
  const expense = transactions.filter((t: any) => t.type === 'wydatek').reduce((s: number, t: any) => s + t.amount, 0)

  return (
    <>
      <Topbar title={project.client_name} actions={
        <>
          <StatusBadge status={project.status} />
          <Link href={`/projekty/${project.id}/edytuj`}><Button variant="ghost" size="sm">Edytuj</Button></Link>
        </>
      } />
      <div className="p-7 flex flex-col gap-5">
        {/* Header */}
        <div className="bg-black relative overflow-hidden p-6" style={{backgroundImage:'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}}>
          <div className="relative z-10 flex justify-between gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-orange flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-orange" />{TYPE_LABELS[project.type]}
              </div>
              <h2 className="font-display font-bold text-3xl text-white mb-2">{project.client_name}</h2>
              <div className="flex gap-4 text-sm text-white/40">
                {project.meters && <span>📐 {project.meters} mb</span>}
                {project.deadline_doc && <span className={isOverdue(project.deadline_doc) ? 'text-orange' : ''}>📅 {formatDate(project.deadline_doc)}</span>}
                {project.notes && <span>📝 Brief dodany</span>}
              </div>
            </div>
            <div className="text-right">
              {totalValue && <div>
                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Wartość projektu</div>
                <div className="font-display font-bold text-2xl text-white">{formatCurrency(totalValue)}</div>
              </div>}
              {materialCost && <div className="mt-3">
                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Marża mat.</div>
                <div className="font-display font-bold text-lg text-orange">+{formatCurrency(materialCost.client_price - materialCost.supplier_cost)}</div>
              </div>}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1fr_320px] gap-5">
          <div className="flex flex-col gap-5">
            <PhaseList phases={phases} projectId={project.id} />
            {materialCost && <MaterialCostBlock cost={materialCost} />}

            {/* Tasks */}
            <div className="bg-white">
              <div className="px-5 py-3.5 border-b border-paper flex justify-between items-center">
                <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Zadania</h2>
                <Button size="sm">+ Dodaj</Button>
              </div>
              {tasks.length === 0 ? (
                <div className="px-5 py-4 text-sm text-mid">Brak zadań.</div>
              ) : tasks.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3 border-b border-paper last:border-0">
                  <div className={`w-4 h-4 border-2 rounded-sm shrink-0 ${t.status === 'done' ? 'bg-orange border-orange' : 'border-light'}`} />
                  <div className="flex-1 text-sm font-medium">{t.title}</div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: t.profiles?.display_name?.[0] === 'P' ? '#E8620A' : '#2C2C2C' }}>
                    {t.profiles?.display_name?.[0] ?? '?'}
                  </div>
                  {t.due_date && <div className={`text-xs ${isOverdue(t.due_date) && t.status !== 'done' ? 'text-orange-d font-semibold' : 'text-mid'}`}>{formatDate(t.due_date)}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Transactions */}
            <div className="bg-white">
              <div className="px-5 py-3.5 border-b border-paper flex justify-between items-center">
                <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Finanse</h2>
              </div>
              {transactions.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-paper last:border-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.type === 'przychod' ? 'bg-orange' : 'bg-mid'}`} />
                  <div className="flex-1">
                    <div className="text-xs font-medium">{t.description}</div>
                    <div className="text-[11px] text-mid">{formatDate(t.date)}</div>
                  </div>
                  <div className={`font-display font-bold text-sm ${t.type === 'przychod' ? 'text-orange' : 'text-black'}`}>
                    {t.type === 'przychod' ? '+' : '−'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5 bg-paper flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-mid">Saldo</span>
                <span className="font-display font-bold text-lg text-orange">{formatCurrency(income - expense)}</span>
              </div>
            </div>

            {/* Notes */}
            {project.notes && (
              <div className="bg-white">
                <div className="px-5 py-3.5 border-b border-paper"><h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Brief / Notatki</h2></div>
                <div className="px-5 py-4">
                  <p className="text-sm text-dark leading-relaxed border-l-4 border-orange pl-4 italic">{project.notes}</p>
                </div>
              </div>
            )}

            {/* Project info */}
            <div className="bg-white">
              <div className="px-5 py-3.5 border-b border-paper"><h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Dane</h2></div>
              <div className="px-5 py-4 flex flex-col gap-2.5">
                {[
                  ['Typ', TYPE_LABELS[project.type]],
                  ['Metry', project.meters ? `${project.meters} mb` : '—'],
                  ['Stawka', project.rate_per_mb ? `${project.rate_per_mb} zł/mb` : '—'],
                  ['Termin dok.', formatDate(project.deadline_doc)],
                  ['Termin montażu', formatDate(project.deadline_install)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm border-b border-paper pb-2 last:border-0">
                    <span className="text-mid">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
