import { NextRequest, NextResponse } from 'next/server'
import { markPhasePaid } from '@/lib/db/phases'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { paid_at, paid_notes } = await req.json()
  await markPhasePaid(id, paid_at, paid_notes)
  return NextResponse.json({ ok: true })
}
