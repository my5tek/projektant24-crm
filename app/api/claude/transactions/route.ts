import { NextRequest, NextResponse } from 'next/server'
import { validateClaudeKey } from '@/lib/utils/claude-auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  if (!validateClaudeKey(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  // body: { type, amount, description, project_id?, category?, date }

  const supabase = createServiceClient()
  const { data, error } = await supabase.from('transactions').insert({
    type: body.type,
    amount: body.amount,
    description: body.description,
    project_id: body.project_id ?? null,
    category: body.category ?? 'inne',
    date: body.date,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
