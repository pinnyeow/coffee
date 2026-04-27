# Getting Started with Pour

*A coffee journal that learns from your friends.*

---

## What is Pour

Pour is where dedicated home brewers log every cup, find the recipe that worked, and share it with friends — even if their gear is different from yours.

It's built around three jobs:

1. **Log fast** — fields adapt to your method (xBloom, V60, Chemex, AeroPress, espresso). 30 seconds, one-handed, mid-brew.
2. **Find the best settings for any bean** — Pour groups your brews by bean and surfaces the recipe that worked. No more scrolling through a notes app trying to remember "what grind did I land on for this Ethiopian?"
3. **Share with friends** — your friends see your dialed-in recipes, and you see theirs. Tap "Use these settings" on a friend's recipe and your next brew starts pre-filled.

If you've been keeping coffee notes in Obsidian, Apple Notes, or a notebook — Pour is what you wish that notebook could do.

---

## The first 5 minutes

### Step 1 — Sign in (10 seconds)

Open `mypour.vercel.app/sign-in`. Type your email. Click **Send magic link**.

A one-time link arrives in your inbox. Click it once. You're in. No password to remember.

### Step 2 — Set a profile (1 minute, optional but recommended)

Tap the ⚙ in the top-right → **Settings** → scroll to **Pour over profiles**.

Tap **+ Add** and create your usual recipe. Example:
- Name: `Light roast / 4-pour`
- Method: xBloom
- Dose: 15g · Ratio: 1:17 · Grind: 55 · Temp: 92°C · RPM: 80

Star it as default. Now every new brew form starts with these values pre-filled. The fields you touch most often (dose, grind, time) take 5 seconds; the rest is auto-filled.

### Step 3 — Log your first brew (30 seconds)

From Home, tap **+ Log a brew**. Type the bean name. Adjust whatever's different from your profile. Rate it. Hit **Save brew**.

The brew appears on Home, grouped under that bean. Three more brews of the same bean will show up as one card with the *recommended recipe* surfaced inline.

### Step 4 — (Optional) Import your existing journal

Have years of notes in Obsidian? Settings → **Data** → **Import from Obsidian** → drop your `.md` file. Pour parses bold bean names and brew lines like `15g; 55; 80; 225ml; Time: 3:30`, creates beans + brews, and shows a preview before importing.

One-time only. Imported brews default to ★★★☆☆ since the journal didn't have ratings — rate the ones you remember, and Pour starts surfacing your real best.

### Step 5 — Invite a friend

Settings → **Friends** → find your username (auto-generated from your email; you can edit it). Share it. When your friend signs up, they add you with the same form. Once you're connected, the **Friends** tab on Home shows their brews. Each card has a **Use these settings** button — try their recipe with attribution back to them on your brew.

---

## What makes Pour different

### vs. Obsidian / Apple Notes

A notebook stores text. Pour stores **structured brews** — so when you ask "what was my best Torahebi Banana?", Pour answers in 0 seconds. No scrolling, no Cmd+F.

It also handles the boring stuff:
- Live ratio calculation (change dose, water updates; change ratio, water updates)
- Recommended recipe surfaced per bean
- Multiple profiles for different roast levels
- Auto-converts xBloom dial settings to "Medium grind" for friends who don't have one

### vs. generic coffee apps

Most coffee apps are either roaster catalogs or one-size-fits-all. Pour is built for people who **dial in** — multiple attempts on the same bean, tracking what changed, surfacing the keeper. The app's primary unit is a bean, not a transaction.

### vs. just sharing recipes in iMessage

When you send Michael "15g, grind 59, 80 RPM, 225ml" he has no idea what to do unless he also has an xBloom. Pour translates **the same recipe** into "Medium grind, 92°C, 1:15 ratio, 3:14 brew time" — universal across pour-over gear.

---

## Common questions

**Do I need an xBloom?**
No. Pour started xBloom-native (so the precision matters), but the form adapts to V60, Chemex, AeroPress, French press, and cold brew. Espresso support coming soon.

**Will my brews be public?**
No public feed exists. Brews default to friends-visible — only the friends you've explicitly added see them. Each brew has a 🔒 **Private** toggle if you want to keep a specific brew to yourself (a dial-in attempt you're not proud of, or personal notes).

**Will my notes be public?**
Same as brews — only your accepted friends see them, and never strangers.

**What happens if I share a recipe with someone who doesn't use Pour?**
Tap the **Share** button on any brew. Two modes:
- **Universal** — `15g · 255ml · 1:17 · 92°C · Medium grind · 3:14` (works anywhere)
- **xBloom** — exact dial numbers (for other xBloom users)

Copy as text, paste in WhatsApp / iMessage. Friend doesn't need an account.

**What if I forget my password?**
There isn't one. Sign-in is magic-link only — every time you sign in, you get a fresh one-time link by email.

**What if I want my data?**
Pour runs on Postgres (via Supabase). Export is simple — your data is yours. Reach out and we'll add a "Download my data" button when there's demand.

**Is this free?**
Yes, for now. The app is in early access — Pin and a small group of friends. No credit card.

---

## Quick reference

### Keyboard / tap shortcuts
- ⚙ icon → Settings
- Search bar on Home → filter beans by name, roaster, origin
- ★ chip → only show beans with explicitly starred recipes
- Tap any bean card → see all its brews + recommended recipe
- Tap any brew → edit, mark as best, mark private

### When you're brewing
- Open `mypour.vercel.app` (works on phone via cellular too — fully online)
- Tap **+ Log a brew**
- Profile pre-fills the constants; you change what's different
- Hit save before the cup gets cold

### When you're discovering
- Friends tab → see what your friends are dialing in
- Tap a card → bean detail
- Tap **Use these settings** → log your version, with credit to the friend

---

## What's next on Pour

Roadmap highlights (live at [`ROADMAP.md`](../ROADMAP.md)):

- **Espresso + cortado support** — Michael's drink of choice; coming next
- **Personalized invite links** — `mypour.app/i/<token>` so a friend lands on "Pin invited you"
- **Polish pass** — desktop framing, PWA (add to home screen on iOS), better empty states
- **Brew timer** — built-in, auto-fills the time field
- **Charts** — grind vs. time per bean, settings drift over many brews

---

## Get started

[**Sign in →**](https://mypour.vercel.app/sign-in)

Or if you got an invite link from a friend, click that — you'll be auto-friended with them on first sign-in.

---

*Pour is built with care for one specific person: someone who has tried the same bean five times trying to get it right, and finally did, and forgot what they did. It's for them.*
