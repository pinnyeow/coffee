# Pour — Coffee Journal & Community App

A mobile-first journal for pour over and espresso brews. Log in 30 seconds, find any past brew in 2 taps, share recipes with friends, and learn from their brews.

## Goals

1. **Easy to log** — one-handed on phone, mid-brew, minimum typing
2. **Easy to find the right settings** — when you pick a bean, the app shows proven recipes (yours + friends')
3. **Easy to share & learn — cross-gear** — friends without xBloom still get a recipe they can actually brew

## Core insight

Pin records xBloom-specific values (grind dial 59, RPM 80). A friend on V60 can't use those directly. The app stores xBloom-native values AND auto-translates to a universal recipe (ratio, temp, grind description) so shared recipes are portable.

## Users

- **Pin** — primary, PM, xBloom user, pour over
- **Michael** — Pin's bf, espresso + cortado
- **Friends** — invited later, private feed (no public community)

## Locked decisions

| Topic | Decision |
|---|---|
| Name | Pour |
| Community | Level 2 — friends + private feed |
| Database | Supabase (Postgres + auth + realtime, free tier) |
| Primary method | Pour over (xBloom is default) |
| Secondary | Espresso + cortado (for Michael) |
| Rating | 1–5 stars, required |
| Notes | Optional — rate-and-save is fine |
| Defaults | Configurable in Settings, auto-filled on every new brew |
| Recipe discovery | Bean detail shows your best + friend's best with "Use these settings" button |
| Similar-bean matching | Phase 2 |
| URL slugs | Human-readable (`/beans/torahebi-banana`) |
| Milk volume (espresso drinks) | Optional |
| Universal recipe translation | Auto-derive grind description from xBloom number; share card has "My settings / Universal" modes |
| Auto-calc ratio / water | Dose + Water + Ratio are live-linked in Log form — change one, the others recompute |
| Pour profiles | Multiple named profiles per method (e.g., "Light roast / 4-pour", "Geisha delicate"); one starred default per method; Log brew has a profile picker |
| Obsidian import | One-time on first run; seeds existing brews + creates a "My usual" profile from current defaults. No ongoing sync. |
| xBloom grind preservation | Raw xBloom number stored alongside description — never lost in translation |

## Profiles & autofill — the "less manual work" system

Instead of a single flat "default", users have **multiple named profiles** — one set per recipe style they use regularly.

**Example pour over profiles**
- `Light roast / 4-pour` ★ default — 15g · 1:17 · 92°C · grind 55 · 80 RPM · bloom 30 + 60·60·60·45
- `Dark roast / 3-pour` — 16g · 1:15 · 94°C · grind 52 · 80 RPM · bloom 32 + 80·80·50
- `Geisha delicate` — 13g · 1:17 · 90°C · grind 58 · 70 RPM

**Example espresso profiles (Michael)**
- `Cortado 1:2` ★ default — 18g in · 36g out · 28s · 93°C · + 60ml milk
- `Long espresso 1:3` — 18g in · 54g out · 32s · 93°C

**Log brew** has a profile picker at the top: change profile → form re-fills. Still overridable per-brew.

**Autofill priority on a new brew**
1. This bean's **best brew** → exact settings
2. This bean's **last brew** → its settings
3. **Starred profile** for the chosen method → profile defaults
4. Empty form fallback

**Constraint**: one starred (default) profile per method. Switching the star is one tap in Settings.

## Screens

### 1. Home
- Header: greeting, settings gear, profile avatar
- "＋ Log a brew" primary button
- Search bar (beans, roaster, origin, variety, process, flavor tags)
- Feed toggle: **Mine · Friends**
- Recent brews (filtered by toggle)
- "Your beans" tag list

### 2. Log brew
- **Method switcher** at top: xBloom / V60 / Chemex / AeroPress / Espresso / French press / Cold brew
- **Profile picker** right below (e.g., "Light roast / 4-pour ▾") — changing profile re-fills all fields
- Form adapts to method (xBloom shows RPM + pour schedule, espresso shows yield instead of water, etc.)
- For espresso: **drink style** selector (Espresso / Cortado / Latte / Flat white / Cappuccino / Americano / Macchiato)
- Bean autocomplete — preview shows settings from best brew for that bean
- Autofill hint banner: "Prefilled from your best brew of X" / "From your Light roast profile" / "From Michael's best brew"
- **Live-linked Dose / Water / Ratio** — change one, the others recompute (e.g., 15g + 1:17 → 255ml auto-fills)
- Estimated output shown read-only: `~225ml in cup` (water minus grounds retention)
- **Pour schedule** (xBloom, collapsed by default): Bloom + pours with volumes; sum auto-validates against total water
- Rating (1–5 stars) — only required field
- Notes — optional
- Save

### 3. Bean detail (hero of the app)
- Bean name, roaster, origin, variety, process, roast, flavor tags
- **Bought in** — country + city + shop (e.g., "Spain · Barcelona · Obadiah Acid Cafe")
- **Recommended recipe card** at top — leads with universal settings (ratio, temp, time, grind description), xBloom-specific below
- "Use these settings" → pre-fills Log brew (including pour schedule)
- Toggle: **Your brews · Michael's brews · Friends' brews**
- Best brew pinned with ★
- All brews, newest first

### 4. Brew detail
- All fields, readable, editable (own brews only)
- Ratio auto-calculated
- Star toggle
- Share
- "Copy to my journal" (if viewing a friend's brew)

### 5. Search
- Full-text across beans, roasters, origin
- Filters: variety, process, roast level, flavor tags, method
- Results show bean card with best settings preview

### 6. Settings
- **Pour over profiles** — list of named profiles, star the default, tap to edit, swipe to delete
- **Espresso profiles** — same but for espresso
- Grind translation reference (xBloom ↔ Fine/Medium/etc.)
- Temperature unit (°C / °F)
- Profile (name, avatar, username)
- Friends — list, add friend, invite link
- **Import from Obsidian** — one-time button on first run; disappears after first successful import
- Export backup

### 7. Share sheet
- Visual brew card (dark gradient) with **two modes**:
  - **My settings** — exact xBloom numbers (for you + other xBloom users)
  - **Universal** — dose, water, ratio, temp, time, grind description (works on any pour over gear)
- Copy as text · Save as image · Share link (Phase 2)
- Both text and image cards respect the selected mode

## Data model

```
users
  id, username, display_name, avatar_url, created_at

friendships
  user_id, friend_id, status (pending/accepted), created_at

beans
  id, slug, name, roaster, origin, variety, process,
  roast_level, flavor_tags (array),
  purchased_country, purchased_city, purchased_at,   -- where Pin bought it
  created_by_user_id, created_at

brews
  id, user_id, bean_id,
  brew_method, drink_style,          -- drink_style for espresso
  dose_g, grind, rpm, water_ml, water_temp_c,
  yield_g, pressure_bar,              -- espresso-specific
  time_seconds, milk_ml,              -- milk_ml optional (cortados etc.)
  rating, notes, is_best,
  visibility (self / friends),        -- controls who sees it
  created_at

profiles (multiple per user, one starred default per method)
  id, user_id, name,
  method (xBloom / V60 / Chemex / AeroPress / Espresso / French press / Cold brew),
  dose_g, grind, ratio, rpm, temp_c,
  pours (jsonb),           -- pour over
  yield_g, time_s,         -- espresso
  is_default, created_at

settings (one row per user, now minimal)
  user_id, temp_unit, onboarded_from_obsidian (bool)
```

Fields can be null when they don't apply to the method (e.g., `rpm` for V60, `water_ml` for espresso).

## Tech stack

- **Next.js 15** (App Router) — web + mobile web
- **Supabase** — Postgres database, auth (magic link / Google), realtime for friend feed
- **Tailwind CSS** — styling
- **Server Actions** — mutations, wrapped with Supabase's Row Level Security
- **Vercel** — Phase 2 deploy

## Security & Quality

### Security — 4 layers

1. **Auth** — Supabase magic-link login. No passwords stored on our end.
2. **Row Level Security (RLS)** — Postgres policies enforce access at the database level:
   - `brews`: user can read/write only rows where `user_id = auth.uid()`; friends can read where `visibility = 'friends'` AND friendship exists
   - `settings`: user can read/write only own row
   - `beans`: anyone authenticated can read; only creator can edit
3. **Input validation** — every Server Action validates payload with Zod:
   - `rating` ∈ [1,5], `dose_g` > 0, `water_ml` > 0, method ∈ allowed list, etc.
4. **Secrets & transport** — Supabase keys in `.env.local` (gitignored), HTTPS everywhere via Vercel.

### Evaluation — 3 layers

**A. Automated tests**
- **Unit** (Vitest) — ratio math, grind-description translation, pour schedule sum validation, autofill priority logic
- **Integration** — server actions end-to-end against a test Supabase project
- **E2E** (Playwright) — critical flows: sign in → log brew → see on Home → share → copy

**B. Product metrics**

| Metric | Target | How measured |
|---|---|---|
| Time to log a brew | < 30s | Stopwatch on first 10 logs |
| Time to find best settings for known bean | < 10s | Stopwatch from Home → Use these settings |
| Shared recipes brewed by friend | qualitative | Ask Michael weekly |
| Weekly logs after 2 weeks | > 5/week per user | Count in DB |
| App error rate | 0 | Supabase logs + browser console |

**C. Weekly dogfood review**
- You + Michael use Pour for a week, we run a retro: what broke, what felt slow, what's missing
- Log issues in GitHub, fix highest-impact first

### Pre-launch checklist (before Phase 2 deploy)
- [ ] All RLS policies tested with a second user account
- [ ] Zod schemas on every server action
- [ ] Unit test coverage on business logic (ratio, grind, autofill)
- [ ] E2E test passing: sign-in, log, share flows
- [ ] Rate limiting on auth endpoints (Supabase default)
- [ ] Error monitoring (Sentry free tier or Vercel logs)
- [ ] Data export tested end-to-end

## Build phases

### Phase 1 — Local dev (now)
- [ ] Next.js scaffolded (done)
- [ ] Supabase project created (free tier), local dev uses hosted DB directly
- [ ] Auth: magic link — Pin + Michael sign in with email
- [ ] Schema created via Supabase SQL editor
- [ ] One-time Obsidian import flow on first run (parse `.md`, preview, confirm, create beans + brews + "My usual" profile)
- [ ] Settings screen with multiple profiles per method (starred default)
- [ ] Home with Mine/Friends feed toggle
- [ ] Log brew with method-adaptive form
- [ ] Bean detail with recommended recipe card
- [ ] Brew detail
- [ ] Friends: add by username, see their brews
- [ ] Share: copy as text

**Verification**: Pin logs 3 brews, Michael logs 1 cortado, each sees the other's brews. Bean detail shows recommended settings.

### Phase 2 — Public polish
- [ ] Deploy to Vercel
- [ ] Public share links (`/b/<id>`) for specific brews
- [ ] Save brew card as image
- [ ] Full search with filters
- [ ] Similar-bean recommendations (origin + roast match)
- [ ] "Copy friend's brew to my journal" action
- [ ] Realtime feed updates via Supabase subscriptions

### Phase 3 — Delight
- [ ] Built-in brew timer
- [ ] Export to Obsidian markdown
- [ ] Charts: grind vs. time, settings drift per bean
- [ ] Community average rating per bean
- [ ] iOS home screen shortcut (PWA)

## Sharing — format spec

Pour over:
```
☕ Torahebi Banana (Ethiopia)
xBloom · 15g · grind 59 · 80 RPM · 92°C · 225ml · 3:14
Ratio 1:15 · ★★★★☆

— via Pour
```

Espresso (cortado):
```
☕ Legend Geisha — Cortado
18g in · 36g out · grind 7 · 93°C · 28s · 60ml milk
★★★★★

— via Pour
```

## Non-goals

- Public feed (everyone sees everyone) — not Level 3
- Social comments / reactions (Phase 3 maybe)
- Offline-first sync
- AI tasting recommendations

## Reference files

- Obsidian journal: `~/Documents/Obsidian Vault/Pour Over Journal - Coffee.md`
- UI prototype: `./prototype.html`
- Architecture walkthrough: `./architecture.html`
