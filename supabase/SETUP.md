# Supabase Setup Instructions

## 1. Create Supabase project

1. Go to https://supabase.com → New project
2. Name: projektant24-crm
3. After creation, go to Settings → API:
   - Copy **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
   - Copy **anon public key** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
   - Copy **service_role secret key** → paste as `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
4. Choose a strong random string for `CLAUDE_API_KEY` in `.env.local`

## 2. Run migration

In Supabase dashboard → SQL Editor → paste contents of `migrations/001_initial.sql` → Run.

Expected: all 6 tables created + RLS policies, no errors.

## 3. Create user accounts

In Supabase dashboard → Authentication → Users → Add user (with password):
- Email: `przemek@projektant24.pl`
- Email: `maciej@projektant24.pl`

Then in SQL Editor:
```sql
insert into public.profiles (id, display_name)
select id, 'Przemek' from auth.users where email = 'przemek@projektant24.pl';

insert into public.profiles (id, display_name)
select id, 'Maciej' from auth.users where email = 'maciej@projektant24.pl';
```

After this, the CRM will be ready to use.
