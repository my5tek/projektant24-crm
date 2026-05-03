import { ProjectStatus, TaskStatus } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  nowy:          'bg-orange/10 text-orange',
  w_toku:        'bg-black/8 text-black',
  gotowy:        'bg-paper text-mid',
  zarchiwizowany:'bg-paper text-light',
  todo:          'bg-paper text-mid',
  done:          'bg-paper text-light',
}

const STATUS_LABELS: Record<string, string> = {
  nowy: 'Nowy', w_toku: 'W toku', gotowy: 'Gotowy', zarchiwizowany: 'Archiwum',
  todo: 'Do zrobienia', done: 'Gotowe',
}

export function StatusBadge({ status }: { status: ProjectStatus | TaskStatus }) {
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 ${STATUS_STYLES[status] ?? 'bg-paper text-mid'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
