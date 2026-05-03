export type ProjectType = 'projekt_std' | 'projekt_cnc' | 'pomiar_projekt' | 'pomiar_projekt_montaz'
export type ProjectStatus = 'nowy' | 'w_toku' | 'gotowy' | 'zarchiwizowany'
export type TaskStatus = 'todo' | 'w_toku' | 'done'
export type TransactionType = 'przychod' | 'wydatek'

export interface Profile {
  id: string
  display_name: string
}

export interface Project {
  id: string
  name: string
  client_name: string
  type: ProjectType
  status: ProjectStatus
  meters: number | null
  rate_per_mb: number | null
  notes: string | null
  deadline_doc: string | null
  deadline_install: string | null
  created_by: string
  created_at: string
}

export interface PaymentPhase {
  id: string
  project_id: string
  phase_key: string
  label: string
  amount: number
  paid: boolean
  paid_at: string | null
  paid_notes: string | null
  sort_order: number
}

export interface MaterialCost {
  id: string
  project_id: string
  client_price: number
  supplier_cost: number
  date: string
  notes: string | null
}

export interface Task {
  id: string
  project_id: string | null
  title: string
  description: string | null
  assigned_to: string | null
  status: TaskStatus
  due_date: string | null
  created_by: string
  created_at: string
}

export interface Transaction {
  id: string
  project_id: string | null
  type: TransactionType
  amount: number
  description: string
  category: string
  date: string
  created_by: string
  created_at: string
}

export interface PhaseTemplate {
  phase_key: string
  label: string
  amount: number
  sort_order: number
}
