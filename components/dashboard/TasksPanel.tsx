import { formatDate, isOverdue } from '@/lib/utils/formatters'

export default function TasksPanel({ tasks, profiles }: { tasks: any[]; profiles: { id: string; display_name: string }[] }) {
  const activeTasks = tasks.filter(t => t.status !== 'done')
  return (
    <div className="bg-white">
      <div className="px-5 py-3.5 border-b border-paper">
        <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Zadania</h2>
      </div>
      <div className="grid grid-cols-2 divide-x divide-paper">
        {profiles.map(profile => {
          const userTasks = activeTasks.filter(t => t.assigned_to === profile.id).slice(0, 4)
          return (
            <div key={profile.id}>
              <div className="px-4 py-2 bg-paper border-b border-light flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: profile.display_name[0] === 'P' ? '#E8620A' : '#2C2C2C' }}>{profile.display_name[0]}</div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-mid">{profile.display_name}</span>
              </div>
              {userTasks.map((t: any) => (
                <div key={t.id} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-paper last:border-0">
                  <div className="w-3.5 h-3.5 border-2 border-light rounded-sm shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs font-medium leading-snug">{t.title}</div>
                  {t.due_date && <div className={`text-[10px] whitespace-nowrap ${isOverdue(t.due_date) ? 'text-orange-d font-semibold' : 'text-mid'}`}>{formatDate(t.due_date)}</div>}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
