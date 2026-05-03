import { formatCurrency } from '@/lib/utils/formatters'

export default function KpiRow({ income, expense, profit, tasksDue }: {
  income: number; expense: number; profit: number; tasksDue: number
}) {
  return (
    <div className="grid grid-cols-4 gap-px">
      <div className="bg-white border-l-[3px] border-orange px-5 py-4">
        <div className="text-[10px] uppercase tracking-widest font-semibold text-mid mb-1.5">Przychody (mies.)</div>
        <div className="font-display font-extrabold text-3xl leading-none">{formatCurrency(income)}</div>
      </div>
      <div className="bg-white border-l-[3px] border-mid/30 px-5 py-4">
        <div className="text-[10px] uppercase tracking-widest font-semibold text-mid mb-1.5">Wydatki (mies.)</div>
        <div className="font-display font-extrabold text-3xl leading-none">{formatCurrency(expense)}</div>
      </div>
      <div className="bg-black border-l-[3px] border-orange px-5 py-4">
        <div className="text-[10px] uppercase tracking-widest font-semibold text-white/40 mb-1.5">Dochód netto</div>
        <div className="font-display font-extrabold text-3xl leading-none text-orange">{formatCurrency(profit)}</div>
      </div>
      <div className="bg-white border-l-[3px] border-light px-5 py-4">
        <div className="text-[10px] uppercase tracking-widest font-semibold text-mid mb-1.5">Zadania dziś</div>
        <div className="font-display font-extrabold text-3xl leading-none">{tasksDue}</div>
      </div>
    </div>
  )
}
