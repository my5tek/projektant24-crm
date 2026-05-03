import { createClient } from '@/lib/supabase/server'
import type { Task, TaskStatus } from '@/types'

export async function getTasks(filters: { projectId?: string; assignedTo?: string; status?: TaskStatus } = {}) {
  const supabase = await createClient()
  let query = supabase.from('tasks')
    .select('*, profiles(display_name), projects(client_name)')
    .order('due_date', { ascending: true, nullsFirst: false })
  if (filters.projectId) query = query.eq('project_id', filters.projectId)
  if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
  if (filters.status) query = query.eq('status', filters.status)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createTask(input: {
  title: string; project_id?: string; assigned_to?: string; due_date?: string; description?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('tasks').insert({ ...input, created_by: user!.id }).select().single()
  if (error) throw error
  return data as Task
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
  if (error) throw error
}

export async function getProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) throw error
  return data as { id: string; display_name: string }[]
}
