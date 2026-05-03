import { formatCurrency } from '@/lib/utils/formatters'
import type { MaterialCost } from '@/types'

export default function MaterialCostBlock({ cost }: { cost: MaterialCost | null }) {
  if (!cost) return null
  const margin = cost.client_price - cost.supplier_cost
  return (
    <div className="bg-paper border-l-4 border-orange px-4 py-3 mx-5 mb-4">
      <div className="text-[10px] uppercase tracking-widest font-semibold text-mid mb-2">Marża materiałowa</div>
      <div className="flex gap-6 text-sm">
        <div><span className="text-mid">Klient zapłacił: </span><strong>{formatCurrency(cost.client_price)}</strong></div>
        <div><span className="text-mid">Zakup u dostawcy: </span><strong>{formatCurrency(cost.supplier_cost)}</strong></div>
        <div><span className="text-mid">Marża: </span><strong className="text-orange">+{formatCurrency(margin)}</strong></div>
      </div>
    </div>
  )
}
