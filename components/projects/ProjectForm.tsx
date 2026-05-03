'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import type { ProjectType } from '@/types'

const TYPE_OPTIONS: { value: ProjectType; label: string; defaultRate: number }[] = [
  { value: 'projekt_std',          label: 'Projekt technologiczny Standard', defaultRate: 100 },
  { value: 'projekt_cnc',          label: 'Projekt technologiczny CNC Full', defaultRate: 150 },
  { value: 'pomiar_projekt',       label: 'Pomiar + Projekt',                defaultRate: 150 },
  { value: 'pomiar_projekt_montaz', label: 'Pomiar + Projekt + Montaż',      defaultRate: 150 },
]

export default function ProjectForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<ProjectType>('projekt_std')
  const [meters, setMeters] = useState('')
  const [ratePerMb, setRatePerMb] = useState('100')

  function handleTypeChange(t: ProjectType) {
    setType(t)
    const opt = TYPE_OPTIONS.find(o => o.value === t)
    if (opt) setRatePerMb(String(opt.defaultRate))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      client_name:     fd.get('client_name') as string,
      name:            (fd.get('name') as string) || fd.get('client_name') as string,
      type,
      meters:          meters ? parseFloat(meters) : null,
      rate_per_mb:     ratePerMb ? parseFloat(ratePerMb) : null,
      notes:           fd.get('notes') as string || null,
      deadline_doc:    fd.get('deadline_doc') as string || null,
      deadline_install: fd.get('deadline_install') as string || null,
      material_client_price: fd.get('material_client_price') ? parseFloat(fd.get('material_client_price') as string) : null,
      install_amount: fd.get('install_amount') ? parseFloat(fd.get('install_amount') as string) : null,
    }
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (data.id) router.push(`/projekty/${data.id}`)
    else setLoading(false)
  }

  const isType3 = type === 'pomiar_projekt_montaz'
  const hasMeasurement = type === 'pomiar_projekt' || isType3
  const totalDesign = meters && ratePerMb ? parseFloat(meters) * parseFloat(ratePerMb) + (hasMeasurement ? 300 : 0) : null

  return (
    <form onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-5">
      <Field label="Nazwa klienta *">
        <input name="client_name" required className={INPUT} />
      </Field>
      <Field label="Opis projektu (opcjonalnie)">
        <input name="name" placeholder="np. Garderoba + Kuchnia" className={INPUT} />
      </Field>
      <Field label="Typ projektu *">
        <select value={type} onChange={e => handleTypeChange(e.target.value as ProjectType)} className={INPUT}>
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Metry bieżące (mb)">
          <input type="number" step="0.01" value={meters} onChange={e => setMeters(e.target.value)} className={INPUT} />
        </Field>
        <Field label="Stawka zł/mb">
          <input type="number" step="0.01" value={ratePerMb} onChange={e => setRatePerMb(e.target.value)} className={INPUT} />
        </Field>
      </div>
      {totalDesign && (
        <div className="bg-paper border-l-2 border-orange px-4 py-3 text-sm">
          Szacowana wartość projektu (A): <strong>{new Intl.NumberFormat('pl-PL').format(totalDesign)} zł</strong>
        </div>
      )}
      {isType3 && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Wartość materiałów (klient)">
            <input type="number" step="0.01" name="material_client_price" placeholder="0" className={INPUT} />
          </Field>
          <Field label="Wartość montażu + nadzoru">
            <input type="number" step="0.01" name="install_amount" placeholder="0" className={INPUT} />
          </Field>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Termin dokumentacji">
          <input type="date" name="deadline_doc" className={INPUT} />
        </Field>
        {isType3 && (
          <Field label="Termin montażu">
            <input type="date" name="deadline_install" className={INPUT} />
          </Field>
        )}
      </div>
      <Field label="Notatki / brief">
        <textarea name="notes" rows={3} className={INPUT} />
      </Field>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Zapisuję...' : 'Utwórz projekt'}</Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anuluj</Button>
      </div>
    </form>
  )
}

const INPUT = 'w-full border border-light bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange'
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest font-semibold text-mid mb-1.5">{label}</label>
      {children}
    </div>
  )
}
