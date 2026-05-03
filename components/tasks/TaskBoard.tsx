'use client'
import { useState } from 'react'
import { formatDate, isOverdue } from '@/lib/utils/formatters'

type Filter = 'all' | 'today' | 'overdue'

export default function TaskBoard({ tasks, profiles, currentUserId }: {
  tasks: any[]; profiles: { id: string; display_name: string }[]; currentUserId: string
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const today = new Date().toISOString().slice(0, 10)

  function filterTasks(t: any) {
    if (t.status === 'done') return false
    if (filter === 'today') return t.due_date === today
    if (filter === 'overdue') return isOverdue(t.due_date)
    return true
  }

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {(['all', 'today', 'overdue'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 border transition-colors ${
              filter === f ? 'bg-black text-white border-black' : 'bg-white text-mid border-light hover:border-black hover:text-black'
            }`}>
            {f === 'all' ? 'Wszystkie' : f === 'today' ? 'Dziś' : 'Zaległe'}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-5">
        {profiles.map(profile => {
          const userTasks = tasks.filter(t => t.assigned_to === profile.id && filterTasks(t))
          const initial = profile.display_name[0]
          const isMe = profile.id === currentUserId
          return (
            <div key={profile.id} className="bg-white">
              <div className="px-4 py-3 bg-paper border-b border-light flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isMe ? 'bg-orange' : 'bg-dark'}`}>{initial}</div>
                <span className="text-[11px] uppercase tracking-widest font-semibold text-mid">{profile.display_name}</span>
                <span className="ml-auto text-[11px] text-mid">{userTasks.length} zadań</span>
              </div>
              {userTasks.length === 0 ? (
                <div className="px-4 py-4 text-sm text-mid">Brak zadań.</div>
              ) : userTasks.map((t: any) => (
                <div key={t.id} className="flex items-start gap-3 px-4 py-3 border-b border-paper last:border-0">
                  <div className="w-4 h-4 border-2 border-light rounded-sm shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{t.title}</div>
                    {t.projects?.client_name && <div className="text-xs text-orange mt-0.5">{t.projects.client_name}</div>}
                  </div>
                  {t.due_date && <div className={`text-xs whitespace-nowrap ${isOverdue(t.due_date) ? 'text-orange-d font-semibold' : 'text-mid'}`}>
                    {isOverdue(t.due_date) && '⚠ '}{formatDate(t.due_date)}
                  </div>}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
