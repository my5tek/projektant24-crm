import { NextRequest, NextResponse } from 'next/server'
import { createProject } from '@/lib/db/projects'
import { createPhases } from '@/lib/db/phases'
import { generatePhases } from '@/lib/utils/phase-generator'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const project = await createProject(body)

  const designTotal = (body.meters ?? 0) * (body.rate_per_mb ?? 0) +
    (['pomiar_projekt', 'pomiar_projekt_montaz'].includes(body.type) ? 300 : 0)

  const phases = generatePhases(body.type, designTotal, {
    materialClientPrice: body.material_client_price,
    installAmount: body.install_amount,
  })
  await createPhases(project.id, phases)

  return NextResponse.json(project)
}
