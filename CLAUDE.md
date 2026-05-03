@AGENTS.md

# Projektant24 CRM

Mini CRM dla firmy Projektant24 — dokumentacja CAD dla zakładów stolarskich. 2 użytkownicy: Przemek (admin) + Maciej.

## Stack

| Warstwa | Technologia |
|---|---|
| Framework | Next.js **16.2.4** (App Router, Server Components) |
| Baza danych | Supabase (PostgreSQL + Auth + RLS) |
| CSS | Tailwind CSS **v4** (tokeny w `app/globals.css`, nie w `tailwind.config.ts`) |
| Hosting | Vercel (free tier) |
| Testy | Vitest + @testing-library/react |
| Typy | TypeScript strict |

## Status projektu

**Deploy wykonany — strona działa, logowanie działa, błąd 500 po zalogowaniu.**

Zrealizowane zadania (17/17):
- ✅ Scaffold Next.js + Tailwind v4 + Vitest + brand config
- ✅ Schema SQL (`supabase/migrations/001_initial.sql`)
- ✅ TypeScript types + 3 klienty Supabase (browser/server/service)
- ✅ Auth middleware + strona logowania
- ✅ App layout — Sidebar + Topbar
- ✅ Phase generator (pure function, 5 testów)
- ✅ DB layer — projects, phases, tasks, transactions
- ✅ UI atoms — Badge, Button
- ✅ Strona projektów (lista + formularz tworzenia + API route)
- ✅ Szczegóły projektu (fazy, marża materiałowa, zadania, transakcje)
- ✅ Strona zadań (TaskBoard Przemek | Maciej)
- ✅ Strona finansów (KPI + tabela transakcji)
- ✅ Dashboard (KPI, projekty, harmonogram płatności, zadania)
- ✅ Claude API endpoints (`/api/claude/*`)
- ✅ .gitignore + instrukcje deployu (`supabase/SETUP.md`)
- ✅ Utworzono repo GitHub: `my5tek/projektant24-crm`
- ✅ Deploy na Vercel: `projektant24-crm.vercel.app`

## Środowisko produkcyjne

- **URL:** https://projektant24-crm.vercel.app
- **GitHub:** https://github.com/my5tek/projektant24-crm
- **Supabase:** projektant24-crm (tzvmcguzsxsaoilecclt.supabase.co)

### Użytkownicy (utworzeni w Supabase Auth):
- pmystkowski@gmail.com
- maciej.portison@gmail.com

### Zmienne środowiskowe (w Vercel):
- NEXT_PUBLIC_SUPABASE_URL=https://tzvmcguzsxsaoilecclt.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- CLAUDE_API_KEY=crm-projektant24-secret-key-2025

### Tabele w bazie (istnieją):
- profiles
- projects
- payment_phases
- material_costs
- tasks
- transactions

## Błąd

**Błąd 500 po zalogowaniu:**
1. Strona logowania (/login) — działa, formularz się pojawia
2. Po wpisaniu danych i kliknięciu "Zaloguj się" — przechodzi na stronę główną (/)
3. Na stronie głównej — błąd "This page couldn't load. A server error occurred. Reload to try again."

Błąd występuje po udanym logowaniu, przy próbie wejścia na stronę chronioną przez middleware.

## Zmienne środowiskowe

```
NEXT_PUBLIC_SUPABASE_URL=https://tzvmcguzsxsaoilecclt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dm1jZ3V6c3hzYW9pbGVjY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NjIwMDQsImV4cCI6MjA5MzMzODAwNH0.Vw_nV2vjXUG7TJ3C9FLSmjuTWXfGwButwPsTzanJXzU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6dm1jZ3V6c3hzYW9pbGVjY2x0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYyMDA0LCJleHAiOjIwOTMzMzgwMDR9.-qvQV0uRKtbadBDZwDsl_0POkpF-fRPamNNNYyz6C2E
CLAUDE_API_KEY=crm-projektant24-secret-key-2025
```

Skopiuj z `.env.local.example` i uzupełnij w `.env.local`.

## Komendy

```bash
npm run dev          # serwer deweloperski
npm run build        # build produkcyjny
npm run test:run     # testy Vitest (jednorazowo)
npm run test         # testy w trybie watch
npm run lint         # ESLint (next lint)
```

## Architektura plików

```
app/
  layout.tsx                        — root layout, Google Fonts (Audiowide/Barlow/Barlow_Condensed)
  globals.css                       — Tailwind v4 @theme z tokenami brand
  (auth)/login/page.tsx             — strona logowania
  (app)/layout.tsx                  — guard auth + Sidebar
  (app)/page.tsx                    — Dashboard
  (app)/projekty/page.tsx           — lista projektów
  (app)/projekty/nowy/page.tsx      — formularz nowego projektu
  (app)/projekty/[id]/page.tsx      — szczegóły projektu
  (app)/zadania/page.tsx            — zarządzanie zadaniami
  (app)/finanse/page.tsx            — finanse
  api/projects/route.ts             — POST: utwórz projekt + fazy
  api/phases/[id]/route.ts          — PATCH: oznacz fazę jako opłaconą (z UI)
  api/claude/projects/route.ts      — GET: lista projektów (dla Claude)
  api/claude/tasks/route.ts         — POST: dodaj zadanie (dla Claude)
  api/claude/transactions/route.ts  — POST: dodaj transakcję (dla Claude)
  api/claude/phases/[id]/route.ts   — PATCH: oznacz fazę opłaconą (dla Claude)
  api/claude/material-costs/route.ts — POST: dodaj koszt materiałów (dla Claude)

components/
  layout/Sidebar.tsx, Topbar.tsx
  dashboard/KpiRow.tsx, PaymentSchedule.tsx, TasksPanel.tsx
  projects/ProjectForm.tsx, PhaseList.tsx, MaterialCostBlock.tsx
  tasks/TaskBoard.tsx
  finance/FinanceKpi.tsx, TransactionTable.tsx
  ui/Badge.tsx (StatusBadge), Button.tsx

lib/
  supabase/client.ts    — przeglądarka (createBrowserClient)
  supabase/server.ts    — serwer (createServerClient + cookies)
  supabase/service.ts   — service role (createClient z SUPABASE_SERVICE_ROLE_KEY)
  db/projects.ts        — getProjects, getProject, createProject, updateProjectStatus
  db/phases.ts          — getPhases, createPhases, markPhasePaid
  db/tasks.ts           — getTasks, createTask, updateTaskStatus, getProfiles
  db/transactions.ts    — getTransactions, createTransaction, getFinanceSummary
  utils/phase-generator.ts  — generatePhases(type, designTotal, opts) — pure fn
  utils/formatters.ts       — formatCurrency, formatDate, formatShortDate, isOverdue
  utils/claude-auth.ts      — validateClaudeKey(req)

types/index.ts          — Project, PaymentPhase, MaterialCost, Task, Transaction, Profile, PhaseTemplate
middleware.ts           — redirect /login ↔ / na podstawie sesji Supabase
supabase/
  migrations/001_initial.sql  — pełny schemat DB
  SETUP.md                    — instrukcje dla Przemka (Supabase + deploy)
```

## Model danych

**Tabele:** `profiles`, `projects`, `payment_phases`, `material_costs`, `tasks`, `transactions`

**Typy projektów:**
- `projekt_std` — Standard 100 zł/mb, 2 fazy (50% zaliczka + 50% finalna)
- `projekt_cnc` — CNC Full 150 zł/mb, 2 fazy (50%/50%)
- `pomiar_projekt` — Pomiar 300 zł + mb × stawka, 2 fazy
- `pomiar_projekt_montaz` — 4 fazy: A_deposit, A_final, B_material (100% z góry), C_install

**Automatyki:**
- Przy tworzeniu projektu → fazy płatności generują się automatycznie (`generatePhases`)
- Przy oznaczeniu fazy jako opłaconej → auto-tworzy rekord w `transactions` (typ: przychod)
- Przy dodaniu kosztów materiałów → auto-tworzy rekord w `transactions` (typ: wydatek)

## Claude API (zewnętrzne zarządzanie danymi)

Wszystkie endpointy wymagają nagłówka `x-claude-key: $CLAUDE_API_KEY`.
Używają `createServiceClient()` (service role, bez sesji użytkownika).

```bash
# Lista projektów
GET /api/claude/projects

# Dodaj zadanie (resolved assigned_to_name → user ID przez profiles)
POST /api/claude/tasks
{"title":"...", "assigned_to_name":"Przemek", "due_date":"2026-05-10", "project_id":"UUID"}

# Dodaj transakcję
POST /api/claude/transactions
{"type":"wydatek", "amount":450, "description":"Materiały", "date":"2026-05-02"}

# Oznacz fazę jako opłaconą (auto-tworzy transakcję przychód)
PATCH /api/claude/phases/{phase_uuid}
{"paid_at":"2026-05-02"}

# Dodaj koszt materiałów (auto-tworzy transakcję wydatek)
POST /api/claude/material-costs
{"project_id":"UUID", "client_price":8000, "supplier_cost":6500, "date":"2026-05-02"}
```

## Brand Projektant24

- **Kolory:** `#1A1A1A` (black), `#2C2C2C` (dark), `#6B6B6B` (mid), `#D4D4D4` (light), `#F2F0EC` (paper), `#E8620A` (orange), `#C0510A` (orange-d)
- **Fonty:** Audiowide (wordmark/logo), Barlow Condensed (display/nagłówki), Barlow (body)
- **Tailwind v4 klasy:** `bg-paper`, `bg-orange`, `text-orange`, `text-mid`, `font-display`, `font-wordmark`, `font-body`, `bg-dark`, `text-orange-d`, itd.

## Ważne uwagi techniczne

1. **Tailwind v4** — tokeny w `app/globals.css` pod `@theme`, plik `tailwind.config.ts` jest tylko dokumentacją
2. **Next.js 15+ params** — w route handlers i page components: `params` i `searchParams` są `Promise<{...}>`, trzeba `await params`
3. **Supabase klienty** — UI używa `server.ts` (cookie auth), Claude API używa `service.ts` (service role bez sesji)
4. **RLS Supabase** — wszyscy zalogowani użytkownicy widzą wszystkie dane (wspólna firma, brak izolacji)
5. **Brak publicznej rejestracji** — konta zakładane ręcznie w panelu Supabase Auth