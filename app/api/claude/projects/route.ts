import { NextRequest, NextResponse } from 'next/server'
import { validateClaudeKey } from '@/lib/utils/claude-auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(req: NextRequest) {
  if (!validateClaudeKey(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServiceClient()
  const { data } = await supabase.from('projects').select('id, client_name, name, type, status').order('created_at', { ascending: false })
  return NextResponse.json(data)
}
