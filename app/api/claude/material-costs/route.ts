import { NextRequest, NextResponse } from 'next/server'
import { validateClaudeKey } from '@/lib/utils/claude-auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  if (!validateClaudeKey(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  // body: { project_id, client_price, supplier_cost, date, notes? }
  const supabase = createServiceClient()

  const { data, error } = await supabase.from('material_costs').insert({
    project_id: body.project_id,
    client_price: body.client_price,
    supplier_cost: body.supplier_cost,
    date: body.date,
    notes: body.notes ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Auto-create expense transaction for supplier cost
  await supabase.from('transactions').insert({
    project_id: body.project_id,
    type: 'wydatek',
    amount: body.supplier_cost,
    description: `Zakup materiałów${body.notes ? ` — ${body.notes}` : ''}`,
    category: 'materialy',
    date: body.date,
  })

  return NextResponse.json(data)
}
