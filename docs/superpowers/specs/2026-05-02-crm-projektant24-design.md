# CRM Projektant24 — Design Spec
**Data:** 2026-05-02  
**Wersja:** 1.0  
**Użytkownicy:** Przemek (admin), Maciej

---

## 1. Cel i zakres

Mini CRM dla firmy Projektant24 (dokumentacja CAD dla zakładów stolarskich). System do zarządzania projektami, finansami i zadaniami dla 2 osób.

**Nie jest celem:** pełny system ERP, fakturowanie, integracje zewnętrzne (v1).

---

## 2. Stack techniczny

| Warstwa | Technologia |
|---|---|
| Frontend + API | Next.js 14 (App Router) |
| Baza danych | Supabase (PostgreSQL) |
| Autentykacja | Supabase Auth (email + hasło) |
| Hosting | Vercel (free tier) |
| Styl | Tailwind CSS + brand Projektant24 |
| Claude API | Endpointy `/api/claude/*` z API key |

**Design system:** brand Projektant24  
- Kolory: `#1A1A1A` (black), `#2C2C2C` (dark), `#6B6B6B` (mid), `#D4D4D4` (light), `#F2F0EC` (paper), `#E8620A` (orange), `#C0510A` (orange-d)  
- Czcionki: Audiowide (logo), Barlow Condensed (nagłówki), Barlow (treść)

---

## 3. Autentykacja

- Supabase Auth: email + hasło
- 2 konta: Przemek, Maciej
- Brak rejestracji publicznej — konta zakładane ręcznie w panelu Supabase
- Po zalogowaniu: sesja persystuje (JWT w cookie)
- Każdy użytkownik widzi wszystkie dane (brak izolacji per user — wspólna firma)

---

## 4. Model danych

### 4.1 Tabela `projects`

```sql
id              uuid PRIMARY KEY
name            text NOT NULL           -- nazwa klienta / projektu
client_name     text NOT NULL
type            enum('projekt_std', 'projekt_cnc', 'pomiar_projekt', 'pomiar_projekt_montaz')
status          enum('nowy', 'w_toku', 'gotowy', 'zarchiwizowany')
meters          decimal(6,2)            -- metry bieżące
rate_per_mb     decimal(8,2)            -- stawka zł/mb (domyślnie: std=100, cnc=150)
notes           text
deadline_doc    date                    -- termin dokumentacji
deadline_install date                  -- termin montażu (typ 3)
created_at      timestamptz DEFAULT now()
created_by      uuid REFERENCES auth.users
```

### 4.2 Tabela `payment_phases`

Każdy projekt ma 2 lub 4 fazy płatności (generowane automatycznie przy tworzeniu projektu wg typu).

```sql
id              uuid PRIMARY KEY
project_id      uuid REFERENCES projects
phase_key       text        -- 'A_deposit', 'A_final', 'B_material', 'C_install'
label           text        -- wyświetlana nazwa
amount          decimal(10,2)
paid            boolean DEFAULT false
paid_at         date
paid_notes      text
sort_order      int
```

**Fazy wg typu projektu:**

| Typ | Fazy |
|---|---|
| `projekt_std` | A_deposit (50%), A_final (50%) |
| `projekt_cnc` | A_deposit (50%), A_final (50%) |
| `pomiar_projekt` | A_deposit (50%), A_final (50%) |
| `pomiar_projekt_montaz` | A_deposit (50%), A_final (50%), B_material (100% klient), C_install (rozliczenie końcowe) |

### 4.3 Tabela `material_costs`

Tylko dla typu 3 — śledzenie kosztu zakupu materiałów (marża):

```sql
id              uuid PRIMARY KEY
project_id      uuid REFERENCES projects
client_price    decimal(10,2)   -- co pobrał od klienta
supplier_cost   decimal(10,2)   -- co zapłacił dostawcy
margin          decimal(10,2) GENERATED ALWAYS AS (client_price - supplier_cost)
date            date
notes           text
```

### 4.4 Tabela `tasks`

```sql
id              uuid PRIMARY KEY
project_id      uuid REFERENCES projects  -- nullable (zadanie bez projektu)
title           text NOT NULL
description     text
assigned_to     uuid REFERENCES auth.users
status          enum('todo', 'w_toku', 'done')
due_date        date
created_by      uuid REFERENCES auth.users
created_at      timestamptz DEFAULT now()
```

### 4.5 Tabela `transactions`

```sql
id              uuid PRIMARY KEY
project_id      uuid REFERENCES projects  -- nullable
type            enum('przychod', 'wydatek')
amount          decimal(10,2)
description     text NOT NULL
category        text   -- 'materialy', 'usluga', 'inne'
date            date NOT NULL
created_by      uuid REFERENCES auth.users
created_at      timestamptz DEFAULT now()
```

---

## 5. Widoki aplikacji

### 5.1 Dashboard (`/`)

**Kafelki KPI (bieżący miesiąc):**
- Przychody
- Wydatki
- Dochód netto (przychody − wydatki)
- Zadania dziś (count)

**Tabela aktywnych projektów:**  
Klient | Typ | Status | Płatności (kropki: ● opłacone, ○ oczekujące) | Termin

**Panel harmonogramu płatności:**  
Płatności oczekujące posortowane według pilności. Alert dla przeterminowanych.

**Panel zadań:**  
Dwie kolumny: Przemek | Maciej. Dziś + zaległe + najbliższe 7 dni.

---

### 5.2 Projekty (`/projekty`)

Lista wszystkich projektów z filtrem statusu. Przycisk "+ Nowy projekt".

**Formularz nowego projektu:**
- Nazwa klienta, typ projektu (select), mb, stawka/mb
- Termin dokumentacji, termin montażu (jeśli typ 3)
- Notatki/brief
- System automatycznie tworzy fazy płatności z odpowiednimi kwotami

**Widok szczegółów projektu (`/projekty/[id]`):**
- Nagłówek: klient, typ, mb, wartość całkowita, marża materiałowa (jeśli typ 3)
- Blok faz płatności — każda faza z kwotą, statusem, przyciskiem "Oznacz jako opłacone"
- Dla fazy B: widoczny koszt dostawcy + wyliczona marża
- Lista zadań projektu z awatarami użytkowników
- Lista transakcji projektu (przychody/wydatki)
- Notatki/brief (edytowalne inline)
- Panel danych projektu (typ, mb, stawka, terminy)

---

### 5.3 Finanse (`/finanse`)

**KPI (filtr: miesiąc/kwartał/rok):**
- Przychody / Wydatki / Dochód netto / Marża materiałowa łącznie

**Wykres:** słupkowy, przychody vs wydatki, ostatnie 6 miesięcy

**Tabela transakcji:** wszystkie, filtr po typie/dacie/projekcie/kategorii

---

### 5.4 Zadania (`/zadania`)

**Dwie kolumny:** Przemek | Maciej  
**Filtry:** Dziś / Zaległe / Wszystkie / Po projekcie  
**Szybkie dodawanie** zadania inline (tytuł + projekt + termin + przypisanie)

---

## 6. Interakcja z Claude

Claude może zarządzać danymi przez zabezpieczone endpointy REST:

```
POST /api/claude/tasks        — dodaj zadanie
POST /api/claude/transactions — dodaj transakcję
PATCH /api/claude/tasks/[id]  — zaktualizuj zadanie (np. oznacz done)
PATCH /api/claude/phases/[id] — oznacz fazę jako opłaconą
GET  /api/claude/projects     — lista projektów (do wyboru przy dodawaniu)
```

**Autoryzacja:** nagłówek `x-claude-key: <API_KEY>` (klucz w zmiennych środowiskowych Vercel).

**Powiązanie płatności z transakcjami:** Gdy faza zostaje oznaczona jako opłacona (`paid = true`), system automatycznie tworzy rekord w tabeli `transactions` (typ: `przychod`, kwota z fazy, projekt przypisany). Analogicznie rejestracja kosztu materiałów w `material_costs` tworzy transakcję typu `wydatek`.

**Przykładowe komendy głosowe → akcje API:**
- "Dodaj zadanie 'Wycena dla Kowalski' do projektu ABC, dla Macieja, termin piątek" → `POST /api/claude/tasks`
- "Oznacz fazę A zaliczka jako opłaconą w projekcie Nowak" → `PATCH /api/claude/phases/[id]`
- "Dodaj wydatek 450 zł materiały dla projektu Wiśniewska" → `POST /api/claude/transactions`

---

## 7. Bezpieczeństwo

- Supabase Row Level Security (RLS): każdy zalogowany użytkownik widzi wszystkie rekordy firmy (bez izolacji — to wspólna firma)
- API endpointy Claude chronione osobnym kluczem API (nie Supabase JWT)
- Zmienne środowiskowe w Vercel: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `CLAUDE_API_KEY`
- Brak publicznej rejestracji

---

## 8. Typy projektów — szczegóły rozliczeń

### Typ 1a: Projekt technologiczny Standard (`projekt_std`)

- Cena = mb × 100 zł/mb (domyślna stawka, edytowalna)
- Płatność: 50% zaliczka → 50% po dostarczeniu dokumentacji

### Typ 1b: Projekt technologiczny CNC Full (`projekt_cnc`)
- Cena = mb × 150 zł/mb (domyślna stawka, edytowalna)
- Płatność: 50% zaliczka → 50% po dostarczeniu dokumentacji

### Typ 2: Pomiar + Projekt
- Cena = 300 zł (pomiar) + mb × stawka
- Płatność: 50% zaliczka → 50% po dostarczeniu dokumentacji

### Typ 3: Pomiar + Projekt + Montaż
- **Faza A** (Pomiar + Projekt): jak Typ 2, płatność 50/50
- **Faza B** (Materiały): `client_price` pobrane z góry 100%; `supplier_cost` rejestrowane jako wydatek; marża = różnica
- **Faza C** (Montaż + Nadzór): kwota ustalana indywidualnie; rozliczenie końcowe po montażu

---

## 9. Decyzje projektowe

| Decyzja | Wybór | Uzasadnienie |
|---|---|---|
| Backend | Next.js API Routes | Jeden deploy, bez osobnego serwera |
| Baza | Supabase | Darmowy tier, wbudowana auth, realtime opcjonalnie |
| Auth | Supabase Auth | Gotowe, bez pisania od zera |
| Izolacja danych | Brak (wspólna firma) | 2 osoby, wspólny dostęp do wszystkiego |
| Claude API | Osobny klucz API | Nie narażamy JWT użytkowników |
| Hosting | Vercel | Auto-deploy z GitHub, darmowy tier |
