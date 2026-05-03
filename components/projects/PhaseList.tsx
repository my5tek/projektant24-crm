'use client'
import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import type { PaymentPhase } from '@/types'

export default function PhaseList({ phases, projectId }: { phases: PaymentPhase[]; projectId: string }) {
  const [localPhases, setLocalPhases] = useState(phases)
  const [markingId, setMarkingId] = useState<string | null>(null)

  async function markPaid(phase: PaymentPhase) {
    setMarkingId(phase.id)
    await fetch(`/api/phases/${phase.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid_at: new Date().toISOString().slice(0, 10) }),
    })
    setLocalPhases(prev => prev.map(p => p.id === phase.id ? { ...p, paid: true, paid_at: new Date().toISOString().slice(0, 10) } : p))
    setMarkingId(null)
  }

  return (
    <div className="bg-white">
      <div className="px-5 py-3.5 border-b border-paper flex items-center justify-between">
        <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Harmonogram płatności</h2>
        <span className="text-xs text-mid">{localPhases.filter(p => p.paid).length}/{localPhases.length} opłacone</span>
      </div>
      {localPhases.map(phase => (
        <div key={phase.id} className="border-b border-paper last:border-0">
          <div className="flex items-center gap-4 px-5 py-3.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0 ${
              phase.paid ? 'bg-orange text-white' : phase.phase_key.startsWith('C') ? 'bg-black text-orange border-2 border-orange' : 'bg-paper text-mid'
            }`}>
              {phase.phase_key[0]}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{phase.label}</div>
              {phase.paid_at && <div className="text-xs text-mid mt-0.5">Opłacone: {formatDate(phase.paid_at)}</div>}
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-base">{formatCurrency(phase.amount)}</div>
              {phase.paid ? (
                <div className="text-[10px] font-semibold uppercase tracking-wide text-orange mt-0.5">✓ Opłacone</div>
              ) : (
                <button onClick={() => markPaid(phase)} disabled={markingId === phase.id}
                  className="text-[10px] font-semibold uppercase tracking-wide text-mid hover:text-orange transition-colors mt-0.5 disabled:opacity-50">
                  {markingId === phase.id ? '...' : 'Oznacz jako opłacone'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
