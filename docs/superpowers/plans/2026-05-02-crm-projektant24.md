# CRM Projektant24 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mini CRM web app for Projektant24 — project management, payment tracking, tasks, and finances for 2 users (Przemek + Maciej).

**Architecture:** Next.js 14 App Router with Supabase (Postgres + Auth). Server Components fetch data; Server Actions handle mutations. Separate REST endpoints (`/api/claude/*`) allow Claude to manage data via CLI.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase JS v2, Vitest, @testing-library/react

**Spec:** `docs/superpowers/specs/2026-05-02-crm-projektant24-design.md`

---

## File Map

```
app/
  layout.tsx                        — root layout, fonts
  (auth)/login/page.tsx             — login form
  (app)/layout.tsx                  — app shell (auth guard + sidebar)
  (app)/page.tsx                    — dashboard
  (app)/projekty/page.tsx           — projects list
  (app)/projekty/nowy/page.tsx      — new project form
  (app)/projekty/[id]/page.tsx      — project detail
  (app)/zadania/page.tsx            — global tasks view
  (app)/finanse/page.tsx            — finances view
  api/claude/projects/route.ts      — Claude: list projects
  api/claude/tasks/route.ts         — Claude: create task
  api/claude/transactions/route.ts  — Claude: create transaction
  api/claude/phases/[id]/route.ts   — Claude: mark phase paid
  api/tasks/[id]/route.ts           — toggle task status (UI)

components/
  layout/Sidebar.tsx
  layout/Topbar.tsx
  dashboard/KpiRow.tsx
  dashboard/ProjectsTable.tsx
  dashboard/PaymentSchedule.tsx
  dashboard/TasksPanel.tsx
  projects/ProjectForm.tsx
  projects/PhaseList.tsx
  projects/MaterialCostBlock.tsx
  tasks/TaskBoard.tsx
  finance/FinanceKpi.tsx
  finance/TransactionTable.tsx
  ui/Badge.tsx
  ui/Button.tsx

lib/
  supabase/client.ts                — browser Supabase client
  supabase/server.ts                — server Supabase client (cookies)
  supabase/service.ts               — service role client (Claude API endpoints, no user session)
  db/projects.ts                    — project CRUD + queries
  db/phases.ts                      — phase CRUD, auto-generation
  db/tasks.ts                       — task CRUD
  db/transactions.ts                — transaction CRUD
  utils/formatters.ts               — currency, date helpers
  utils/phase-generator.ts          — pure fn: project type → phases array

types/index.ts                      — all TypeScript types
middleware.ts                       — auth redirect
supabase/migrations/001_initial.sql — full DB schema
```

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tailwind.config.ts`, `next.config.ts`, `.env.local.example`

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd J:/MystekOS
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --no-git
```

Expected: Next.js project created in current directory.

- [ ] **Step 2: Install Supabase and test dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

Create `vitest.setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: Create `.env.local.example`**

```bash
cat > .env.local.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLAUDE_API_KEY=your-secret-claude-api-key
EOF
```

Copy to `.env.local` and fill in real values from Supabase dashboard.

- [ ] **Step 5: Configure Tailwind with brand fonts**

Replace `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black:   '#1A1A1A',
        dark:    '#2C2C2C',
        mid:     '#6B6B6B',
        light:   '#D4D4D4',
        paper:   '#F2F0EC',
        orange:  '#E8620A',
        'orange-d': '#C0510A',
      },
      fontFamily: {
        display:  ['var(--font-barlow-condensed)', 'sans-serif'],
        body:     ['var(--font-barlow)', 'sans-serif'],
        wordmark: ['var(--font-audiowide)', 'sans-serif'],
      },
    },
  },
}
export default config
```

- [ ] **Step 6: Add Google Fonts to root layout**

Replace `app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { Audiowide, Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const audiowide = Audiowide({ weight: '400', subsets: ['latin'], variable: '--font-audiowide' })
const barlow = Barlow({ weight: ['300','400','500','600'], subsets: ['latin'], variable: '--font-barlow' })
const barlowCondensed = Barlow_Condensed({ weight: ['600','700','800'], subsets: ['latin'], variable: '--font-barlow-condensed' })

export const metadata: Metadata = { title: 'Projektant24 CRM' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className={`${audiowide.variable} ${barlow.variable} ${barlowCondensed.variable} font-body bg-paper text-black`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js project with brand config"
```

---

## Task 2: Database schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project → note URL + anon key + service role key → paste into `.env.local`.

- [ ] **Step 2: Write migration**

Create `supabase/migrations/001_initial.sql`:
```sql
-- Users are managed by Supabase Auth (auth.users)
-- We store display names in a profiles table

create table public.profiles (
  id uuid references auth.users primary key,
  display_name text not null,
  created_at timestamptz default now()
);

create type project_type as enum (
  'projekt_std', 'projekt_cnc', 'pomiar_projekt', 'pomiar_projekt_montaz'
);
create type project_status as enum ('nowy', 'w_toku', 'gotowy', 'zarchiwizowany');
create type task_status as enum ('todo', 'w_toku', 'done');
create type transaction_type as enum ('przychod', 'wydatek');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  type project_type not null,
  status project_status not null default 'nowy',
  meters decimal(6,2),
  rate_per_mb decimal(8,2),
  notes text,
  deadline_doc date,
  deadline_install date,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create table public.payment_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade,
  phase_key text not null,
  label text not null,
  amount decimal(10,2) not null default 0,
  paid boolean not null default false,
  paid_at date,
  paid_notes text,
  sort_order int not null default 0
);

create table public.material_costs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade,
  client_price decimal(10,2) not null,
  supplier_cost decimal(10,2) not null,
  date date not null,
  notes text
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete set null,
  title text not null,
  description text,
  assigned_to uuid references auth.users,
  status task_status not null default 'todo',
  due_date date,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete set null,
  type transaction_type not null,
  amount decimal(10,2) not null,
  description text not null,
  category text default 'inne',
  date date not null,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

-- RLS: all authenticated users see all rows (shared company)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.payment_phases enable row level security;
alter table public.material_costs enable row level security;
alter table public.tasks enable row level security;
alter table public.transactions enable row level security;

create policy "auth users see all" on public.profiles for all using (auth.role() = 'authenticated');
create policy "auth users see all" on public.projects for all using (auth.role() = 'authenticated');
create policy "auth users see all" on public.payment_phases for all using (auth.role() = 'authenticated');
create policy "auth users see all" on public.material_costs for all using (auth.role() = 'authenticated');
create policy "auth users see all" on public.tasks for all using (auth.role() = 'authenticated');
create policy "auth users see all" on public.transactions for all using (auth.role() = 'authenticated');
```

- [ ] **Step 3: Run migration in Supabase**

In Supabase dashboard → SQL Editor → paste contents of `001_initial.sql` → Run.

Expected: all tables created, no errors.

- [ ] **Step 4: Create user accounts in Supabase**

In Supabase dashboard → Authentication → Users → Add user:
- `przemek@projektant24.pl` + password
- `maciej@projektant24.pl` + password

Then in SQL Editor add profiles:
```sql
insert into public.profiles (id, display_name)
select id, 'Przemek' from auth.users where email = 'przemek@projektant24.pl';

insert into public.profiles (id, display_name)
select id, 'Maciej' from auth.users where email = 'maciej@projektant24.pl';
```

- [ ] **Step 5: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema and migrations"
```

---

## Task 3: TypeScript types + Supabase clients

**Files:**
- Create: `types/index.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`

- [ ] **Step 1: Write types**

Create `types/index.ts`:
```typescript
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
```

- [ ] **Step 2: Create browser Supabase client**

Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Create service role Supabase client**

Create `lib/supabase/service.ts`:
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

- [ ] **Step 4: Create server Supabase client**

Create `lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add types/ lib/
git commit -m "feat: add TypeScript types and Supabase clients"
```

---

## Task 4: Auth middleware + login page

**Files:**
- Create: `middleware.ts`, `app/(auth)/login/page.tsx`

- [ ] **Step 1: Write middleware**

Create `middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isLoginPage = request.nextUrl.pathname === '/login'

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: Create login page**

Create `app/(auth)/login/page.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Nieprawidłowy email lub hasło.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)',backgroundSize:'60px 60px'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-wordmark text-3xl text-white tracking-tight">
            PROJEKTANT<span className="text-orange">24</span>
          </div>
          <div className="text-xs text-mid uppercase tracking-widest mt-1">CRM</div>
        </div>
        <form onSubmit={handleLogin} className="bg-dark border-t-2 border-orange p-8 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-mid mb-2">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-black border border-light/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-mid mb-2">Hasło</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-black border border-light/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-orange"
            />
          </div>
          {error && <p className="text-orange text-sm">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="bg-orange text-white font-display font-bold text-sm uppercase tracking-widest py-3 hover:bg-orange-d disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify login works**

```bash
npm run dev
```

Open http://localhost:3000 → should redirect to /login → log in with `przemek@projektant24.pl` → should redirect to `/` (blank page for now).

- [ ] **Step 4: Commit**

```bash
git add middleware.ts app/
git commit -m "feat: add auth middleware and login page"
```

---

## Task 5: App layout — Sidebar + Topbar

**Files:**
- Create: `app/(app)/layout.tsx`, `components/layout/Sidebar.tsx`, `components/layout/Topbar.tsx`

- [ ] **Step 1: Create Sidebar**

Create `components/layout/Sidebar.tsx`:
```typescript
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
```

- [ ] **Step 2: Create Topbar**

Create `components/layout/Topbar.tsx`:
```typescript
import { ReactNode } from 'react'

export default function Topbar({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <header className="h-[52px] bg-white border-b border-light flex items-center justify-between px-7 shrink-0">
      <h1 className="font-display font-bold text-lg tracking-tight">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
```

- [ ] **Step 3: Create app shell layout**

Create `app/(app)/layout.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('display_name').eq('id', user.id).single()

  return (
    <div className="flex min-h-screen">
      <Sidebar displayName={profile?.display_name ?? 'User'} />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Add placeholder home page**

Create `app/(app)/page.tsx`:
```typescript
import Topbar from '@/components/layout/Topbar'
export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-7 text-mid">Dashboard — coming soon</div>
    </>
  )
}
```

- [ ] **Step 5: Verify layout renders**

```bash
npm run dev
```

Log in → should see sidebar with brand colors + "Dashboard — coming soon".

- [ ] **Step 6: Commit**

```bash
git add app/ components/
git commit -m "feat: app shell layout with sidebar and topbar"
```

---

## Task 6: Phase generator utility (pure, tested)

**Files:**
- Create: `lib/utils/phase-generator.ts`, `lib/utils/formatters.ts`
- Test: `lib/utils/__tests__/phase-generator.test.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/utils/__tests__/phase-generator.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { generatePhases } from '../phase-generator'

describe('generatePhases', () => {
  it('projekt_std: generates 2 phases with 50/50 split', () => {
    const phases = generatePhases('projekt_std', 1000)
    expect(phases).toHaveLength(2)
    expect(phases[0].phase_key).toBe('A_deposit')
    expect(phases[0].amount).toBe(500)
    expect(phases[1].phase_key).toBe('A_final')
    expect(phases[1].amount).toBe(500)
  })

  it('projekt_cnc: generates 2 phases with 50/50 split', () => {
    const phases = generatePhases('projekt_cnc', 1200)
    expect(phases).toHaveLength(2)
    expect(phases[0].amount).toBe(600)
    expect(phases[1].amount).toBe(600)
  })

  it('pomiar_projekt: generates 2 phases', () => {
    const phases = generatePhases('pomiar_projekt', 1400)
    expect(phases).toHaveLength(2)
    expect(phases[0].amount).toBe(700)
  })

  it('pomiar_projekt_montaz: generates 4 phases', () => {
    const phases = generatePhases('pomiar_projekt_montaz', 1800, { materialClientPrice: 8400, installAmount: 3200 })
    expect(phases).toHaveLength(4)
    expect(phases[0].phase_key).toBe('A_deposit')
    expect(phases[0].amount).toBe(900)
    expect(phases[1].phase_key).toBe('A_final')
    expect(phases[1].amount).toBe(900)
    expect(phases[2].phase_key).toBe('B_material')
    expect(phases[2].amount).toBe(8400)
    expect(phases[3].phase_key).toBe('C_install')
    expect(phases[3].amount).toBe(3200)
  })

  it('phases have correct sort_order', () => {
    const phases = generatePhases('projekt_std', 1000)
    expect(phases[0].sort_order).toBe(0)
    expect(phases[1].sort_order).toBe(1)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- lib/utils/__tests__/phase-generator.test.ts
```

Expected: FAIL — `generatePhases` not found.

- [ ] **Step 3: Implement phase generator**

Create `lib/utils/phase-generator.ts`:
```typescript
import type { ProjectType, PhaseTemplate } from '@/types'

interface PhaseOptions {
  materialClientPrice?: number
  installAmount?: number
}

const LABELS: Record<string, string> = {
  A_deposit:  'Faza A — Zaliczka 50%',
  A_final:    'Faza A — Finalna 50%',
  B_material: 'Faza B — Materiały (100% z góry)',
  C_install:  'Faza C — Montaż + Nadzór',
}

export function generatePhases(
  type: ProjectType,
  designTotal: number,
  opts: PhaseOptions = {}
): PhaseTemplate[] {
  const half = Math.round(designTotal / 2 * 100) / 100

  const abPhases: PhaseTemplate[] = [
    { phase_key: 'A_deposit', label: LABELS.A_deposit, amount: half, sort_order: 0 },
    { phase_key: 'A_final',   label: LABELS.A_final,   amount: designTotal - half, sort_order: 1 },
  ]

  if (type !== 'pomiar_projekt_montaz') return abPhases

  return [
    ...abPhases,
    { phase_key: 'B_material', label: LABELS.B_material, amount: opts.materialClientPrice ?? 0, sort_order: 2 },
    { phase_key: 'C_install',  label: LABELS.C_install,  amount: opts.installAmount ?? 0,        sort_order: 3 },
  ]
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm run test:run -- lib/utils/__tests__/phase-generator.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Create formatters**

Create `lib/utils/formatters.ts`:
```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 0 }).format(amount)
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/
git commit -m "feat: phase generator utility with tests, formatters"
```

---

## Task 7: DB layer — projects, phases, tasks, transactions

**Files:**
- Create: `lib/db/projects.ts`, `lib/db/phases.ts`, `lib/db/tasks.ts`, `lib/db/transactions.ts`

- [ ] **Step 1: Projects DB**

Create `lib/db/projects.ts`:
```typescript
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
```

- [ ] **Step 2: Phases DB**

Create `lib/db/phases.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import type { PaymentPhase, PhaseTemplate } from '@/types'

export async function getPhases(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payment_phases').select('*').eq('project_id', projectId).order('sort_order')
  if (error) throw error
  return data as PaymentPhase[]
}

export async function createPhases(projectId: string, templates: PhaseTemplate[]) {
  const supabase = await createClient()
  const rows = templates.map(t => ({ ...t, project_id: projectId }))
  const { error } = await supabase.from('payment_phases').insert(rows)
  if (error) throw error
}

export async function markPhasePaid(id: string, paidAt: string, notes?: string) {
  const supabase = await createClient()
  const { data: phase, error: fetchErr } = await supabase
    .from('payment_phases').select('*').eq('id', id).single()
  if (fetchErr) throw fetchErr

  const { error } = await supabase
    .from('payment_phases').update({ paid: true, paid_at: paidAt, paid_notes: notes ?? null }).eq('id', id)
  if (error) throw error

  // Auto-create transaction
  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('transactions').insert({
    project_id: phase.project_id,
    type: 'przychod',
    amount: phase.amount,
    description: phase.label,
    category: 'projekt',
    date: paidAt,
    created_by: user!.id,
  })
}
```

- [ ] **Step 3: Tasks DB**

Create `lib/db/tasks.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import type { Task, TaskStatus } from '@/types'

export async function getTasks(filters: { projectId?: string; assignedTo?: string; status?: TaskStatus } = {}) {
  const supabase = await createClient()
  let query = supabase.from('tasks').select('*, profiles(display_name)').order('due_date', { ascending: true, nullsFirst: false })
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
```

- [ ] **Step 4: Transactions DB**

Create `lib/db/transactions.ts`:
```typescript
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
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/
git commit -m "feat: database layer — projects, phases, tasks, transactions"
```

---

## Task 8: UI atoms

**Files:**
- Create: `components/ui/Badge.tsx`, `components/ui/Button.tsx`

- [ ] **Step 1: Badge component**

Create `components/ui/Badge.tsx`:
```typescript
import { ProjectStatus, TaskStatus } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  nowy:          'bg-orange/10 text-orange',
  w_toku:        'bg-black/8 text-black',
  gotowy:        'bg-paper text-mid',
  zarchiwizowany:'bg-paper text-light',
  todo:          'bg-paper text-mid',
  done:          'bg-paper text-light',
}

const STATUS_LABELS: Record<string, string> = {
  nowy: 'Nowy', w_toku: 'W toku', gotowy: 'Gotowy', zarchiwizowany: 'Archiwum',
  todo: 'Do zrobienia', done: 'Gotowe',
}

export function StatusBadge({ status }: { status: ProjectStatus | TaskStatus }) {
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 ${STATUS_STYLES[status] ?? 'bg-paper text-mid'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
```

- [ ] **Step 2: Button component**

Create `components/ui/Button.tsx`:
```typescript
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const base = 'font-display font-bold uppercase tracking-widest transition-colors disabled:opacity-50'
  const variants = {
    primary: 'bg-orange text-white hover:bg-orange-d',
    ghost: 'bg-transparent text-mid border border-light hover:border-black hover:text-black',
  }
  const sizes = { sm: 'text-[11px] px-3 py-1.5', md: 'text-xs px-4 py-2' }
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/
git commit -m "feat: UI atoms — Badge, Button"
```

---

## Task 9: Projects list + create

**Files:**
- Create: `app/(app)/projekty/page.tsx`, `app/(app)/projekty/nowy/page.tsx`, `components/projects/ProjectForm.tsx`

- [ ] **Step 1: Projects list page**

Create `app/(app)/projekty/page.tsx`:
```typescript
import Link from 'next/link'
import { getProjects } from '@/lib/db/projects'
import Topbar from '@/components/layout/Topbar'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatShortDate, isOverdue } from '@/lib/utils/formatters'
import type { Project } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  projekt_std: 'Standard', projekt_cnc: 'CNC Full',
  pomiar_projekt: 'Pomiar+Proj', pomiar_projekt_montaz: 'Pomiar+Proj+Montaż',
}

export default async function ProjektyPage() {
  const projects = await getProjects()

  return (
    <>
      <Topbar title="Projekty" actions={
        <Link href="/projekty/nowy"><Button size="sm">+ Nowy projekt</Button></Link>
      } />
      <div className="p-7">
        {projects.length === 0 ? (
          <div className="text-mid text-sm">Brak projektów. <Link href="/projekty/nowy" className="text-orange">Dodaj pierwszy projekt →</Link></div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Klient', 'Typ', 'Status', 'MB', 'Wartość', 'Termin'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-[0.15em] text-mid font-semibold px-4 py-3 border-b border-paper">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p: Project) => {
                const value = p.meters && p.rate_per_mb ? p.meters * p.rate_per_mb : null
                const overdue = isOverdue(p.deadline_doc)
                return (
                  <tr key={p.id} className="hover:bg-paper cursor-pointer group">
                    <td className="px-4 py-3 border-b border-paper">
                      <Link href={`/projekty/${p.id}`} className="font-semibold text-sm group-hover:text-orange transition-colors">{p.client_name}</Link>
                      {p.name !== p.client_name && <div className="text-xs text-mid">{p.name}</div>}
                    </td>
                    <td className="px-4 py-3 border-b border-paper text-xs text-mid">{TYPE_LABELS[p.type]}</td>
                    <td className="px-4 py-3 border-b border-paper"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 border-b border-paper text-sm">{p.meters ? `${p.meters} mb` : '—'}</td>
                    <td className="px-4 py-3 border-b border-paper text-sm font-semibold">{value ? formatCurrency(value) : '—'}</td>
                    <td className={`px-4 py-3 border-b border-paper text-xs ${overdue ? 'text-orange-d font-semibold' : 'text-mid'}`}>
                      {overdue && '⚠ '}{formatShortDate(p.deadline_doc)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Project form component**

Create `components/projects/ProjectForm.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import type { ProjectType } from '@/types'

const TYPE_OPTIONS: { value: ProjectType; label: string; defaultRate: number }[] = [
  { value: 'projekt_std',          label: 'Projekt technologiczny Standard', defaultRate: 100 },
  { value: 'projekt_cnc',          label: 'Projekt technologiczny CNC Full', defaultRate: 150 },
  { value: 'pomiar_projekt',       label: 'Pomiar + Projekt',                defaultRate: 150 },
  { value: 'pomiar_projekt_montaz', label: 'Pomiar + Projekt + Montaż',      defaultRate: 150 },
]

export default function ProjectForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<ProjectType>('projekt_std')
  const [meters, setMeters] = useState('')
  const [ratePerMb, setRatePerMb] = useState('100')

  function handleTypeChange(t: ProjectType) {
    setType(t)
    const opt = TYPE_OPTIONS.find(o => o.value === t)
    if (opt) setRatePerMb(String(opt.defaultRate))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      client_name:     fd.get('client_name') as string,
      name:            (fd.get('name') as string) || fd.get('client_name') as string,
      type,
      meters:          meters ? parseFloat(meters) : null,
      rate_per_mb:     ratePerMb ? parseFloat(ratePerMb) : null,
      notes:           fd.get('notes') as string || null,
      deadline_doc:    fd.get('deadline_doc') as string || null,
      deadline_install: fd.get('deadline_install') as string || null,
    }
    const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    if (data.id) router.push(`/projekty/${data.id}`)
    else setLoading(false)
  }

  const isType3 = type === 'pomiar_projekt_montaz'
  const totalDesign = meters && ratePerMb ? parseFloat(meters) * parseFloat(ratePerMb) + (type === 'pomiar_projekt' || isType3 ? 300 : 0) : null

  return (
    <form onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-5">
      <Field label="Nazwa klienta *">
        <input name="client_name" required className={INPUT} />
      </Field>
      <Field label="Opis projektu (opcjonalnie)">
        <input name="name" placeholder="np. Garderoba + Kuchnia" className={INPUT} />
      </Field>
      <Field label="Typ projektu *">
        <select value={type} onChange={e => handleTypeChange(e.target.value as ProjectType)} className={INPUT}>
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Metry bieżące (mb)">
          <input type="number" step="0.01" value={meters} onChange={e => setMeters(e.target.value)} className={INPUT} />
        </Field>
        <Field label="Stawka zł/mb">
          <input type="number" step="0.01" value={ratePerMb} onChange={e => setRatePerMb(e.target.value)} className={INPUT} />
        </Field>
      </div>
      {totalDesign && (
        <div className="bg-paper border-l-2 border-orange px-4 py-3 text-sm">
          Szacowana wartość projektu (A): <strong>{new Intl.NumberFormat('pl-PL').format(totalDesign)} zł</strong>
        </div>
      )}
      {isType3 && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Wartość materiałów (klient)">
            <input type="number" step="0.01" name="material_client_price" placeholder="0" className={INPUT} />
          </Field>
          <Field label="Wartość montażu + nadzoru">
            <input type="number" step="0.01" name="install_amount" placeholder="0" className={INPUT} />
          </Field>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Termin dokumentacji">
          <input type="date" name="deadline_doc" className={INPUT} />
        </Field>
        {isType3 && (
          <Field label="Termin montażu">
            <input type="date" name="deadline_install" className={INPUT} />
          </Field>
        )}
      </div>
      <Field label="Notatki / brief">
        <textarea name="notes" rows={3} className={INPUT} />
      </Field>
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>{loading ? 'Zapisuję...' : 'Utwórz projekt'}</Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Anuluj</Button>
      </div>
    </form>
  )
}

const INPUT = 'w-full border border-light bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange'
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest font-semibold text-mid mb-1.5">{label}</label>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: New project page + API route**

Create `app/(app)/projekty/nowy/page.tsx`:
```typescript
import Topbar from '@/components/layout/Topbar'
import ProjectForm from '@/components/projects/ProjectForm'

export default function NowyProjektPage() {
  return (
    <>
      <Topbar title="Nowy projekt" />
      <div className="p-7"><ProjectForm /></div>
    </>
  )
}
```

Create `app/api/projects/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createProject } from '@/lib/db/projects'
import { createPhases } from '@/lib/db/phases'
import { generatePhases } from '@/lib/utils/phase-generator'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const project = await createProject(body)

  const designTotal = (body.meters ?? 0) * (body.rate_per_mb ?? 0) +
    (['pomiar_projekt', 'pomiar_projekt_montaz'].includes(body.type) ? 300 : 0)

  const phases = generatePhases(body.type, designTotal, {
    materialClientPrice: body.material_client_price,
    installAmount: body.install_amount,
  })
  await createPhases(project.id, phases)

  return NextResponse.json(project)
}
```

- [ ] **Step 4: Commit**

```bash
git add app/ components/ lib/
git commit -m "feat: projects list, create form, API route with phase auto-generation"
```

---

## Task 10: Project detail page

**Files:**
- Create: `app/(app)/projekty/[id]/page.tsx`, `components/projects/PhaseList.tsx`, `components/projects/MaterialCostBlock.tsx`

- [ ] **Step 1: Phase list component**

Create `components/projects/PhaseList.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import type { PaymentPhase } from '@/types'

export default function PhaseList({ phases, projectId }: { phases: PaymentPhase[]; projectId: string }) {
  const [localPhases, setLocalPhases] = useState(phases)
  const [markingId, setMarkingId] = useState<string | null>(null)

  async function markPaid(phase: PaymentPhase) {
    setMarkingId(phase.id)
    await fetch(`/api/phases/${phase.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid_at: new Date().toISOString().slice(0, 10) }),
    })
    setLocalPhases(prev => prev.map(p => p.id === phase.id ? { ...p, paid: true, paid_at: new Date().toISOString().slice(0, 10) } : p))
    setMarkingId(null)
  }

  return (
    <div className="bg-white">
      <div className="px-5 py-3.5 border-b border-paper flex items-center justify-between">
        <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Harmonogram płatności</h2>
        <span className="text-xs text-mid">{localPhases.filter(p => p.paid).length}/{localPhases.length} opłacone</span>
      </div>
      {localPhases.map(phase => (
        <div key={phase.id} className="border-b border-paper last:border-0">
          <div className="flex items-center gap-4 px-5 py-3.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0 ${
              phase.paid ? 'bg-orange text-white' : phase.phase_key.startsWith('C') ? 'bg-black text-orange border-2 border-orange' : 'bg-paper text-mid'
            }`}>
              {phase.phase_key[0]}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{phase.label}</div>
              {phase.paid_at && <div className="text-xs text-mid mt-0.5">Opłacone: {formatDate(phase.paid_at)}</div>}
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-base">{formatCurrency(phase.amount)}</div>
              {phase.paid ? (
                <div className="text-[10px] font-semibold uppercase tracking-wide text-orange mt-0.5">✓ Opłacone</div>
              ) : (
                <button onClick={() => markPaid(phase)} disabled={markingId === phase.id}
                  className="text-[10px] font-semibold uppercase tracking-wide text-mid hover:text-orange transition-colors mt-0.5 disabled:opacity-50">
                  {markingId === phase.id ? '...' : 'Oznacz jako opłacone'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Material cost block**

Create `components/projects/MaterialCostBlock.tsx`:
```typescript
import { formatCurrency } from '@/lib/utils/formatters'
import type { MaterialCost } from '@/types'

export default function MaterialCostBlock({ cost }: { cost: MaterialCost | null }) {
  if (!cost) return null
  const margin = cost.client_price - cost.supplier_cost
  return (
    <div className="bg-paper border-l-4 border-orange px-4 py-3 mx-5 mb-4">
      <div className="text-[10px] uppercase tracking-widest font-semibold text-mid mb-2">Marża materiałowa</div>
      <div className="flex gap-6 text-sm">
        <div><span className="text-mid">Klient zapłacił: </span><strong>{formatCurrency(cost.client_price)}</strong></div>
        <div><span className="text-mid">Zakup u dostawcy: </span><strong>{formatCurrency(cost.supplier_cost)}</strong></div>
        <div><span className="text-mid">Marża: </span><strong className="text-orange">+{formatCurrency(margin)}</strong></div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Phase API route**

Create `app/api/phases/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { markPhasePaid } from '@/lib/db/phases'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { paid_at, paid_notes } = await req.json()
  await markPhasePaid(params.id, paid_at, paid_notes)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Project detail page**

Create `app/(app)/projekty/[id]/page.tsx`:
```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProject } from '@/lib/db/projects'
import { getPhases } from '@/lib/db/phases'
import { getTasks } from '@/lib/db/tasks'
import { getTransactions } from '@/lib/db/transactions'
import { createClient } from '@/lib/supabase/server'
import Topbar from '@/components/layout/Topbar'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import PhaseList from '@/components/projects/PhaseList'
import MaterialCostBlock from '@/components/projects/MaterialCostBlock'
import { formatCurrency, formatDate, isOverdue } from '@/lib/utils/formatters'

const TYPE_LABELS: Record<string, string> = {
  projekt_std: 'Standard', projekt_cnc: 'CNC Full',
  pomiar_projekt: 'Pomiar + Projekt', pomiar_projekt_montaz: 'Pomiar + Projekt + Montaż',
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const [project, phases, tasks, transactions] = await Promise.all([
    getProject(params.id).catch(() => null),
    getPhases(params.id),
    getTasks({ projectId: params.id }),
    getTransactions({ projectId: params.id }),
  ])
  if (!project) notFound()

  const { data: materialCost } = await supabase.from('material_costs')
    .select('*').eq('project_id', params.id).single()

  const totalValue = project.meters && project.rate_per_mb
    ? project.meters * project.rate_per_mb + (['pomiar_projekt', 'pomiar_projekt_montaz'].includes(project.type) ? 300 : 0)
    : null
  const income  = transactions.filter(t => t.type === 'przychod').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'wydatek').reduce((s, t) => s + t.amount, 0)

  return (
    <>
      <Topbar title={project.client_name} actions={
        <>
          <StatusBadge status={project.status} />
          <Link href={`/projekty/${project.id}/edytuj`}><Button variant="ghost" size="sm">Edytuj</Button></Link>
        </>
      } />
      <div className="p-7 flex flex-col gap-5">
        {/* Header */}
        <div className="bg-black relative overflow-hidden p-6" style={{backgroundImage:'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}}>
          <div className="relative z-10 flex justify-between gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-orange flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-orange" />{TYPE_LABELS[project.type]}
              </div>
              <h2 className="font-display font-bold text-3xl text-white mb-2">{project.client_name}</h2>
              <div className="flex gap-4 text-sm text-white/40">
                {project.meters && <span>📐 {project.meters} mb</span>}
                {project.deadline_doc && <span className={isOverdue(project.deadline_doc) ? 'text-orange' : ''}>📅 {formatDate(project.deadline_doc)}</span>}
                {project.notes && <span>📝 Brief dodany</span>}
              </div>
            </div>
            <div className="text-right">
              {totalValue && <div>
                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Wartość projektu</div>
                <div className="font-display font-bold text-2xl text-white">{formatCurrency(totalValue)}</div>
              </div>}
              {materialCost && <div className="mt-3">
                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Marża mat.</div>
                <div className="font-display font-bold text-lg text-orange">+{formatCurrency(materialCost.client_price - materialCost.supplier_cost)}</div>
              </div>}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1fr_320px] gap-5">
          <div className="flex flex-col gap-5">
            <PhaseList phases={phases} projectId={project.id} />
            {materialCost && <MaterialCostBlock cost={materialCost} />}

            {/* Tasks */}
            <div className="bg-white">
              <div className="px-5 py-3.5 border-b border-paper flex justify-between items-center">
                <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Zadania</h2>
                <Button size="sm">+ Dodaj</Button>
              </div>
              {tasks.length === 0 ? (
                <div className="px-5 py-4 text-sm text-mid">Brak zadań.</div>
              ) : tasks.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3 border-b border-paper last:border-0">
                  <div className={`w-4 h-4 border-2 rounded-sm shrink-0 ${t.status === 'done' ? 'bg-orange border-orange' : 'border-light'}`} />
                  <div className="flex-1 text-sm font-medium">{t.title}</div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                    style={{ background: t.profiles?.display_name?.[0] === 'P' ? '#E8620A' : '#2C2C2C' }}>
                    {t.profiles?.display_name?.[0] ?? '?'}
                  </div>
                  {t.due_date && <div className={`text-xs ${isOverdue(t.due_date) && t.status !== 'done' ? 'text-orange-d font-semibold' : 'text-mid'}`}>{formatDate(t.due_date)}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            {/* Transactions */}
            <div className="bg-white">
              <div className="px-5 py-3.5 border-b border-paper flex justify-between items-center">
                <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Finanse</h2>
              </div>
              {transactions.map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-paper last:border-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${t.type === 'przychod' ? 'bg-orange' : 'bg-mid'}`} />
                  <div className="flex-1">
                    <div className="text-xs font-medium">{t.description}</div>
                    <div className="text-[11px] text-mid">{formatDate(t.date)}</div>
                  </div>
                  <div className={`font-display font-bold text-sm ${t.type === 'przychod' ? 'text-orange' : 'text-black'}`}>
                    {t.type === 'przychod' ? '+' : '−'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
              <div className="px-4 py-2.5 bg-paper flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-mid">Saldo</span>
                <span className="font-display font-bold text-lg text-orange">{formatCurrency(income - expense)}</span>
              </div>
            </div>

            {/* Notes */}
            {project.notes && (
              <div className="bg-white">
                <div className="px-5 py-3.5 border-b border-paper"><h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Brief / Notatki</h2></div>
                <div className="px-5 py-4">
                  <p className="text-sm text-dark leading-relaxed border-l-4 border-orange pl-4 italic">{project.notes}</p>
                </div>
              </div>
            )}

            {/* Project info */}
            <div className="bg-white">
              <div className="px-5 py-3.5 border-b border-paper"><h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Dane</h2></div>
              <div className="px-5 py-4 flex flex-col gap-2.5">
                {[
                  ['Typ', TYPE_LABELS[project.type]],
                  ['Metry', project.meters ? `${project.meters} mb` : '—'],
                  ['Stawka', project.rate_per_mb ? `${project.rate_per_mb} zł/mb` : '—'],
                  ['Termin dok.', formatDate(project.deadline_doc)],
                  ['Termin montażu', formatDate(project.deadline_install)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm border-b border-paper pb-2 last:border-0">
                    <span className="text-mid">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/ components/
git commit -m "feat: project detail page with phases, tasks, transactions"
```

---

## Task 11: Global tasks page

**Files:**
- Create: `app/(app)/zadania/page.tsx`, `components/tasks/TaskBoard.tsx`

- [ ] **Step 1: Fetch profiles for user IDs**

Add to `lib/db/tasks.ts`:
```typescript
export async function getProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) throw error
  return data as { id: string; display_name: string }[]
}
```

- [ ] **Step 2: Tasks page**

Create `app/(app)/zadania/page.tsx`:
```typescript
import Topbar from '@/components/layout/Topbar'
import { getTasks, getProfiles } from '@/lib/db/tasks'
import { createClient } from '@/lib/supabase/server'
import TaskBoard from '@/components/tasks/TaskBoard'

export default async function ZadaniaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [tasks, profiles] = await Promise.all([getTasks(), getProfiles()])
  return (
    <>
      <Topbar title="Zadania" />
      <div className="p-7"><TaskBoard tasks={tasks} profiles={profiles} currentUserId={user!.id} /></div>
    </>
  )
}
```

- [ ] **Step 3: TaskBoard component**

Create `components/tasks/TaskBoard.tsx`:
```typescript
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
```

Update `getTasks` to include project name:
```typescript
// In lib/db/tasks.ts — update the select query:
let query = supabase.from('tasks')
  .select('*, profiles(display_name), projects(client_name)')
  .order('due_date', { ascending: true, nullsFirst: false })
```

- [ ] **Step 4: Commit**

```bash
git add app/ components/ lib/
git commit -m "feat: global tasks page with two-column board"
```

---

## Task 12: Finance page

**Files:**
- Create: `app/(app)/finanse/page.tsx`, `components/finance/FinanceKpi.tsx`, `components/finance/TransactionTable.tsx`

- [ ] **Step 1: Finance KPI component**

Create `components/finance/FinanceKpi.tsx`:
```typescript
import { formatCurrency } from '@/lib/utils/formatters'

export default function FinanceKpi({ income, expense, profit, materialMargin }: {
  income: number; expense: number; profit: number; materialMargin: number
}) {
  return (
    <div className="grid grid-cols-4 gap-px">
      {[
        { label: 'Przychody', value: formatCurrency(income), accent: true },
        { label: 'Wydatki', value: formatCurrency(expense), accent: false },
        { label: 'Dochód netto', value: formatCurrency(profit), dark: true },
        { label: 'Marża materiałowa', value: formatCurrency(materialMargin), accent: false },
      ].map(({ label, value, accent, dark }) => (
        <div key={label} className={`px-6 py-5 border-l-[3px] ${dark ? 'bg-black border-orange' : 'bg-white border-orange/0'} ${accent ? 'border-orange' : dark ? '' : 'border-mid/30'}`}>
          <div className={`text-[10px] uppercase tracking-[0.18em] font-semibold mb-2 ${dark ? 'text-white/40' : 'text-mid'}`}>{label}</div>
          <div className={`font-display font-extrabold text-3xl leading-none ${dark ? 'text-orange' : 'text-black'}`}>{value}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Transaction table**

Create `components/finance/TransactionTable.tsx`:
```typescript
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import type { Transaction } from '@/types'

export default function TransactionTable({ transactions }: { transactions: Transaction[] }) {
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
              <td className="px-4 py-3 border-b border-paper text-xs text-mid">{(t as any).projects?.client_name ?? '—'}</td>
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
```

- [ ] **Step 3: Finance page**

Create `app/(app)/finanse/page.tsx`:
```typescript
import Topbar from '@/components/layout/Topbar'
import { getTransactions, getFinanceSummary } from '@/lib/db/transactions'
import { createClient } from '@/lib/supabase/server'
import FinanceKpi from '@/components/finance/FinanceKpi'
import TransactionTable from '@/components/finance/TransactionTable'

export default async function FinansePage({ searchParams }: { searchParams: { month?: string } }) {
  const now = new Date()
  const month = searchParams.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
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
```

- [ ] **Step 4: Commit**

```bash
git add app/ components/
git commit -m "feat: finance page with KPIs and transaction table"
```

---

## Task 13: Dashboard

**Files:**
- Modify: `app/(app)/page.tsx`
- Create: `components/dashboard/KpiRow.tsx`, `components/dashboard/ProjectsTable.tsx`, `components/dashboard/PaymentSchedule.tsx`, `components/dashboard/TasksPanel.tsx`

- [ ] **Step 1: KPI row**

Create `components/dashboard/KpiRow.tsx`:
```typescript
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
```

- [ ] **Step 2: Payment schedule panel**

Create `components/dashboard/PaymentSchedule.tsx`:
```typescript
import { formatCurrency } from '@/lib/utils/formatters'
import type { PaymentPhase } from '@/types'

export default function PaymentSchedule({ unpaidPhases }: { unpaidPhases: (PaymentPhase & { projects: { client_name: string } })[] }) {
  const total = unpaidPhases.reduce((s, p) => s + p.amount, 0)
  return (
    <div className="bg-white">
      <div className="px-5 py-3.5 border-b border-paper flex justify-between items-center">
        <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Do otrzymania</h2>
        <span className="text-[10px] uppercase tracking-widest text-orange font-semibold">{unpaidPhases.length} płatności</span>
      </div>
      {unpaidPhases.slice(0, 5).map(phase => (
        <div key={phase.id} className="flex items-center gap-3 px-4 py-3 border-b border-paper last:border-0">
          <div className="w-0.5 h-9 bg-orange rounded shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-semibold">{phase.projects?.client_name}</div>
            <div className="text-[11px] text-mid mt-0.5">{phase.label}</div>
          </div>
          <div className="font-display font-bold text-base text-orange">{formatCurrency(phase.amount)}</div>
        </div>
      ))}
      <div className="px-4 py-3 bg-paper flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-mid">Łącznie oczekuje</span>
        <span className="font-display font-bold text-xl text-orange">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Tasks panel**

Create `components/dashboard/TasksPanel.tsx`:
```typescript
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
```

- [ ] **Step 4: Dashboard page**

Replace `app/(app)/page.tsx`:
```typescript
import Topbar from '@/components/layout/Topbar'
import KpiRow from '@/components/dashboard/KpiRow'
import PaymentSchedule from '@/components/dashboard/PaymentSchedule'
import TasksPanel from '@/components/dashboard/TasksPanel'
import { StatusBadge } from '@/components/ui/Badge'
import { getProjects } from '@/lib/db/projects'
import { getFinanceSummary } from '@/lib/db/transactions'
import { getTasks, getProfiles } from '@/lib/db/tasks'
import { createClient } from '@/lib/supabase/server'
import { formatShortDate, isOverdue } from '@/lib/utils/formatters'
import Link from 'next/link'

const TYPE_SHORT: Record<string, string> = {
  projekt_std: 'Standard', projekt_cnc: 'CNC', pomiar_projekt: 'P+Proj', pomiar_projekt_montaz: 'P+Proj+M'
}

export default async function DashboardPage() {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const today = now.toISOString().slice(0, 10)
  const supabase = await createClient()

  const [projects, summary, tasks, profiles] = await Promise.all([
    getProjects(),
    getFinanceSummary(month),
    getTasks(),
    getProfiles(),
  ])

  const { data: unpaidPhases } = await supabase
    .from('payment_phases').select('*, projects(client_name)').eq('paid', false).order('sort_order')

  const tasksDue = tasks.filter(t => t.status !== 'done' && (t.due_date === today || isOverdue(t.due_date))).length
  const activeProjects = projects.filter(p => p.status !== 'zarchiwizowany')

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="p-7 flex flex-col gap-5">
        <KpiRow income={summary.income} expense={summary.expense} profit={summary.profit} tasksDue={tasksDue} />

        <div className="grid grid-cols-[1fr_340px] gap-5">
          {/* Projects table */}
          <div className="bg-white">
            <div className="px-5 py-3.5 border-b border-paper flex justify-between items-center">
              <h2 className="font-display font-bold text-[13px] uppercase tracking-wide">Aktywne projekty</h2>
              <Link href="/projekty/nowy" className="text-[11px] font-bold uppercase tracking-widest text-white bg-orange px-3 py-1.5 hover:bg-orange-d transition-colors">+ Nowy</Link>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>{['Klient','Typ','Status','Termin'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-[0.15em] text-mid font-semibold px-4 py-2.5 border-b border-paper">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {activeProjects.slice(0, 6).map(p => (
                  <tr key={p.id} className="hover:bg-paper">
                    <td className="px-4 py-2.5 border-b border-paper">
                      <Link href={`/projekty/${p.id}`} className="text-sm font-semibold hover:text-orange transition-colors">{p.client_name}</Link>
                    </td>
                    <td className="px-4 py-2.5 border-b border-paper text-xs text-mid">{TYPE_SHORT[p.type]}</td>
                    <td className="px-4 py-2.5 border-b border-paper"><StatusBadge status={p.status} /></td>
                    <td className={`px-4 py-2.5 border-b border-paper text-xs ${isOverdue(p.deadline_doc) ? 'text-orange-d font-semibold' : 'text-mid'}`}>
                      {isOverdue(p.deadline_doc) && '⚠ '}{formatShortDate(p.deadline_doc)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaymentSchedule unpaidPhases={(unpaidPhases ?? []) as any} />
        </div>

        <TasksPanel tasks={tasks} profiles={profiles} />
      </div>
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/ components/
git commit -m "feat: dashboard with KPIs, projects table, payment schedule, tasks panel"
```

---

## Task 14: Claude API endpoints

**Files:**
- Create: `app/api/claude/projects/route.ts`, `app/api/claude/tasks/route.ts`, `app/api/claude/transactions/route.ts`, `app/api/claude/phases/[id]/route.ts`

- [ ] **Step 1: Claude auth middleware helper**

Create `lib/utils/claude-auth.ts`:
```typescript
import { NextRequest } from 'next/server'

export function validateClaudeKey(req: NextRequest): boolean {
  return req.headers.get('x-claude-key') === process.env.CLAUDE_API_KEY
}
```

- [ ] **Step 2: GET projects endpoint**

Create `app/api/claude/projects/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateClaudeKey } from '@/lib/utils/claude-auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(req: NextRequest) {
  if (!validateClaudeKey(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServiceClient()
  const { data } = await supabase.from('projects').select('id, client_name, name, type, status').order('created_at', { ascending: false })
  return NextResponse.json(data)
}
```

- [ ] **Step 3: POST tasks endpoint**

Create `app/api/claude/tasks/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateClaudeKey } from '@/lib/utils/claude-auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  if (!validateClaudeKey(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  // body: { title, project_id?, assigned_to_name?, due_date?, description? }

  const supabase = createServiceClient()

  // Resolve assigned_to_name → user id
  let assigned_to: string | null = null
  if (body.assigned_to_name) {
    const { data: profile } = await supabase.from('profiles').select('id').ilike('display_name', body.assigned_to_name).single()
    assigned_to = profile?.id ?? null
  }

  const { data, error } = await supabase.from('tasks').insert({
    title: body.title,
    project_id: body.project_id ?? null,
    assigned_to,
    due_date: body.due_date ?? null,
    description: body.description ?? null,
    status: 'todo',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
```

- [ ] **Step 4: POST transactions endpoint**

Create `app/api/claude/transactions/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateClaudeKey } from '@/lib/utils/claude-auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  if (!validateClaudeKey(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  // body: { type, amount, description, project_id?, category?, date }

  const supabase = createServiceClient()
  const { data, error } = await supabase.from('transactions').insert({
    type: body.type,
    amount: body.amount,
    description: body.description,
    project_id: body.project_id ?? null,
    category: body.category ?? 'inne',
    date: body.date,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
```

- [ ] **Step 5: POST material costs endpoint**

Create `app/api/claude/material-costs/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateClaudeKey } from '@/lib/utils/claude-auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  if (!validateClaudeKey(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  // body: { project_id, client_price, supplier_cost, date, notes? }
  const supabase = createServiceClient()

  const { data, error } = await supabase.from('material_costs').insert({
    project_id: body.project_id,
    client_price: body.client_price,
    supplier_cost: body.supplier_cost,
    date: body.date,
    notes: body.notes ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Auto-create expense transaction for supplier cost
  await supabase.from('transactions').insert({
    project_id: body.project_id,
    type: 'wydatek',
    amount: body.supplier_cost,
    description: `Zakup materiałów${body.notes ? ` — ${body.notes}` : ''}`,
    category: 'materialy',
    date: body.date,
  })

  return NextResponse.json(data)
}
```

Also add to the file map: `api/claude/material-costs/route.ts — Claude: record material purchase + auto-expense`

- [ ] **Step 6: PATCH phases endpoint**

Create `app/api/claude/phases/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { validateClaudeKey } from '@/lib/utils/claude-auth'
import { markPhasePaid } from '@/lib/db/phases'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!validateClaudeKey(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { paid_at, paid_notes } = await req.json()
  await markPhasePaid(params.id, paid_at ?? new Date().toISOString().slice(0, 10), paid_notes)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 7: Test Claude endpoints manually**

```bash
# Get projects list
curl -H "x-claude-key: YOUR_KEY" http://localhost:3000/api/claude/projects

# Add a task
curl -X POST http://localhost:3000/api/claude/tasks \
  -H "x-claude-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Wycena - Nowy klient","assigned_to_name":"Przemek","due_date":"2026-05-10"}'

# Add a transaction
curl -X POST http://localhost:3000/api/claude/transactions \
  -H "x-claude-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type":"wydatek","amount":450,"description":"Materiały testowe","date":"2026-05-02"}'
```

Expected: JSON responses with created records.

- [ ] **Step 8: Commit**

```bash
git add app/api/claude/ lib/utils/claude-auth.ts lib/supabase/service.ts
git commit -m "feat: Claude API endpoints for tasks, transactions, phases, material costs"
```

---

## Task 15: Deploy to Vercel

**Files:**
- Create: `.gitignore` (update), `vercel.json` (optional)

- [ ] **Step 1: Ensure .gitignore covers secrets**

Add to `.gitignore`:
```
.env.local
.env*.local
```

- [ ] **Step 2: Push to GitHub**

```bash
git remote add origin https://github.com/YOUR_USERNAME/projektant24-crm.git
git push -u origin main
```

- [ ] **Step 3: Connect to Vercel**

Go to https://vercel.com → New Project → Import GitHub repo → set env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLAUDE_API_KEY`

Click Deploy. Wait for build.

- [ ] **Step 4: Test production**

Open deployed URL → login → add a test project → verify phases auto-created → mark a phase paid → verify transaction created.

- [ ] **Step 5: Note production URL**

Save the production URL (e.g. `https://projektant24-crm.vercel.app`) — use this as the base for Claude API calls:
```bash
curl -H "x-claude-key: YOUR_KEY" https://projektant24-crm.vercel.app/api/claude/projects
```

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "chore: deploy config and .gitignore"
git push
```

---

## How Claude manages data (usage guide)

Once deployed, I (Claude) can manage CRM data from the terminal:

```bash
BASE="https://projektant24-crm.vercel.app"
KEY="your-claude-api-key"

# List projects (to find IDs)
curl -s -H "x-claude-key: $KEY" $BASE/api/claude/projects | jq .

# Add task
curl -s -X POST $BASE/api/claude/tasks \
  -H "x-claude-key: $KEY" -H "Content-Type: application/json" \
  -d '{"title":"TYTUŁ ZADANIA","assigned_to_name":"Przemek","due_date":"2026-05-15","project_id":"UUID"}'

# Add expense
curl -s -X POST $BASE/api/claude/transactions \
  -H "x-claude-key: $KEY" -H "Content-Type: application/json" \
  -d '{"type":"wydatek","amount":500,"description":"Materiały","date":"2026-05-02","project_id":"UUID"}'

# Mark phase as paid
curl -s -X PATCH $BASE/api/claude/phases/PHASE_UUID \
  -H "x-claude-key: $KEY" -H "Content-Type: application/json" \
  -d '{"paid_at":"2026-05-02"}'
```
