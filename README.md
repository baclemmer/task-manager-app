# Task Manager

Shared task tracker for Brett and his EA (with room to invite more people later). Built with Next.js (App Router), Supabase (Postgres + Auth), Tailwind, and shadcn/ui.

## Setup

### 1. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and create a free account/project.
2. In the project dashboard, go to **SQL Editor > New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates all tables, the auth-sync trigger, the `tasks_with_flags` view, and row-level security policies.
3. Go to **Project Settings > API** and copy the **Project URL** and **anon public key**.

### 2. Configure environment variables
Copy `.env.local.example` to `.env.local` and fill in the values from step 1:

```bash
cp .env.local.example .env.local
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up for an account (email + password) — the first user, then invite your EA the same way (or have them sign up themselves once you share the link).

### 4. Deploy to Vercel
1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy, then share the live URL with your EA so they can sign up.

## Project structure
- `supabase/schema.sql` — full database schema (tables, view, RLS policies)
- `src/app/(auth)` — login/signup
- `src/app/(app)/attention` — Attention Dashboard (default landing page)
- `src/app/(app)/dashboard` — Standard Dashboard (list/kanban, filters, grouping)
- `src/app/(app)/projects` — manage projects & categories
- `src/lib/supabase` — Supabase client setup (browser, server, middleware)
- `src/lib/actions` — server actions for auth, tasks, projects/categories
- `src/lib/data` — server-side data fetching
