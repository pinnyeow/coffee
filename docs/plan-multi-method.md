# Pour: log espresso and any pour over, without touching the xBloom flow

## Context
Pin logs an xBloom brew every day in Pour. Pour assumes every brew is xBloom, so Pin's V60s and Michael's cortados can't be logged properly. The question Pour answers for a customer is **"I have this bean and this brewer. What should I do?"** This plan adds the other brewers so that question gets the right answer on each one.

Five reviews shaped it: a product director, a UX design director (twice), a coffee connoisseur and a tech lead. All five said "ship with changes", and the changes are applied below. Pin also asked for Roast and Process on beans.

**Non-negotiable:** Pin's daily xBloom flow stays exactly as it is. The only new thing she'll see is a method row with xBloom already selected.

---

## What we're building, in one picture
```
 TODAY                                   AFTER
 ─────                                   ─────
 Every brew = xBloom                     Every brew has a method:
                                         xBloom · V60 · Espresso · More (Chemex, AeroPress,
                                         French press, Cold brew)

 One "best recipe" per bean              One best recipe per bean PER METHOD
                                         (your xBloom best and Michael's espresso best
                                          never overwrite each other)

 One form                                One form whose settings card changes shape:
                                         xBloom (as today) · Pour over · Espresso

 Bean: name, roaster, origin,            + Roast (Light/Medium/Dark) and
 bought in                                 Process (Washed/Natural/Honey/Anaerobic), tucked away
```

---

## Screen previews (phone width)

### A. Pin's daily xBloom log: what changes is marked ◆
```
┌─────────────────────────────────────┐
│ ← Log a brew                        │
│                                     │
│ ◆┌────────┬───────┬─────────┬──────┐│  new: method row,
│  │■xBloom │  V60  │Espresso │More ▾││  xBloom preselected
│  └────────┴───────┴─────────┴──────┘│
│  PROFILE  Market Lane ★ ▾           │  same picker as today: always shown,
│  Prefilled from your profile:       │  starred profile fills the form,
│  Market Lane.                       │  same hint as today
│                                     │
│  BEAN                               │
│  Ethiopia Guji                      │  unchanged
│  ROASTER          ORIGIN            │
│  Onyx             Ethiopia          │  unchanged
│ ◆▸ Bean details   Tokyo           ▾ │  was "Bought in"; Roast/Process
│                                     │  live inside (added in PR 4)
│ ┌─ XBLOOM SETTINGS ───────────────┐ │
│ │ DOSE        GRIND               │ │
│ │ 15          55                  │ │  every field, format and
│ │ WATER (ML)  TEMP (°C)           │ │  ratio (1:16.7) exactly
│ │ 250         92        1:16.7    │ │  as today
│ │ RPM         TIME                │ │
│ │ 80          3:10                │ │
│ └─────────────────────────────────┘ │
│  RATING *   ★ ★ ★ ★ ☆               │  unchanged
│  NOTES      ___________________     │
│ ┌─────────────────────────────────┐ │
│ │           Save brew             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### B. V60 (and Chemex, AeroPress, French press, cold brew)
```
┌─────────────────────────────────────┐
│  ┌────────┬───────┬─────────┬──────┐│
│  │ xBloom │ ■V60  │Espresso │More ▾││
│  └────────┴───────┴─────────┴──────┘│
│  BEAN  Ethiopia Guji   ...          │
│ ┌─ V60 SETTINGS ──────────────────┐ │
│ │ Last: Comandante 22 · 3:10 ·    │ │  muted hint: what you're
│ │       Sour · ★★★                │ │  correcting from
│ │ DOSE          WATER             │ │
│ │ 15 g          250 g    1:17     │ │  water in grams; ratio rounded
│ │ GRIND                           │ │
│ │ Comandante 22                   │ │  free text, prefilled
│ │ TEMP          TIME              │ │
│ │ 93 °C         3:10              │ │  "310" → 3:10
│ │ TASTED  optional                │ │
│ │ (Sour) (Just right) (Bitter)    │ │  tells you which way to grind
│ └─────────────────────────────────┘ │
│  RATING *  ★ ★ ★ ★ ☆   NOTES ___    │
│  [           Save brew            ] │
└─────────────────────────────────────┘
 More ▾ → picking Chemex puts it in the 4th slot: [■Chemex ▾]
```

### C. Michael's cortado
```
┌─────────────────────────────────────┐
│  ┌────────┬───────┬─────────┬──────┐│
│  │ xBloom │  V60  │■Espresso│More ▾││  remembered: last method
│  └────────┴───────┴─────────┴──────┘│  on this bean
│  BEAN  Ethiopia Guji   ...          │
│ ┌─ ESPRESSO SETTINGS ─────────────┐ │
│ │ Last: Niche 14 · 18→36 · 28s ·  │ │
│ │       Sour                      │ │
│ │ DOSE          YIELD             │ │
│ │ 18 g    →     36 g     1:2      │ │
│ │ GRIND                           │ │
│ │ Niche 14                        │ │
│ │ TIME          DRINK             │ │
│ │ 28 s          Cortado ▾         │ │  sticky: zero taps most days
│ │ TASTED  optional                │ │
│ │ (Sour) (Just right) (Bitter)    │ │
│ └─────────────────────────────────┘ │
│  RATING *  ★ ★ ★ ★ ☆   NOTES ___    │
│  [           Save brew            ] │
└─────────────────────────────────────┘
```

### C2. The Drink picker (tap "Cortado ▾")
```
┌─────────────────────────────┐
│ DRINK                       │
│  Espresso      (straight)   │
│  Americano     (+ water)    │
│ ■Cortado       (+ milk)     │
│  Macchiato     (+ milk)     │
│  Flat white    (+ milk)     │
│  Cappuccino    (+ milk)     │
│  Latte         (+ milk)     │
└─────────────────────────────┘
```
- Ordered from least to most milk.
- Remembers your last choice per user, so Michael's "Cortado" is zero taps.
- It's a label only: a cortado and a latte from the same shot recipe share one best espresso recipe, because the shot is what you dial in.
- Shows on the brew row, the bean page and in share text ("Cortado · 18g → 36g").
- **Milk kind (Pin's choice):** an optional chip row that appears right under Drink, only for milk drinks (Cortado, Macchiato, Flat white, Cappuccino, Latte):
  ```
  │ TIME          DRINK             │
  │ 28 s          Cortado ▾         │
  │ MILK  optional                  │
  │ (■Whole) (Oat) (Other)          │   remembers your last choice; tap again to clear
  ```
  It's a label on the brew. It shows in the brew row and share text ("Cortado, oat · 18g → 36g") and never affects best-recipe picking. It's hidden for Espresso and Americano.
- Milk amount (ml) is left out; use notes.

### D. Dialing in: right after saving a shot
```
┌─────────────────────────────────────┐
│  ✓ Saved                            │
│ ┌─────────────────────────────────┐ │
│ │        Log another shot         │ │  reopens with same bean, dose,
│ └─────────────────────────────────┘ │  grind, drink; you change
│              Done                   │  grind/time and rate
└─────────────────────────────────────┘
 (espresso only; xBloom saves exactly as today)
```

### E. Bean details (PR 4), collapsed by default
```
┌─────────────────────────────────────┐
│ ▾ Bean details  Medium · Washed · Tokyo │
│   ROAST     (Light) (■Medium) (Dark)│
│   PROCESS   (■Washed) (Natural)     │
│             (Honey) (Anaerobic)     │
│   COUNTRY Japan   CITY Tokyo        │
│   SHOP / CAFE  Torahebi             │
└─────────────────────────────────────┘
 Opens automatically only for a brand-new bean; remembered afterwards.
```

### F. Home cards
```
 Brewed one way (xBloom): exactly today
┌─────────────────────────────────────┐
│ Kenya Nyeri                  ★★★★☆  │
│ Kenya · Sey · 3 brews · today       │
│ BEST RECIPE                         │
│ 15g · 250ml · 1:16.7 · 92°C · 55 · 3:10│
└─────────────────────────────────────┘
 Espresso only (PR 2)
┌─────────────────────────────────────┐
│ Brazil Cerrado               ★★★★☆  │
│ Brazil · Onyx · 5 brews · today     │
│ BEST ESPRESSO                       │
│ 18g → 36g · 1:2 · 28s · Niche 14    │
└─────────────────────────────────────┘
 Brewed two ways (PR 3)
┌─────────────────────────────────────┐
│ Ethiopia Guji                ★★★★☆  │
│ Guji · Onyx · 6 brews · today       │
│ BEST ESPRESSO                       │
│ 18g → 36g · 1:2 · 28s · Niche 14    │
│ also xBloom                         │  muted
└─────────────────────────────────────┘
```

### G. Bean page brewed two ways (PR 3)
```
┌─────────────────────────────────────┐
│ Guji · Onyx · Medium · Washed       │
│ Ethiopia Guji                       │
│ 6 brews · ★★★★☆ avg                 │
│ ┌────────────────┬────────────────┐ │
│ │  xBloom · 4    │■ Espresso · 2  │ │  same style as the method row
│ └────────────────┴────────────────┘ │
│ ┌─ ✨ BEST ESPRESSO ── Starred ───┐ │  same amber card as today
│ │ DOSE   YIELD   RATIO            │ │
│ │ 18g    36g     1:2              │ │
│ │ GRIND        TIME               │ │
│ │ Niche 14     28s                │ │
│ │ [ Use these settings → ]        │ │  opens Log on Espresso, prefilled
│ └─────────────────────────────────┘ │
│ ─ Your brews ───────────────────────│
│ Today                               │
│ 18→36 · 28s · Just right   ★★★★★    │
│ 18→38 · 24s · Sour         ★★★☆☆    │
└─────────────────────────────────────┘
 One method only: page looks exactly like today (no toggle).
```

### H. Share text
```
 xBloom (unchanged, byte for byte):
   ☕ Ethiopia Guji — Ethiopia · Onyx
   15g · 250ml · 1:16.7 · 92°C · Medium grind · 3:10
 V60:
   ☕ Ethiopia Guji — Ethiopia · Onyx
   V60 · 15g · 250g · 1:17 · 93°C · Comandante 22 · 3:10
 Espresso:
   ☕ Ethiopia Guji — Ethiopia · Onyx
   Cortado · 18g → 36g (1:2) · 28s · Niche 14
```

---

## Your saved profiles (e.g. "Market Lane", "Beta coffee") are safe
- **Nothing is deleted or rewritten.** The migration only *adds* an empty `grind_setting` column to `profiles`. Names, dose, grind number, ratio, RPM, temp and the ★ default all stay as they are.
- **xBloom prefill stays exactly as today.** A new xBloom log fills from your starred xBloom profile, with the hint "Prefilled from your profile: …". The full Profile picker is always shown, and you can switch to Market Lane or Beta coffee in one tap. A "Use these settings →" link from a bean still overrides it, same as today.
- **The "last brew first" prefill applies only to the new methods** (V60 etc. and Espresso). There's no xBloom history on those methods for it to clash with.
- Each method only shows its own profiles. Today's xBloom profiles all show under xBloom, and V60 or Espresso profiles show under their method.
- **Preview check:** open Log and confirm the starred profile fills in and both profiles are in the picker, same as production.

## Product guide (`/welcome`) stays truthful
The live guide at mypour.vercel.app/welcome (`src/app/welcome/page.tsx`) already says V60, Chemex and AeroPress are "supported today", with espresso, French press and cold brew "coming". Today those methods exist only as profiles: every brew is saved with xBloom fields. The guide is updated in the same PR as each feature it describes, never ahead of it:

| PR | Guide changes |
|---|---|
| PR 1 | None (nothing visible changes) |
| PR 2 | Page description, hero text and method pills: drop "espresso coming" and list all 7 methods. Step 1 "Log fast": pick your method, the form adapts, and "Log another shot" for dialing in espresso. "Set a profile" step: profiles per method. FAQ "Do I need an xBloom?": every method is supported. Share FAQ: add an espresso example (`Cortado · 18g → 36g (1:2) · 28s · Niche 14`). Keep the universal example in step with what the code actually prints. |
| PR 3 | Step 2 "Find the best settings": one best recipe per bean **per method**. |
| PR 4 | Mention Roast and Process under bean details. |

The guide counts toward each PR's preview check: every claim on `/welcome` must be true on that preview.

**Brews already logged with a V60, Chemex or AeroPress profile:** a brew never recorded which profile it used, so migration 010 marks every past brew as xBloom. The first read-only check (`select method, count(*) from profiles group by method`) shows whether this affects you. If it does, PR 2's Edit form lets you switch those brews to their real method (each switch also moves its star to that method).

## Changes and tradeoffs from the reviews

### What changed
| # | Change | Raised by | Why |
|---|---|---|---|
| 1 | Best recipe and best-brew star are separate per method | Product | Starring a V60 must never wipe your xBloom star (today's code would) |
| 2 | Default method = last used on this bean, else most frequent in 14 days | Product (twice) | "Last method overall" would silently file Monday's xBloom as V60 |
| 3 | xBloom form, ratio, Home card and share text stay exactly as today | Product, UX, Tech | Your daily flow; earlier drafts had changed rounding, units and labels |
| 4 | Profile picker kept (always shown, as today) and filtered to the method; xBloom still prefills from your starred profile | Me, on your xBloom and profile questions | Market Lane / Beta coffee work exactly as today |
| 5 | Profile grind keeps its number; a new text field covers other grinders | Me, Tech | Zero conversion risk to your xBloom profiles |
| 6 | "Yield" instead of "Out" or "Shot" | Connoisseur, UX | It's the word espresso people use |
| 7 | Water in grams for pour over | Connoisseur | V60 people weigh water; 1:17 is a weight ratio |
| 8 | "Tasted" chip (Sour / Just right / Bitter) | Connoisseur, UX | It tells you which way to grind next; stars can't |
| 9 | "Last:" hint line | Connoisseur | Pour over dial-in happens across days; you need to see what you're correcting from |
| 10 | "Log another shot" | Product | Espresso is dialed in 3 shots in 10 minutes |
| 11 | Roast and Process inside a collapsed "Bean details" | UX | Keeps your daily form the same height |
| 12 | Edit form supports methods | Product | Fixing a fat-fingered yield is a day-one need |
| 13 | Friends' recipes and "Use these settings" links work per method | Tech | Otherwise a friend's espresso shows as their pour-over recipe |
| 14 | 4 small PRs instead of 1 big one; foundation first, invisible | Product, Tech | Lower risk, and Michael uses it a week before the bean-page changes |
| 15 | Old forms open during a deploy still save as xBloom | Tech | A deploy can never break a save in progress |
| 16 | Drink picker gains Macchiato; optional Milk kind (Whole/Oat/Other) for milk drinks | Pin | Michael's cortado might be oat one day and whole the next |
| 17 | One method config file drives fields, labels and share text | Tech | Scalable: adding a method is one entry, not edits in 6 files |

### Tradeoffs (what we gave up, and why)
| We chose | Over | Tradeoff |
|---|---|---|
| xBloom left exactly as is | Applying the nicer rounding, units and "310 → 3:10" everywhere | Small inconsistency between xBloom and the new methods; revisit in a polish pass |
| Tasted on espresso and pour over only | Tasted on xBloom too | Can't record sour/bitter on xBloom except in notes |
| Re-prefill on method switch | Remembering typed values per method | If you type V60 numbers, then switch to Espresso and back, the V60 numbers refill from history, not from what you typed |
| No roast date yet | "Day 9 off roast" on every brew | Loses the main reason a recipe drifts week to week. A bean is shared while a roast date is per bag, so it needs its own design (PR 4 candidate) |
| Rating still required (defaults to 4) | Optional rating for dial-in shots | Sink shots get a star rating; it's one tap and keeps averages honest |
| Cuts: pressure, pre-infusion, TDS, espresso temp, timer, Home method filter, "Other" method/drink/process, decaf, recipe line | More completeness | Power users may want them; notes cover the rare cases |
| 4 PRs | 1 PR | Takes longer end to end; each step is safer and testable |
| Home card shows the most recent method | The method with the most brews | A bag you just moved to espresso shows espresso right away; the "also xBloom" line covers the rest |

---

## Build
**One source of truth:** `src/lib/methods.ts` holds a config per method (form shape xbloom/filter/espresso, fields, labels, placeholders, time format, ratio formatter, share pieces, Zod refinements). The Log and Edit forms share one `MethodFields` component. `share.ts`, the Home cards and the bean page read from this config.

**PR 1: foundation (no visible change)**
- Run read-only checks: `select method, count(*) from profiles group by method`, and look for duplicate `is_best` per (user, bean).
- Migration `010_brew_methods.sql`, which Pin runs in the SQL editor **before** merging any code that reads the new columns:
  - `brews.brew_method`: not null, default `'xBloom'`, checked (instant backfill)
  - `yield_g`, `grind_setting`, `drink_style` (checked: Espresso, Americano, Cortado, Macchiato, Flat white, Cappuccino, Latte), `milk_kind` (checked: whole, oat, other; only valid with a milk drink, enforced in Zod), `taste_balance` (sour/balanced/bitter)
  - `beans.roast_level`, `beans.process` (checked)
  - `profiles.grind_setting`
  - index on (user_id, bean_id, brew_method); partial unique index allowing one best per (user, bean, method)
- Code changes:
  - `src/lib/recipe-picker.ts`: pick per method.
  - `src/lib/actions/brews.ts`: Zod `brew_method` defaults to xBloom; clearing the best is scoped to the brew's new method.
  - `src/app/page.tsx`, `home-friends-view.tsx`, `src/app/beans/[slug]/page.tsx`: fetch the method and group per method.
- **Preview gate:** Home, the bean pages, the Friends view and xBloom share text are all identical to production.

**PR 2: log any method (screens A–D, F single-method espresso, H)**
- `src/lib/methods.ts` and `MethodFields` in `src/app/log/log-brew-form.tsx` and `src/app/brews/[id]/edit-brew-form.tsx`.
- `src/app/log/page.tsx`: remove the profile filter and the "Espresso coming soon" hint; add the default-method and prefill queries.
- Zod per method:
  - Espresso: yield 5–150 g is required; water and temp are stripped; time 5–120 s.
  - xBloom: numeric grind only.
  - Other methods: grind text up to 40 characters.
- "Log another shot", method label on brew rows, share text in `src/lib/share.ts`.
- "Use these settings" links in `beans/[slug]/page.tsx` and `brews/[id]/page.tsx`.
- Profile `grind_setting` input in `settings/profiles/*` and `src/lib/actions/profiles.ts`.

**PR 3: beans brewed two ways (screens F two-method, G).** Bean page toggle and the two-method Home card, adjusted after a week of Michael using PR 2.

**PR 4: Bean details (screen E).** Roast and Process chips, the bean page subtitle, and the roast date design if still wanted.

**Styling reuse (no new visual styles):**
- `FilterChip` from `home-mine-view.tsx`, moved to a shared file.
- `Field` labels, the Bought-in `<details>`, the settings card, the star buttons, the blue hint banner, the amber best card and `Stat`, and the stone-900 Save button.

## Test-driven approach (how every PR is built)

**What we have today:** Vitest runs in a Node environment. It covers 42 tests of pure logic in `src/lib/__tests__/` (recipe picker, share, slug, Obsidian parser). CI runs `npm run typecheck` and `npm test` on every PR. There are no component tests yet.

**The loop for every change:**
1. **Red:** write the test for the behavior first, and confirm it fails (`npm run test:watch`).
2. **Green:** write the smallest code that makes it pass.
3. **Refactor** while it stays green.
4. Before each push: `npm run typecheck && npm test` locally, then CI, then the Vercel preview checklist.

No PR is opened with a failing or skipped test.

**Step 0, before touching any code: lock in today's xBloom behavior.** These are characterization tests written against the *current* code. They pass today and must stay green through all 4 PRs. They're the safety net for "never break xBloom":
- **xBloom share text:** golden strings for a real-looking brew in universal and xBloom modes, extending `share.test.ts`.
- **Picker behavior:** recipe picking, labels ("Best" / "Latest") and averages for xBloom-only beans, extending `recipe-picker.test.ts`.
- **Log prefill:** today's logic (URL params, then the starred profile, plus the hint text), extracted unchanged from `src/app/log/page.tsx` into a pure `buildLogDefaults()` in `src/lib/log-defaults.ts`. A test pins that a starred "Market Lane" profile fills dose, grind, RPM, temp and water.
- **Brew validation:** today's Zod schema, moved unchanged from `src/lib/actions/brews.ts` into `src/lib/validation/brew.ts`. A test pins that a current xBloom form submission validates the same way.

**Keep the logic testable:** each new rule lives in a pure function in `src/lib/`, so it can be tested before it has any UI:

| Rule | Pure function (file) | Tests written first |
|---|---|---|
| Method config | `METHODS` (`src/lib/methods.ts`) | each method has its shape, labels and fields; xBloom fields equal today's |
| Best per method | `pickRecipesByMethod` (`recipe-picker.ts`) | an espresso brew never becomes the xBloom best; stars kept per method; friends grouped per method |
| Default method | `defaultMethod(brews, beanId, now)` (`methods.ts`) | last method on this bean, then most frequent in 14 days, then xBloom |
| Prefill | `buildLogDefaults()` (`log-defaults.ts`) | xBloom output is unchanged from Step 0; new methods use last brew on bean+method, then last brew on method, then starred profile |
| Validation | `brewSchema` (`validation/brew.ts`) | missing method → xBloom; espresso requires yield 5–150; water/temp stripped for espresso; milk kind only with milk drinks; xBloom grind numeric |
| Ratio format | `formatRatio(method, a, b)` | xBloom 1:16.7 (unchanged); filter 1:17; espresso 1:2 / 1:2.1 |
| Time input | `parseTime(method, input)` | "310" → 190 s for filter; "3:10" pasted still works; espresso seconds only |
| Share text | `formatBrewAsText` (`share.ts`) | xBloom golden strings unchanged; V60 and espresso formats; "Cortado, oat" |
| Links | `buildUseSettingsUrl(brew)` (new, shared by bean and brew pages) | round-trips method, yield, grind text, drink and milk |
| Star clearing | `bestScope(input)` (used by `actions/brews.ts`) | clearing the best is scoped to (user, bean, *new* method) |
| Dial-in reset | `nextShotDefaults(saved)` | keeps bean, dose, grind, drink and milk; clears Tasted; rating back to 4 |

**Component tests (added in PR 2):**
- Add `@testing-library/react`, `jsdom` and `@testing-library/user-event` as dev dependencies. Use `// @vitest-environment jsdom` per file so the existing Node tests are untouched.
- Test `MethodFields` and the method row:
  - xBloom renders exactly today's fields and labels.
  - Switching to Espresso shows Yield, Drink and Tasted, and hides Water, Temp and RPM.
  - Milk appears only for milk drinks.
  - Switching method keeps bean, dose, rating and notes.
  - The Profile picker lists only that method's profiles, with the starred one selected.

**Database (not testable locally; no local Supabase):**
- Before the migration, run the read-only checks.
- After running `010` in the SQL editor, run the verification queries in the PR description:
  - every brew has a `brew_method`, and they're all `'xBloom'`;
  - the profile count is unchanged;
  - no duplicate bests per (user, bean, method);
  - all new columns are null on old rows.
- Pin pastes the results back before the code PR is merged.

**Validating as we go (every PR):**
| Gate | Check |
|---|---|
| Local | typecheck + all tests green, including the Step 0 xBloom tests |
| CI | GitHub Actions "Typecheck + Tests" passes |
| Preview at 375px | the xBloom regression checklist (below), then that PR's new checks |
| After merge | production deploy succeeds; sign in and log one xBloom brew |

## Verification
**Tests (Vitest, plus typecheck, run locally before every push):**
- Best recipe picked per method, for your own and friends' brews.
- Starring when a brew's method changes.
- An old form with no method saves as xBloom.
- Espresso water is stripped.
- Import creates xBloom brews.
- The default-method rule and the prefill order.
- Ratio formats.
- Share text per method, with the existing xBloom share test unchanged.
- "Use these settings" links round-trip.

**xBloom regression checklist (preview at 375px, every PR):**
1. Open Log. The starred profile (e.g. Market Lane) fills the form, the hint text is unchanged, and both profiles are in the picker.
2. Switch to Beta coffee. The fields update the same way they do in production.
3. Save. Then edit the brew, mark it best, and share it. Each matches production exactly.
4. Home and that bean's page look identical to production.

**New-feature preview checks:**
- PR 2: log a V60, a Chemex and 3 espresso shots via "Log another shot". Every row fits, and the "Last:" hint is right.
- PR 3: the Home card and the bean page toggle agree.

**Success after launch:**
- Michael logs at least 10 espresso brews in 2 weeks.
- Almost no brews get their method changed in Edit.
- Pin's weekly xBloom count holds steady.
- A second dial-in shot takes 4 taps or fewer.

Before PR 2, update `docs/plan-multi-method.md` to match this plan.

## Where the plan lives (Pin's choice: both)
1. **In the repo:** replace `docs/plan-multi-method.md` with this plan (screen previews, tradeoffs, build and test approach) and commit it to PR #7 (`feat/brew-methods-foundation`). Readable on GitHub and versioned with the code.
2. **Shareable page:** publish the same content as a private Claude artifact page with the screen previews. It's private until Pin chooses to share it.
3. From then on, plan changes are made in the repo doc first, then the page is republished from it, so the two never drift.
