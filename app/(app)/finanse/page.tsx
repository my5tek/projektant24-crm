import Topbar from '@/components/layout/Topbar'
import { getTransactions, getFinanceSummary } from '@/lib/db/transactions'
import { createClient } from '@/lib/supabase/server'
import FinanceKpi from '@/components/finance/FinanceKpi'
import TransactionTable from '@/components/finance/TransactionTable'

export default async function FinansePage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const sp = await searchParams
  const now = new Date()
  const month = sp.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const supabase = await createClient()

  const [summary, transactions, materialCosts] = await Promise.all([
    getFinanceSummary(month),
    getTransactions({ month }),
    supabase.from('material_costs').select('*, projects(client_name)'),
  ])

  const materialMargin = (materialCosts.data ?? []).reduce(
    (s: number, c: any) => s + (c.client_price - c.supplier_cost), 0
  )

  return (
    <>
      <Topbar title="Finanse" />
      <div className="p-7 flex flex-col gap-5">
        <FinanceKpi income={summary.income} expense={summary.expense} profit={summary.profit} materialMargin={materialMargin} />
        <TransactionTable transactions={transactions as any} />
      </div>
    </>
  )
}
