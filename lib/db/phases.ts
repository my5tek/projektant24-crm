import { createClient } from '@/lib/supabase/server'
import type { PaymentPhase, PhaseTemplate } from '@/types'

export async function getPhases(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payment_phases').select('*').eq('project_id', projectId).order('sort_order')
  if (error) throw error
  return data as PaymentPhase[]
}

export async function createPhases(projectId: string, templates: PhaseTemplate[]) {
  const supabase = await createClient()
  const rows = templates.map(t => ({ ...t, project_id: projectId }))
  const { error } = await supabase.from('payment_phases').insert(rows)
  if (error) throw error
}

export async function markPhasePaid(id: string, paidAt: string, notes?: string) {
  const supabase = await createClient()
  const { data: phase, error: fetchErr } = await supabase
    .from('payment_phases').select('*').eq('id', id).single()
  if (fetchErr) throw fetchErr

  const { error } = await supabase
    .from('payment_phases').update({ paid: true, paid_at: paidAt, paid_notes: notes ?? null }).eq('id', id)
  if (error) throw error

  // Auto-create income transaction when phase marked as paid
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('transactions').insert({
    project_id: phase.project_id,
    type: 'przychod',
    amount: phase.amount,
    description: phase.label,
    category: 'projekt',
    date: paidAt,
    created_by: user!.id,
  })
}
