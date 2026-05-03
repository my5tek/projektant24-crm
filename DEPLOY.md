# Checklist deployu Projektant24 CRM

## Krok 1: GitHub repo (2 min)

Wejdź na https://github.com/new
- Repository name: `projektant24-crm`
- Private
- Create repository

Potem w terminalu w folderze projektu:

```bash
git remote add origin https://github.com/TWOJ_USERNAME/projektant24-crm.git
git branch -M main
git push -u origin main
```

## Krok 2: Supabase (5 min)

1. Wejdź na https://supabase.com/dashboard → New project
2. Nazwa: `projektant24-crm`
3. Hasło do bazy: wymyśl mocne
4. Region: `North Europe` (Finland) lub najbliższy
5. Poczekaj aż się utworzy

### 2a. Wgraj schemat bazy
W dashboardzie Supabase:
- SQL Editor → `New query`
- Wklej **całą zawartość** pliku `supabase/migrations/001_initial.sql`
- Kliknij **Run**

Oczekiwany wynik: `Success. No rows returned` (lub podobny) — 6 tabel + polityki RLS utworzone.

### 2b. Stwórz użytkowników
W dashboardzie Supabase:
- Authentication → Users → Add user
  - Email: `przemek@projektant24.pl` + hasło
  - Email: `maciej@projektant24.pl` + hasło

Potem w SQL Editor:

```sql
insert into public.profiles (id, display_name)
select id, 'Przemek' from auth.users where email = 'przemek@projektant24.pl';

insert into public.profiles (id, display_name)
select id, 'Maciej' from auth.users where email = 'maciej@projektant24.pl';
```

### 2c. Zbierz klucze API
W dashboardzie Supabase:
- Settings → API
- Skopiuj i zapisz w bezpiecznym miejscu:
  - `Project URL` (np. `https://abcdefgh12345678.supabase.co`)
  - `anon public` key (długi string)
  - `service_role secret` key (**nie wolno tego wkładać do kodu frontend!**)

### 2d. Generowanie CLAUDE_API_KEY
W terminalu (PowerShell):

```powershell
-join ((1..32) | ForEach-Object { "0123456789abcdef".Substring((Get-Random -Maximum 16), 1) })
```

Albo po prostu wymyśl 64-znakowy losowy ciąg hex.

## Krok 3: Vercel (5 min)

1. Wejdź na https://vercel.com/new
2. Importuj repo `projektant24-crm` z GitHub
3. W kroku "Configure Project" rozwiń "Environment Variables" i dodaj 4 zmienne:

| Nazwa | Wartość (skopiowana z Supabase) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Twój Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Twój anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Twój service_role secret key |
| `CLAUDE_API_KEY` | Twój wygenerowany klucz |

4. Kliknij **Deploy**
5. Poczekaj ~1-2 minuty na zakończenie builda

## Krok 4: Test produkcyjny (3 min)

1. Wejdź na wydany URL (np. `https://projektant24-crm.vercel.app`)
2. Zaloguj się jako `przemek@projektant24.pl`
3. Przejdź przez:
   - Dashboard
   - Projekty → Dodaj nowy projekt
   - Szczegóły projektu (fazy, zadania)
   - Zadania
   - Finanse
4. Sprawdź czy wszystko działa poprawnie

## Krok 5: Ustawienia lokalne (opcjonalne)

Jeśli chcesz też uruchamiać lokalnie z produkcyjną bazą:

1. Skopiuj `.env.local.example` do `.env.local`
2. Wypełnij wartościami z Supabase
3. `npm run dev`

---

**Czas całkowity: ok. 15 min**

W razie błędów builda na Vercel — sprawdź logi builda w Vercel Dashboard. Najczęstsza przyczyna: brak jednej ze zmiennych środowiskowych.
