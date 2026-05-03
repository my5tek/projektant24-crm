import { describe, it, expect } from 'vitest'
import { generatePhases } from '../phase-generator'

describe('generatePhases', () => {
  it('projekt_std: generates 2 phases with 50/50 split', () => {
    const phases = generatePhases('projekt_std', 1000)
    expect(phases).toHaveLength(2)
    expect(phases[0].phase_key).toBe('A_deposit')
    expect(phases[0].amount).toBe(500)
    expect(phases[1].phase_key).toBe('A_final')
    expect(phases[1].amount).toBe(500)
  })

  it('projekt_cnc: generates 2 phases with 50/50 split', () => {
    const phases = generatePhases('projekt_cnc', 1200)
    expect(phases).toHaveLength(2)
    expect(phases[0].amount).toBe(600)
    expect(phases[1].amount).toBe(600)
  })

  it('pomiar_projekt: generates 2 phases', () => {
    const phases = generatePhases('pomiar_projekt', 1400)
    expect(phases).toHaveLength(2)
    expect(phases[0].amount).toBe(700)
  })

  it('pomiar_projekt_montaz: generates 4 phases', () => {
    const phases = generatePhases('pomiar_projekt_montaz', 1800, { materialClientPrice: 8400, installAmount: 3200 })
    expect(phases).toHaveLength(4)
    expect(phases[0].phase_key).toBe('A_deposit')
    expect(phases[0].amount).toBe(900)
    expect(phases[1].phase_key).toBe('A_final')
    expect(phases[1].amount).toBe(900)
    expect(phases[2].phase_key).toBe('B_material')
    expect(phases[2].amount).toBe(8400)
    expect(phases[3].phase_key).toBe('C_install')
    expect(phases[3].amount).toBe(3200)
  })

  it('phases have correct sort_order', () => {
    const phases = generatePhases('projekt_std', 1000)
    expect(phases[0].sort_order).toBe(0)
    expect(phases[1].sort_order).toBe(1)
  })
})
