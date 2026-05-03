import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import type { Transaction } from '@/types'

export default function TransactionTable({ transactions }: { transactions: any[] }) {
  return (
    <div className="bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Data', 'Opis', 'Kategoria', 'Projekt', 'Kwota'].map(h => (
              <th key={h} className="text-left text-[10px] uppercase tracking-[0.15em] text-mid font-semibold px-4 py-3 border-b border-paper">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id} className="hover:bg-paper">
              <td className="px-4 py-3 border-b border-paper text-xs text-mid">{formatDate(t.date)}</td>
              <td className="px-4 py-3 border-b border-paper text-sm">{t.description}</td>
              <td className="px-4 py-3 border-b border-paper text-xs text-mid capitalize">{t.category}</td>
              <td className="px-4 py-3 border-b border-paper text-xs text-mid">{t.projects?.client_name ?? '—'}</td>
              <td className={`px-4 py-3 border-b border-paper font-display font-bold text-sm ${t.type === 'przychod' ? 'text-orange' : 'text-black'}`}>
                {t.type === 'przychod' ? '+' : '−'}{formatCurrency(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
