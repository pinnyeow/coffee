@AGENTS.md

# Pour — Coffee Journal & Friends App

## What This Product Does
Mobile-first journal for pour over and espresso brews. Log a brew in 30 seconds,
find your best settings for any bean in 2 taps, share recipes with friends, and
auto-translate xBloom-specific settings into a universal recipe other gear can use.

## Who It's For
- **Pin** (PM, primary user) — xBloom, pour over
- **Michael** (Pin's partner) — espresso + cortado
- **Friends** — invited later, private feed only (no public community)

## How It's Built
- Next.js 15 (App Router) — see `@AGENTS.md`: this Next is non-standard, read
  `node_modules/next/dist/docs/` before writing code
- Supabase (Postgres + auth + RLS on every table)
- Server Actions with Zod validation
- Tailwind for styling
- Vitest unit tests; GitHub Actions CI runs typecheck + tests
- Deployed at **mypour.vercel.app** via Vercel; auth email via Resend

## What We're Working On
Currently: shipped v4 (friends + share + want-to-try). Next, in order:
1. **Polish pass** — desktop framing, PWA basics, loading + empty states, typography
2. **v5 Espresso & cross-method** — adds brew_method + espresso fields so Michael
   can log cortados, plus bean detail grouped by method

See `ROADMAP.md` for the live tracker; `plan.md` is the locked design spec.

## Where to Find More

- **`ROADMAP.md`** — what's shipped / up next / backlog. Source of truth for current work.
- **`plan.md`** — original locked design spec. Source of truth for product intent.
- **`supabase/schema.sql`** — current DB schema. Read before writing queries or migrations.
- **`supabase/migrations/NNN_*.sql`** — numbered, idempotent. Add new ones as the next NNN.
