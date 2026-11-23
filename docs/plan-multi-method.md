# Pour: log espresso and any pour over

## 1. Problem and goal
Pour assumes every brew is an xBloom brew, so V60 brews and espresso drinks like cortados can't be logged properly. Pour exists to answer **"I have this bean and this brewer. What should I do?"** This work makes that answer right for every brewer.

**Non-negotiable:** the daily xBloom flow does not change. The only new thing on it is a method row with xBloom already selected.

## 2. What changes for customers

### A. The daily xBloom log: what changes is marked ◆
```
┌─────────────────────────────────────┐
│ ← Log a brew                        │
│                                     │
│ ◆┌────────┬───────┬─────────┬──────┐│  new: method row,
│  │■xBloom │  V60  │Espresso │More ▾││  xBloom preselected
│  └────────┴───────┴─────────┴──────┘│
│  PROFILE  Light roast ★ ▾           │  same picker as today: always shown,
│  Prefilled from your profile:       │  starred profile fills the form,
│  Light roast.                       │  same hint as today
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

### C. An espresso drinker's cortado
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
- Remembers your last choice per user, so a regular "Cortado" is zero taps.
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

## 3. Rules
- **Best recipe and best-brew star are per bean per method.** Starring a V60 never clears the xBloom star, and an espresso shot is never shown as a pour-over recipe (yours or a friend's).
- **Default method:** the method last used on this bean, otherwise your most frequent method in the last 14 days, otherwise xBloom. A plain "last method" default would file Monday's xBloom brew as V60 after one weekend V60.
- **Prefill:**
  - xBloom: exactly as today (URL from "Use these settings", then your starred profile).
  - Other methods: your last brew of this bean on this method, then your last brew on this method, then your starred profile for that method.
- **Switching method:** bean, dose, rating and notes carry over. The method's own fields refill from the prefill rules.
- **Labels never split recipes:** drink, milk and Tasted are recorded on the brew but don't affect which recipe is best. The shot is what you dial in.
- **Same words everywhere:** Dose, Yield, Grind, Time, Tasted, and the same method names on Log, Home, the bean page and share text.
- **Every row fits a 375px-wide phone screen.**

## 4. What stays exactly the same
- **Saved profiles** (e.g. "Light roast", "Geisha"): nothing is deleted or rewritten. The only change is a new, empty grind-text column for non-xBloom grinders.
- **The xBloom form:**
  - Same fields, same numeric grind dial, same ratio format (1:16.7) and same time entry.
  - The profile picker is always shown, and the starred profile fills the form with the same hint.
- **Home cards and bean pages for beans brewed one way.**
- **xBloom share text**, byte for byte.

## 5. Tradeoffs
| We chose | Instead of | What we give up |
|---|---|---|
| xBloom left exactly as is | New rounding and time entry everywhere | Small inconsistency between xBloom and the new methods |
| Tasted only on espresso and non-xBloom pour over | Tasted on xBloom too | Sour/bitter on xBloom goes in notes |
| Re-prefill when you switch method | Remembering what you typed per method | Switching away and back refills from history, not your typing |
| No roast date yet | "Day 9 off roast" on each brew | Can't see why a recipe drifts; a bean is shared but a roast date belongs to one bag, so it needs its own design |
| Rating still required (defaults to 4) | Optional rating for dial-in shots | Throwaway shots get a rating |
| Home card shows the most recently used method | The method with the most brews | Older methods show only as "also xBloom" |
| 4 small PRs | 1 big PR | Takes longer overall; each step is safer |

## 6. Not doing
Pressure, pre-infusion, TDS, espresso temperature, in-app timer, milk amount, a method filter on Home, an "Other" method, drink or process, decaf, and a free-text recipe line. Notes cover the rare cases.

## 7. Build order
**One source of truth:** `src/lib/methods.ts` defines each method's form shape (xBloom / filter / espresso), fields, labels, time format, ratio format and share text. The Log and Edit forms share one `MethodFields` component. No new visual styles: reuse `FilterChip`, `Field`, the settings card, the "Bought in" collapsible, the amber best card and `Stat`.

| PR | Scope | `/welcome` guide | Merge gate |
|---|---|---|---|
| **1. Foundation** (draft #7) | Migration 010 (additive; every brew becomes xBloom); recipes and stars per method; old forms save as xBloom | No change | Migration run and checked; preview identical to production |
| **2. Log any method** | Screens A–D, H; Edit form; espresso-only Home card; per-method validation; "Use these settings" carries the method; profile grind text | Drop "espresso coming"; Log step, profile step, "Do I need an xBloom?" FAQ, espresso share example | Your V60, Chemex and 3 espresso shots logged on the preview |
| **3. Beans brewed two ways** | Screens F (two methods) and G: bean page toggle, "also xBloom" line. After a week of real use of PR 2 | "Best settings" step: one best per method | Home card and bean page toggle agree |
| **4. Bean details** | Screen E: Roast and Process; roast date design if still wanted | Mention Roast and Process | Bean details save and prefill |

**Database rule:** previews share the production database. So each migration is run in the Supabase SQL editor, and checked, **before** merging code that reads its columns.

## 8. How we test
- **xBloom baseline** (`src/lib/__tests__/xbloom-baseline.test.ts`):
  - pins today's share text, recipe picking, profile prefill and validation;
  - was written against the old code;
  - must stay green in every PR. If one fails, fix the code, not the test.
- **Test first:** each rule above is a pure function in `src/lib/` (method config, best per method, default method, prefill, validation, ratio and time format, share text, links, "Log another shot" reset). Write a failing test, make it pass, then refactor.
- **Screen tests** from PR 2: React Testing Library checks that the xBloom form shows exactly today's fields, the right fields appear per method, milk shows only for milk drinks, and switching method keeps bean, dose, rating and notes.
- **Every PR before merge:**
  1. typecheck + tests locally;
  2. GitHub CI;
  3. on the preview at 375px: log an xBloom brew with a non-starred profile, then edit it, mark it best and share it. All of it must match production;
  4. every claim on `/welcome` is true.
- **Database:** read-only checks before and after each migration, listed in the PR. Example after-checks: all brews are xBloom; profile count unchanged.

## 9. Risks
- **Brews already logged with a V60, Chemex or AeroPress profile** become xBloom, because brews never stored their profile. The check `select method, count(*) from profiles group by method` shows whether this affects you. If it does, fix those brews with PR 2's Edit form.
- **Previews share production data.** Test brews logged on a preview are real. Delete them after checking.

## 10. Success
- The espresso drinker logs 10 or more espresso brews in the first 2 weeks.
- Almost no brews get their method changed in Edit; each change means the default was wrong.
- The owner's weekly xBloom brew count holds steady.
- A second dial-in shot takes 4 taps or fewer.
