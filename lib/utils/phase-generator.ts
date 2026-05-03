import type { ProjectType, PhaseTemplate } from '@/types'

interface PhaseOptions {
  materialClientPrice?: number
  installAmount?: number
}

const LABELS: Record<string, string> = {
  A_deposit:  'Faza A — Zaliczka 50%',
  A_final:    'Faza A — Finalna 50%',
  B_material: 'Faza B — Materiały (100% z góry)',
  C_install:  'Faza C — Montaż + Nadzór',
}

export function generatePhases(
  type: ProjectType,
  designTotal: number,
  opts: PhaseOptions = {}
): PhaseTemplate[] {
  const half = Math.round(designTotal / 2 * 100) / 100

  const abPhases: PhaseTemplate[] = [
    { phase_key: 'A_deposit', label: LABELS.A_deposit, amount: half, sort_order: 0 },
    { phase_key: 'A_final',   label: LABELS.A_final,   amount: designTotal - half, sort_order: 1 },
  ]

  if (type !== 'pomiar_projekt_montaz') return abPhases

  return [
    ...abPhases,
    { phase_key: 'B_material', label: LABELS.B_material, amount: opts.materialClientPrice ?? 0, sort_order: 2 },
    { phase_key: 'C_install',  label: LABELS.C_install,  amount: opts.installAmount ?? 0,        sort_order: 3 },
  ]
}
