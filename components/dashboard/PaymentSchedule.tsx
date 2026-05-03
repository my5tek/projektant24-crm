import { formatCurrency } from '@/lib/utils/formatters'
import type { PaymentPhase } from '@/types'

export default function PaymentSchedule({ unpaidPhases }: { unpaidPhases: (PaymentPhase & { projects: { client_name: string } })[] }) {
  const total = unpaidPhases.reduce((s, p) => s + p.amount, 0)
  return (
    <div className="bg-white">
      <div className="px-5 py-3.5 border-b border-paper flex justify-between items-center">
        <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Do otrzymania</h2>
        <span className="text-[10px] uppercase tracking-widest text-orange font-semibold">{unpaidPhases.length} płatności</span>
      </div>
      {unpaidPhases.slice(0, 5).map(phase => (
        <div key={phase.id} className="flex items-center gap-3 px-4 py-3 border-b border-paper last:border-0">
          <div className="w-0.5 h-9 bg-orange rounded shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-semibold">{phase.projects?.client_name}</div>
            <div className="text-[11px] text-mid mt-0.5">{phase.label}</div>
          </div>
          <div className="font-display font-bold text-base text-orange">{formatCurrency(phase.amount)}</div>
        </div>
      ))}
      <div className="px-4 py-3 bg-paper flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-mid">Łącznie oczekuje</span>
        <span className="font-display font-bold text-xl text-orange">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
