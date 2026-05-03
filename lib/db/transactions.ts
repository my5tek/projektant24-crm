import { createClient } from '@/lib/supabase/server'
import type { Transaction, TransactionType } from '@/types'

export async function getTransactions(filters: { projectId?: string; month?: string } = {}) {
  const supabase = await createClient()
  let query = supabase.from('transactions').select('*').order('date', { ascending: false })
  if (filters.projectId) query = query.eq('project_id', filters.projectId)
  if (filters.month) {
    const [year, month] = filters.month.split('-')
    query = query.gte('date', `${year}-${month}-01`).lte('date', `${year}-${month}-31`)
  }
  const { data, error } = await query
  if (error) throw error
  return data as Transaction[]
}

export async function createTransaction(input: {
  type: TransactionType; amount: number; description: string;
  project_id?: string; category?: string; date: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('transactions').insert({ ...input, category: input.category ?? 'inne', created_by: user!.id }).select().single()
  if (error) throw error
  return data as Transaction
}

export async function getFinanceSummary(month: string) {
  const transactions = await getTransactions({ month })
  const income  = transactions.filter(t => t.type === 'przychod').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'wydatek').reduce((s, t) => s + t.amount, 0)
  return { income, expense, profit: income - expense }
}
