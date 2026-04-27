# Pour — Roadmap

Living doc of what's shipped, what's next, and what's on the shelf. Update as decisions change.

> **For the original design spec**, see [`plan.md`](./plan.md). This file is the forward-looking work tracker.

---

## ✅ Shipped

### v1 — Walking skeleton
- Magic-link sign in (Supabase Auth)
- Log a brew (form + Zod-validated server action)
- Home screen showing your brews

### v2 — Find best settings
- Bean detail page at `/beans/[slug]`
- Recommended Recipe card (best/latest)
- "Use these settings" pre-fills Log brew

### v3 — Profiles + Obsidian import + brew edit + bought-in fields
- Multiple named recipe profiles per method (xBloom, V60, Espresso, etc.)
- Profile picker on Log brew
- One-time Obsidian `.md` import with bean + brew parser
- Per-bean tracking of `purchased_country` / `purchased_city` / `purchased_at`
- Brew edit + delete + mark-as-best toggle
- Home redesigned: bean-grouped cards, "Best" vs "Latest" recipe labels, hide stars when no rating variance

### v4 — Friends + Share + display names + notifications
- Friendship invite flow (username search, pending → accepted)
- `users.display_name` editor (separate from username)
- Friends feed bean-grouped; default sort = most recent activity
- Search bar + filter chips (All / ★ Starred) on Mine and Friends
- Per-brew **🔒 Private** toggle (`visibility = self`)
- Share brew: Universal / xBloom toggle, copy as text, grind translation
- Bean detail surfaces friends' best recipes with attribution + "Use" / "View" actions
- Recipe attribution: `derived_from_brew_id` linked back to source friend's brew
- Bean bookmarks (★ Want to try) with Home section
- Want-to-try sharing: opt-in toggle, surfaces on bean detail + Friends tab
- Red-dot badge + amber banner on Home for pending friend requests

### Quality + infra
- Vitest unit tests (37 passing — slug, recipe-picker, share, obsidian-parser)
- GitHub Actions CI: typecheck + tests on push/PR
- Postgres RLS policies on every table

### Deployment
- Live at **mypour.vercel.app**
- Custom SMTP via Resend (eliminates dev rate-limit)
- Env vars in Vercel; Supabase URL config updated

---

## 🟡 Up next

### Polish pass (~2 hrs total) — recommended before v5
- [ ] **Desktop framing**: subtle background gradient, slightly wider column on `md+`, persistent top header with logo + sign-out
- [ ] **PWA basics**: manifest, iOS meta tags, app icon — "Add to Home Screen" on iOS works as fullscreen app
- [ ] **Loading states**: skeleton placeholders during page transitions
- [ ] **Better empty states**: helpful copy + small illustration/hint on every "nothing here yet" view
- [ ] **Polished typography**: switch from system default to Inter or similar

### v5 — Espresso & cross-method
- [ ] Espresso fields on Log brew when method = Espresso (yield_g, time_s, drink_style)
- [ ] Drink style selector: Espresso · Cortado · Latte · Flat white · Cappuccino · Americano · Macchiato
- [ ] Bean detail shows espresso recipes side-by-side with pour over
- [ ] "Try as espresso" CTA on a pour-over bean → starter espresso brew template
- [ ] Default starter values per method in seeded global profiles

---

## 🟢 Backlog (medium-term)

### Discovery + power features
- [ ] Sort toggle on Mine: Highest rated · Recently brewed · A–Z · Most-brewed
- [ ] Multi-column responsive layout on bean detail (desktop only)
- [ ] Built-in brew timer (start/stop, auto-fills time field)
- [ ] Charts: grind vs. time over many brews, settings drift per bean
- [ ] Compare two brews side-by-side
- [ ] Export to Obsidian markdown (write back from Pour to vault)
- [ ] Tasting note tags (fruity, nutty, bitter, etc.)
- [ ] Similar-bean matching across users (origin + roast level)

### Social
- [ ] Email notifications when friends log a starred brew (digest, opt-in)
- [ ] "Friends who tried this" count badge on creator's brew
- [ ] Public read-only share link (`/b/[id]`) generated from share sheet
- [ ] Save-as-image for share cards

### Quality
- [ ] Playwright E2E test for the critical path (sign in → log → see on Home → share)
- [ ] Sentry or Vercel Logs hooked up for production error monitoring
- [ ] Custom domain (mypour.app or .coffee) attached to Vercel project

### Onboarding
- [ ] First-run welcome flow that prompts profile creation
- [ ] Sample-bean placeholder data for empty accounts
- [ ] Demo brew for new users to feel the app immediately

### Cold-start + virality (when Pin sends a link to a friend)
The hardest problem for a friends-first app: a brand-new user lands and the app feels empty.

- [ ] **Personalized invite links** — `mypour.app/i/<invite-token>` → landing page says "Pin invited you to Pour"
- [ ] **Auto-friend on invite acceptance** — Michael clicks Pin's link, signs up, lands signed in AND already friends with Pin (skips the username-search step)
- [ ] **Public preview before sign-up** — if invitee clicks link, show a teaser of Pin's most recent brew or starred recipe BEFORE asking them to sign in. Lowers friction.
- [ ] **Suggested friends** — friends-of-friends on signup. If Pin and Michael are friends, and Michael invites Sarah, suggest Pin to Sarah on first run.
- [ ] **Find friends by email** — paste a list of emails; show which ones are already on Pour
- [ ] **Onboarding flow that highlights friend's data** — after Michael signs up via Pin's invite, first-run screen shows "Here's what Pin has been brewing" with her best 3 recipes. Instant value, even before he logs anything.
- [ ] **Share link templates that explain Pour** — when Pin sends `mypour.app/i/abc`, the OpenGraph preview that renders in iMessage/WhatsApp shows: "Pour — coffee journal · Pin invited you" with a clean image
- [ ] **Username + display-name set during sign-up** (currently username auto-derived from email; have new users pick a friendly display name on first run)

---

## 🔵 Someday / icebox

- iOS native wrapper (Capacitor) — only if PWA proves insufficient
- Public community feed (Level 3) — opt-in, beyond friends
- Roaster directory + verified roaster accounts
- AI tasting note suggestions from photo
- Apple HealthKit / Strava-style stats
- Shopify / DTC roaster integrations
- Multi-user spaces (cafés, teams)

---

## 📋 Conventions

- Each shipped milestone gets a single squashed commit referencing its scope (e.g., "Ship v4")
- Migrations live in `supabase/migrations/NNN_short_name.sql` and are idempotent
- New non-trivial logic should ship with a Vitest unit test before merge
- Keep `plan.md` as the design spec; this file (`ROADMAP.md`) stays current
