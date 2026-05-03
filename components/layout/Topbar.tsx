import { ReactNode } from 'react'

export default function Topbar({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="h-[52px] bg-white border-b border-light flex items-center justify-between px-7 shrink-0">
      <h1 className="font-display font-bold text-lg tracking-tight">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
