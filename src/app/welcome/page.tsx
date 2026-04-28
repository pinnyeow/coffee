import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pour — A coffee journal that gets better with friends',
  description:
    'Built for xBloom home brewers. Find the recipe that worked. Share it with friends — even if their gear is different.',
}

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="px-6 pt-10 pb-2 max-w-3xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-stone-500">Pour</div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-6 pb-14 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-semibold leading-[1.05] text-stone-900">
          A coffee journal that gets better with&nbsp;friends.
        </h1>
        <p className="mt-6 text-lg text-stone-700 max-w-2xl leading-relaxed">
          Built for xBloom home brewers dialing in pour-over. Find the recipe that worked, faster. Share it with friends — even if their gear is different from yours.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Pill className="bg-stone-200 text-stone-800">xBloom · V60 · Chemex · AeroPress</Pill>
          <Pill className="bg-stone-200 text-stone-800">Espresso (coming)</Pill>
          <Pill className="bg-amber-200 text-amber-900">Friends-first</Pill>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/sign-in"
            className="bg-stone-900 text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-stone-800"
          >
            Sign in →
          </Link>
          <a
            href="#what"
            className="border border-stone-300 text-stone-800 rounded-full px-6 py-3 text-sm font-medium hover:border-stone-500"
          >
            How it works
          </a>
        </div>

      </section>

      {/* Prototype preview */}
      <section className="px-6 py-14 max-w-3xl mx-auto border-t border-stone-200">
        <Eyebrow>Preview</Eyebrow>
        <H2>Click around the prototype</H2>
        <p className="mt-3 text-stone-700 leading-relaxed">
          An interactive walkthrough of the design — Home, Bean detail, friend invites, the share card. Tap any button to navigate.
        </p>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900">
          <b>Heads up — this is a prototype, not the live app.</b> Some screens preview features still being built. The shipped flow lives behind sign-in at <a href="/sign-in" className="underline">mypour.vercel.app</a>.
        </div>
        <div className="mt-6 rounded-2xl overflow-hidden border border-stone-200 bg-white">
          <div className="px-4 py-2 bg-stone-100 border-b border-stone-200 text-[11px] text-stone-600 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Prototype · pour-prototype.surge.sh</span>
          </div>
          <iframe
            src="https://pour-prototype.surge.sh/"
            title="Pour interactive prototype"
            className="w-full"
            style={{ height: '900px', border: 0 }}
            loading="lazy"
          />
        </div>
      </section>

      {/* What */}
      <section id="what" className="px-6 py-14 max-w-3xl mx-auto border-t border-stone-200">
        <Eyebrow>What is Pour</Eyebrow>
        <H2>Built around three jobs</H2>

        <div className="mt-8 space-y-6">
          <Step n={1} title="Log fast">
            Supports xBloom, V60, Chemex, and AeroPress today (espresso coming). 30 seconds, one-handed, mid-brew. Profile defaults pre-fill the constants — you only change what&apos;s different from last time.
          </Step>
          <Step n={2} title="Find the best settings for any bean">
            Pour groups your brews by bean and surfaces the recipe that worked. No more scrolling through a notes app trying to remember &ldquo;what grind did I land on for this Ethiopian?&rdquo;
          </Step>
          <Step n={3} title="Share with friends">
            Friends see your dialed-in recipes; you see theirs. Tap &ldquo;Use these settings&rdquo; and your next brew starts pre-filled — even if your friend uses an xBloom and you have a V60. Pour translates the grind dial automatically.
          </Step>
        </div>
      </section>

      {/* 5 minutes */}
      <section className="px-6 py-14 max-w-3xl mx-auto border-t border-stone-200">
        <Eyebrow>The first 5 minutes</Eyebrow>
        <H2>From sign-in to first dialed brew</H2>

        <ol className="mt-8 space-y-7">
          <Phase label="Step 1 · 10 seconds" title="Sign in with a 6-digit code">
            <p>
              Type your email on the <Link href="/sign-in" className="underline">sign-in page</Link> and tap <b>Send code</b>. A 6-digit code lands in your inbox (check junk if you don&apos;t see it). Type it in to sign in. No password to remember.
            </p>
          </Phase>
          <Phase label="Step 2 · 1 minute (recommended)" title="Set a profile">
            <p>⚙ Settings → Pour over profiles → Add. Example:</p>
            <div className="mt-3 bg-white border border-stone-200 rounded-2xl p-4 text-sm text-stone-700">
              <div className="text-stone-900 font-medium">Light roast / 4-pour</div>
              <div className="mt-1 text-stone-600">15g · 1:17 · grind 55 · 92°C · 80 RPM</div>
            </div>
            <p className="mt-3">
              Star it as default. Now every new brew starts pre-filled. The fields you touch most often (dose, grind, time) take 5 seconds.
            </p>
          </Phase>
          <Phase label="Step 3 · 30 seconds" title="Log your first brew">
            <p>
              Tap <b>+ Log a brew</b>. Type the bean name. Adjust whatever&apos;s different. Rate it. Hit Save.
            </p>
            <p className="mt-2">
              The brew appears on Home, grouped under that bean. Three more brews of the same bean show up as one card with the <b>recommended recipe</b> surfaced inline.
            </p>
          </Phase>
          <Phase label="Step 4 · optional" title="Import your existing journal">
            <p>
              Have years of notes in Obsidian? Settings → Data → Import from Obsidian → drop your <Code>.md</Code> file. Pour parses bold bean names and brew lines like <Code>15g; 55; 80; 255ml; Time: 3:14</Code>, creates beans + brews, shows a preview before importing.
            </p>
          </Phase>
          <Phase label="Step 5 · share" title="Invite a friend">
            <p>
              Share your username (find it in Settings). When they sign up, they add you. The Friends tab on Home then shows their brews with a <b>Use these settings</b> button on each — try their recipe with attribution back to them on your brew.
            </p>
          </Phase>
        </ol>
      </section>

      {/* Different */}
      <section className="px-6 py-14 max-w-3xl mx-auto border-t border-stone-200">
        <Eyebrow>What makes it different</Eyebrow>
        <H2>Built for people who dial in</H2>

        <div className="mt-8 space-y-8">
          <Difference title="vs. Obsidian / Apple Notes">
            A notebook stores text. Pour stores <b>structured brews</b> — so when you ask &ldquo;what was my best Torahebi Banana?&rdquo; Pour answers in 0 seconds. No scrolling, no Cmd+F. It also handles the boring stuff: live ratio calculation (change dose, water updates), recommended recipe surfaced per bean, multiple profiles for different roast levels, auto-translation of xBloom dial settings to &ldquo;Medium grind&rdquo; for friends without one.
          </Difference>
          <Difference title="vs. generic coffee apps">
            Most coffee apps are roaster catalogs or one-size-fits-all loggers. Pour is built for people who <b>dial in</b> — multiple attempts on the same bean, tracking what changed, surfacing the keeper. The unit of the app is a bean, not a transaction.
          </Difference>
          <Difference title="vs. just texting recipes to friends">
            When you send Michael &ldquo;15g, grind 59, 80 RPM, 225ml&rdquo; he has no idea what to do unless he also has an xBloom. Pour translates <b>the same recipe</b>{' '}into &ldquo;Medium grind, 92°C, 1:15 ratio, 3:14 brew time&rdquo; — universal across pour-over gear.
          </Difference>
        </div>

        {/* Sample share card */}
        <div className="mt-10 max-w-md">
          <Eyebrow>Example share card</Eyebrow>
          <div className="bg-gradient-to-br from-stone-900 to-stone-700 text-white rounded-3xl p-6">
            <div className="text-xs uppercase tracking-wider text-stone-300">Pour · Universal Recipe</div>
            <div className="mt-2 text-xl font-semibold">Torahebi Banana</div>
            <div className="text-sm text-stone-300">Blend · Torahebi (Japan) · Pour over</div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Stat label="DOSE" value="15g" />
              <Stat label="WATER" value="255ml" />
              <Stat label="RATIO" value="1:17" />
              <Stat label="TEMP" value="92°C" />
              <Stat label="GRIND" value="Medium" small />
              <Stat label="TIME" value="3:14" />
            </div>
            <div className="mt-3 text-xs text-stone-300 italic">&ldquo;Sweeter than last time. Cleaner finish.&rdquo;</div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-6 py-14 max-w-3xl mx-auto border-t border-stone-200">
        <Eyebrow>About Pour</Eyebrow>
        <H2>Why Pour exists</H2>

        <p className="text-stone-700 mt-6 leading-relaxed">
          Pin had been logging pour-over brews in Obsidian for the past year — every Ethiopian, every Kenyan, every dial-in attempt at home on her xBloom. The notes worked, but two problems kept nagging:
        </p>

        <ul className="mt-4 space-y-3 text-stone-700 list-disc pl-6">
          <li>Every time Pin picks up a bag she&apos;s already dialed in, Pin scrolls past 20 attempts trying to find the recipe and the notes that got her there.</li>
          <li>Sharing recipes with friends was awkward. Michael (her partner, espresso person) couldn&apos;t use her xBloom dial numbers. A friend on a V60 needed translation. &ldquo;15g, grind 59, 80 RPM&rdquo; was useless to anyone without her exact gear.</li>
        </ul>

        <p className="text-stone-700 mt-6 leading-relaxed">
          Pour is the app that fixed both for her. Now it&apos;s open to friends, and slowly the people they invite.
        </p>

        <h3 className="font-semibold text-stone-900 mt-10 text-lg">What we believe</h3>
        <div className="mt-4 space-y-4 text-stone-700 leading-relaxed">
          <Belief title="Coffee journaling should reduce typing, not add it.">
            Every design choice asks: can we save the user from re-entering this?
          </Belief>
          <Belief title="Beans are the unit, not brews.">
            Most apps treat each cup as separate. Pour treats brews as <i>attempts at dialing in a bean</i>.
          </Belief>
          <Belief title="Friends > strangers, always.">
            No public feed, no trending tab, no roaster ratings to game. Visibility is opt-in and per-brew.
          </Belief>
          <Belief title="xBloom precision, friend-portable.">
            Exact dial settings stored AND auto-translated for friends with different gear.
          </Belief>
          <Belief title="Your data is yours.">
            Postgres-backed, exportable as JSON, never sold.
          </Belief>
        </div>

        <div className="mt-10 italic text-stone-700 border-l-[3px] border-amber-600 pl-4">
          Pour is small on purpose. It&apos;s for the kind of person who thinks 0.5 grams matter on the dial. If that&apos;s you, welcome.
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-14 max-w-3xl mx-auto border-t border-stone-200">
        <Eyebrow>Common questions</Eyebrow>
        <H2>Quick answers</H2>

        <div className="mt-8 space-y-3">
          <Faq q="Do I need an xBloom?">
            No — Pour now supports xBloom, V60, Chemex, and AeroPress. French press, cold brew, and espresso are still on the roadmap. Friends on other gear can still receive your shared recipes (grind auto-translates to Medium / Medium-fine etc.).
          </Faq>
          <Faq q="Will my brews or notes be public?">
            No public feed exists. Brews default to friends-visible — only friends you&apos;ve explicitly added see them. Each brew has a 🔒 Private toggle if you want to keep one to yourself.
          </Faq>
          <Faq q="What about a friend who doesn't use Pour?">
            Tap Share on any brew. <b>Universal mode</b> outputs <Code>15g · 255ml · 1:17 · 92°C · Medium grind · 3:14</Code> — works anywhere. <b>xBloom mode</b> gives exact dial numbers for other xBloom users. Copy as text, paste in iMessage / WhatsApp.
          </Faq>
          <Faq q="What if I forget my password?">
            There isn&apos;t one. Each sign-in is a fresh 6-digit code emailed to you — type it in to get back in.
          </Faq>
          <Faq q="Is it free?">
            Yes, for now. Pour is in early access — Pin and a small group of friends. No credit card.
          </Faq>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 max-w-3xl mx-auto border-t border-stone-200">
        <div className="bg-stone-900 text-white rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-semibold leading-tight">Ready to log your next brew?</h2>
          <p className="text-stone-300 mt-3 max-w-md mx-auto">
            No download. 6-digit code sign-in.
          </p>
          <Link
            href="/sign-in"
            className="inline-block mt-7 bg-white text-stone-900 rounded-full px-6 py-3 text-sm font-medium hover:bg-stone-100"
          >
            Sign in →
          </Link>
          <div className="mt-4 text-xs text-stone-400">Or paste an invite link from a friend</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 max-w-3xl mx-auto border-t border-stone-200 text-xs text-stone-500">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link className="hover:text-stone-900" href="/sign-in">App</Link>
          <a className="hover:text-stone-900" href="https://github.com/pinnyeow/coffee" target="_blank" rel="noopener">
            Code on GitHub
          </a>
          <a
            className="hover:text-stone-900"
            href="https://www.linkedin.com/in/pinmanee/"
            target="_blank"
            rel="noopener"
          >
            Feedback
          </a>
        </div>
        <div className="mt-4">Built by Pin · 2026</div>
      </footer>
    </main>
  )
}

function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block text-[11px] tracking-wider uppercase rounded-full px-3 py-1 font-medium ${className ?? ''}`}
    >
      {children}
    </span>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs uppercase tracking-widest text-stone-500 mb-3">{children}</div>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl font-semibold text-stone-900">{children}</h2>
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-semibold flex items-center justify-center shrink-0">
        {n}
      </div>
      <div>
        <div className="font-semibold text-stone-900">{title}</div>
        <p className="text-stone-700 mt-1 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}

function Phase({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <li>
      <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
      <h3 className="font-semibold text-stone-900 text-lg mt-1">{title}</h3>
      <div className="text-stone-700 mt-1 leading-relaxed">{children}</div>
    </li>
  )
}

function Difference({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-stone-900">{title}</h3>
      <p className="text-stone-700 mt-2 leading-relaxed">{children}</p>
    </div>
  )
}

function Belief({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <b className="text-stone-900">{title}</b> {children}
    </div>
  )
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="bg-white rounded-2xl border border-stone-200 px-5 py-3 group">
      <summary className="font-medium text-stone-900 flex justify-between items-center cursor-pointer list-none">
        <span>{q}</span>
        <span className="text-stone-400 group-open:rotate-90 transition-transform">›</span>
      </summary>
      <div className="text-stone-700 mt-3 leading-relaxed">{children}</div>
    </details>
  )
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-stone-400">{label}</div>
      <div className={`font-semibold ${small ? 'text-sm' : ''}`}>{value}</div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-sm bg-stone-100 rounded px-1.5 py-0.5 font-mono text-stone-800">
      {children}
    </code>
  )
}
