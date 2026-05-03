import { NextRequest, NextResponse } from 'next/server'
import { validateClaudeKey } from '@/lib/utils/claude-auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  if (!validateClaudeKey(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  // body: { title, project_id?, assigned_to_name?, due_date?, description? }

  const supabase = createServiceClient()

  // Resolve assigned_to_name → user id
  let assigned_to: string | null = null
  if (body.assigned_to_name) {
    const { data: profile } = await supabase.from('profiles').select('id').ilike('display_name', body.assigned_to_name).single()
    assigned_to = profile?.id ?? null
  }

  const { data, error } = await supabase.from('tasks').insert({
    title: body.title,
    project_id: body.project_id ?? null,
    assigned_to,
    due_date: body.due_date ?? null,
    description: body.description ?? null,
    status: 'todo',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
