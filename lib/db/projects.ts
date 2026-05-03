import { createClient } from '@/lib/supabase/server'
import type { Project, ProjectType, ProjectStatus } from '@/types'

export async function getProjects(status?: ProjectStatus) {
  const supabase = await createClient()
  let query = supabase.from('projects').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw error
  return data as Project[]
}

export async function getProject(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error) throw error
  return data as Project
}

export interface CreateProjectInput {
  name: string
  client_name: string
  type: ProjectType
  meters?: number
  rate_per_mb?: number
  notes?: string
  deadline_doc?: string
  deadline_install?: string
}

export async function createProject(input: CreateProjectInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('projects').insert({ ...input, created_by: user!.id }).select().single()
  if (error) throw error
  return data as Project
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').update({ status }).eq('id', id)
  if (error) throw error
}
