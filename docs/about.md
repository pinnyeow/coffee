# About Pour

## Why Pour exists

Pin had been logging pour-over brews in Obsidian for years — every Ethiopian, every Kenyan, every dial-in attempt at home on her xBloom. The notes worked, but two problems kept nagging:

1. **Finding the best settings was annoying.** Every time she opened a new bag, she'd scroll past 20 attempts looking for "the one that finally worked." Sometimes she'd give up and just guess.
2. **Sharing recipes with friends was awkward.** Michael (her partner, espresso person) couldn't use her xBloom dial numbers. A friend on a V60 needed translation. Sending "15g, grind 59, 80 RPM" to anyone who didn't have her exact gear was useless.

Pour is the app that fixed both of those for her. Now it's open to friends, and slowly the people they invite.

---

## What we believe

### Coffee journaling should reduce typing, not add it

Every design choice asks: *can we save the user from re-entering this?* Profiles auto-fill defaults. Bean info is remembered. Live ratio calculation means changing one number updates the others. The form is shorter than your old notes were.

### Beans, not brews, are the unit

Most coffee apps treat each cup as a separate entry. Pour treats brews as **attempts at dialing in a bean**. Home shows beans, with the best recipe surfaced. A brew matters because of its bean.

### Friends > strangers, always

Pour has no public feed. There's no "trending" tab, no roaster ratings to game, no influencer accounts. Just your friends and people they invite. Visibility is opt-in and per-brew. Most coffee apps optimize for engagement; Pour optimizes for trust.

### xBloom precision, friend-portable

Pour stores your exact dial settings (grind 59, RPM 80) AND auto-translates to a universal description ("Medium grind, 92°C") so a friend without an xBloom can actually brew your recipe. The precision stays for you; the portability gets your friends in the cup.

### Your data is yours

Pour runs on Postgres (via Supabase). No data brokers, no analytics products being sold, no AI training pipelines. You can export everything as JSON anytime — and we'll never email you marketing.

---

## Who it's for

- People who have brewed the same bean five times trying to dial it in
- People who own an xBloom, V60, Chemex, AeroPress, or want to support espresso-only friends like Michael
- People with 2–10 coffee friends, not 10,000 followers
- People who've used Obsidian / Notes / a notebook to log brews and wished it did more

Not for: casual drinkers who don't track settings, or people looking for a roaster directory / coffee social network.

---

## What we won't do

- **Public feed of strangers.** Pour stays friends-first. If we add discovery later, it'll be opt-in and behind toggles.
- **Selling your data.** Coffee preferences are mundane to advertisers but personal to you. Not for sale.
- **Aggressive growth tactics.** No invite-bombing your contacts, no "share to unlock" gates, no bait-and-switch.
- **Becoming a roaster marketplace.** Pour helps you brew what you already bought. Buying coffee is a different product.
- **AI-generated tasting notes.** Maybe one day, but only if it actually helps. Today's "AI tasting" features are usually noise.

---

## What we will eventually do

(Things we want to add. None of these block anyone today; rough order of likelihood.)

- **Espresso & cortado** — for Michael, and people who brew both ways
- **Personalized invite links** — so a friend lands on "Pin invited you to Pour"
- **PWA / Add to Home Screen** — feels native on iOS
- **Built-in brew timer** — auto-fills the time field
- **Charts and trends** — see your dial-in progress over months
- **Export to Obsidian** — write back so your vault stays the source of truth

Full list lives in [`ROADMAP.md`](../ROADMAP.md).

---

## Who's behind it

- **Pin** — building it. Coffee on xBloom, primary user.
- **Michael** — Pin's partner, espresso + cortado, second user, occasional reality-checker.
- **Claude** — Anthropic's AI agent that pair-programmed the codebase. Every commit references this.

This is a hobby-scale project. Don't expect 24/7 support — but do expect an actual human reading every email.

---

## Contact

- **Feedback / questions / "this thing broke"** — [LinkedIn](https://www.linkedin.com/in/pinmanee/)
- **Code** — [github.com/pinnyeow/coffee](https://github.com/pinnyeow/coffee)
- **Live app** — [mypour.vercel.app](https://mypour.vercel.app)

---

*Pour is small on purpose. It's for the kind of person who thinks 0.5 grams matter on the dial. If that's you, welcome.*
