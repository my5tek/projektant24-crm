import { formatCurrency } from '@/lib/utils/formatters'

export default function FinanceKpi({ income, expense, profit, materialMargin }: {
  income: number; expense: number; profit: number; materialMargin: number
}) {
  return (
    <div className="grid grid-cols-4 gap-px">
      {[
        { label: 'Przychody', value: formatCurrency(income), dark: false, accent: true },
        { label: 'Wydatki', value: formatCurrency(expense), dark: false, accent: false },
        { label: 'Dochód netto', value: formatCurrency(profit), dark: true, accent: false },
        { label: 'Marża materiałowa', value: formatCurrency(materialMargin), dark: false, accent: false },
      ].map(({ label, value, dark, accent }) => (
        <div key={label} className={`px-6 py-5 border-l-[3px] ${dark ? 'bg-black border-orange' : `bg-white ${accent ? 'border-orange' : 'border-mid/30'}`}`}>
          <div className={`text-[10px] uppercase tracking-[0.18em] font-semibold mb-2 ${dark ? 'text-white/40' : 'text-mid'}`}>{label}</div>
          <div className={`font-display font-extrabold text-3xl leading-none ${dark ? 'text-orange' : 'text-black'}`}>{value}</div>
        </div>
      ))}
    </div>
  )
}
