import Link from 'next/link'
import { getProjects } from '@/lib/db/projects'
import Topbar from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatShortDate, isOverdue } from '@/lib/utils/formatters'
import type { Project } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  projekt_std: 'Standard', projekt_cnc: 'CNC Full',
  pomiar_projekt: 'Pomiar+Proj', pomiar_projekt_montaz: 'Pomiar+Proj+Montaż',
}

export default async function ProjektyPage() {
  const projects = await getProjects()

  return (
    <>
      <Topbar title="Projekty" actions={
        <Link href="/projekty/nowy"><Button size="sm">+ Nowy projekt</Button></Link>
      } />
      <div className="p-7">
        {projects.length === 0 ? (
          <div className="text-mid text-sm">Brak projektów. <Link href="/projekty/nowy" className="text-orange">Dodaj pierwszy projekt →</Link></div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Klient', 'Typ', 'Status', 'MB', 'Wartość', 'Termin'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-[0.15em] text-mid font-semibold px-4 py-3 border-b border-paper">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p: Project) => {
                const value = p.meters && p.rate_per_mb ? p.meters * p.rate_per_mb : null
                const overdue = isOverdue(p.deadline_doc)
                return (
                  <tr key={p.id} className="hover:bg-paper cursor-pointer group">
                    <td className="px-4 py-3 border-b border-paper">
                      <Link href={`/projekty/${p.id}`} className="font-semibold text-sm group-hover:text-orange transition-colors">{p.client_name}</Link>
                      {p.name !== p.client_name && <div className="text-xs text-mid">{p.name}</div>}
                    </td>
                    <td className="px-4 py-3 border-b border-paper text-xs text-mid">{TYPE_LABELS[p.type]}</td>
                    <td className="px-4 py-3 border-b border-paper"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 border-b border-paper text-sm">{p.meters ? `${p.meters} mb` : '—'}</td>
                    <td className="px-4 py-3 border-b border-paper text-sm font-semibold">{value ? formatCurrency(value) : '—'}</td>
                    <td className={`px-4 py-3 border-b border-paper text-xs ${overdue ? 'text-orange-d font-semibold' : 'text-mid'}`}>
                      {overdue && '⚠ '}{formatShortDate(p.deadline_doc)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
