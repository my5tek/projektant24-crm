import { NextRequest, NextResponse } from 'next/server'
import { validateClaudeKey } from '@/lib/utils/claude-auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validateClaudeKey(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { paid_at, paid_notes } = await req.json()
  const paidAt = paid_at ?? new Date().toISOString().slice(0, 10)

  const supabase = createServiceClient()

  // Fetch the phase to get amount and project_id for auto-transaction
  const { data: phase, error: fetchErr } = await supabase
    .from('payment_phases').select('*').eq('id', id).single()
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 404 })

  // Mark as paid
  const { error } = await supabase
    .from('payment_phases').update({ paid: true, paid_at: paidAt, paid_notes: paid_notes ?? null }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Auto-create income transaction
  await supabase.from('transactions').insert({
    project_id: phase.project_id,
    type: 'przychod',
    amount: phase.amount,
    description: phase.label,
    category: 'projekt',
    date: paidAt,
  })

  return NextResponse.json({ ok: true })
}
