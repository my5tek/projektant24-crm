'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/', label: 'Dashboard', icon: 'grid' },
  { href: '/projekty', label: 'Projekty', icon: 'calendar' },
  { href: '/finanse', label: 'Finanse', icon: 'chart' },
  { href: '/zadania', label: 'Zadania', icon: 'tasks' },
]

const ICONS: Record<string, React.ReactNode> = {
  grid: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></svg>,
  calendar: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect x="2" y="2" width="12" height="12" rx="1"/><line x1="2" y1="6" x2="14" y2="6"/><line x1="6" y1="2" x2="6" y2="6"/><line x1="10" y1="2" x2="10" y2="6"/></svg>,
  chart: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><polyline points="1,11 5,7 9,9 15,3"/><line x1="11" y1="3" x2="15" y2="3"/><line x1="15" y1="3" x2="15" y2="7"/></svg>,
  tasks: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect x="1" y="3" width="14" height="11" rx="1"/><polyline points="4,3 4,1 12,1 12,3"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="4" y1="11" x2="9" y2="11"/></svg>,
}

export default function Sidebar({ displayName }: { displayName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-[220px] bg-black flex flex-col shrink-0 min-h-screen">
      <div className="px-5 py-4 border-b-2 border-orange">
        <div className="font-wordmark text-sm text-white">PROJEKTANT<span className="text-orange">24</span></div>
        <div className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">CRM</div>
      </div>
      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center font-display font-bold text-sm text-white shrink-0">
          {displayName[0]}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{displayName}</div>
          <div className="text-[11px] text-white/35 tracking-wide">Admin</div>
        </div>
      </div>
      <nav className="py-4 flex-1">
        <div className="px-5 pb-1.5 text-[10px] uppercase tracking-[0.18em] text-white/20 font-semibold">Menu</div>
        {NAV.map(item => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium border-l-[3px] transition-colors ${active ? 'text-white border-orange bg-orange/8' : 'text-white/45 border-transparent hover:text-white hover:bg-white/4'}`}>
              <span className={active ? 'opacity-100' : 'opacity-70'}>{ICONS[item.icon]}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <button onClick={handleLogout} className="mx-5 mb-5 text-[11px] uppercase tracking-widest font-semibold text-white/25 hover:text-white/50 text-left transition-colors">
        Wyloguj
      </button>
    </aside>
  )
}
