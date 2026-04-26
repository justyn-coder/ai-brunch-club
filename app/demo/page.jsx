import Link from 'next/link';
import PinkyMark from '@/components/PinkyMark';

export const metadata = {
  title: 'AI Brunch Club — How it works',
  description: 'A small editorial brunch club that runs itself. Composed dossiers, a date ledger, printed seed cards, and a WhatsApp loop.',
  openGraph: {
    title: 'AI Brunch Club — How it works',
    description: 'A small editorial brunch club that runs itself. Composed dossiers, a date ledger, printed seed cards, and a WhatsApp loop.',
    type: 'article',
    locale: 'en_CA',
  },
  twitter: { card: 'summary_large_image', title: 'AI Brunch Club — How it works' },
};

const SAMPLE_DOSSIER = "Geoffrey Hinton spent decades building the foundations that most of the products at this table now run on, which makes him an unusual guest: he is not speculating about where AI goes, he is reckoning with what he already made. His recent public warnings about existential risk carry a different weight than the usual conference circuit alarm, because they come from someone who cannot claim ignorance of the underlying mechanics. The tension he brings is genuine and a little uncomfortable - a founder-adjacent figure who helped ignite the thing and is now not entirely sure the thing should have been ignited. That is a useful perspective to have over eggs.";

const SAMPLE_QUESTIONS = [
  'What does it feel like to teach a machine something it then surpasses you at.',
  'You left Google to speak freely. What did you stop yourself saying while there.',
  'If backpropagation had a rival idea you still think about, what was it.',
];

const SAMPLE_OPTIONS = [
  { roman: 'i', label: 'Sun, May 3', votes: 3, maybes: 0, locked: true },
  { roman: 'ii', label: 'Sun, May 10', votes: 1, maybes: 1, locked: false },
  { roman: 'iii', label: 'Sun, May 17', votes: 0, maybes: 2, locked: false },
  { roman: 'iv', label: 'Sun, May 24', votes: 0, maybes: 0, locked: false },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen pb-32">
      {/* MASTHEAD */}
      <header className="px-6 sm:px-10 pt-6 pb-4 max-w-5xl mx-auto">
        <div className="flex items-start justify-between border-b border-wine pb-3.5">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <PinkyMark size={42} className="text-wine" />
            <div>
              <div className="font-display italic font-light text-[18px] leading-none tracking-tight">A.B.C.</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-wine/75 mt-1">Vol. I · New Toronto</div>
            </div>
          </Link>
          <div className="flex items-start gap-2 justify-end">
            <span className="w-2 h-2 rounded-full bg-butter mt-2 shrink-0" aria-hidden="true" />
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.16em] text-wine/75">How it works</div>
              <div className="font-display italic font-light text-[14px] mt-1 tracking-tight">A short tour</div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO — three-beat hook */}
      <section className="px-6 sm:px-10 max-w-4xl mx-auto pt-20 sm:pt-32 pb-16 text-center">
        <h1
          className="font-display font-medium text-wine tracking-tight"
          style={{ fontSize: 'clamp(36px, 5.6vw, 64px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          A small editorial brunch club<br />needs editorial tools<span className="text-pinky-bright">.</span>
        </h1>
        <p
          className="mt-10 font-display italic font-light text-wine/85 max-w-2xl mx-auto"
          style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', lineHeight: 1.45 }}
        >
          Most clubs run on group texts and shared calendars. The admin runs the people instead of the other way around.
        </p>
        <div className="mt-12 flex justify-center">
          <span className="font-display italic font-light text-wine/65 text-2xl" aria-hidden="true">↓</span>
        </div>
        <p
          className="mt-12 font-display font-medium text-wine"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}
        >
          We made the magazine instead.
        </p>
      </section>

      {/* SECTION I — DOSSIER */}
      <Chapter roman="I" eyebrow="The dossier" />
      <section className="px-6 sm:px-10 max-w-5xl mx-auto pt-12 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-[0.9fr_1.1fr] gap-x-12 gap-y-10 items-start">
          <div>
            <h2
              className="font-display font-medium text-wine tracking-tight"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
            >
              Adding a guest is ten seconds<span className="text-pinky-bright">.</span>
            </h2>
            <p className="mt-5 text-[16px] leading-[1.6] text-wine/85 max-w-md">
              Name and a LinkedIn URL is all we need. The dossier composes itself in editorial voice. No press-release bombast, no AI tells. One paragraph on why this person belongs at this table.
            </p>
            <p className="mt-4 text-[14px] italic text-wine/75 max-w-md leading-snug">
              Built on Claude with a bespoke voice prompt that bans em dashes, semicolons, and every &quot;I would love to&quot; you've ever read.
            </p>
          </div>

          {/* SAMPLE DOSSIER CARD */}
          <div className="relative">
            <div className="border border-wine/25 bg-cream rounded-sm p-6 sm:p-8">
              <div className="flex items-baseline justify-between mb-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-forest font-semibold">Dossier</div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-wine/75">Sample</div>
              </div>
              <div
                className="font-display font-medium text-wine leading-tight tracking-tight"
                style={{ fontSize: 'clamp(22px, 2.6vw, 30px)' }}
              >
                Geoffrey Hinton<span className="text-pinky-bright">.</span>
              </div>
              <p
                className="mt-5 font-display italic font-light text-wine/90 leading-[1.55]"
                style={{ fontSize: 16 }}
              >
                {SAMPLE_DOSSIER}
              </p>
              <div className="mt-5 pt-4 border-t border-wine/15 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-wine/75">
                <span>Composed in 4 seconds</span>
                <span className="font-display italic normal-case tracking-normal text-[13px] text-wine/65">
                  Pinky&apos;s pen
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION II — DATE LEDGER */}
      <Chapter roman="II" eyebrow="The ledger" />
      <section className="px-6 sm:px-10 max-w-5xl mx-auto pt-12 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-[1.1fr_0.9fr] gap-x-12 gap-y-10 items-start">
          {/* SAMPLE LEDGER */}
          <div className="border border-wine/25 bg-cream rounded-sm p-6 sm:p-8">
            <div className="flex items-baseline justify-between mb-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-wine/75">Date poll</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-wine/75">Sample</div>
            </div>
            <div
              className="font-display italic font-light text-wine tracking-tight"
              style={{ fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1.1 }}
            >
              When shall we meet?
            </div>
            <ol className="mt-5 border-t border-wine/30">
              {SAMPLE_OPTIONS.map((opt) => (
                <li
                  key={opt.roman}
                  className={`flex items-baseline gap-4 py-3 border-b border-wine/15 ${
                    opt.locked ? 'border-l-2 border-l-forest pl-3 bg-forest-soft/15' : ''
                  }`}
                >
                  <span className="font-display italic font-light text-pinky-bright text-[14px] w-6 tracking-tight">
                    {opt.roman}.
                  </span>
                  <span className="font-display text-[15px] text-wine flex-1">
                    {opt.label}
                    {opt.locked && (
                      <span className="ml-3 text-[10px] uppercase tracking-[0.18em] text-forest border border-forest/40 rounded-full px-2 py-0.5">
                        Locked
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-wine/75">
                    {opt.votes === 0 && opt.maybes === 0
                      ? '—'
                      : `${opt.votes} sworn${opt.maybes ? ` · ${opt.maybes} maybe` : ''}`}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-forest font-medium">
              Three pinkies up. Date locked.
            </div>
          </div>

          <div>
            <h2
              className="font-display font-medium text-wine tracking-tight"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
            >
              The date picks itself<span className="text-pinky-bright">.</span>
            </h2>
            <p className="mt-5 text-[16px] leading-[1.6] text-wine/85 max-w-md">
              Three of us, votes on every Sunday option. Yes, maybe, no. The ledger ranks them. The first option to clear all three pinkies up is the date.
            </p>
            <p className="mt-4 text-[14px] italic text-wine/75 max-w-md leading-snug">
              No spreadsheet, no Doodle, no &quot;works for me, what about you guys?&quot; thread that decays into oblivion.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION III — SEED CARDS */}
      <Chapter roman="III" eyebrow="The seed cards" />
      <section className="px-6 sm:px-10 max-w-5xl mx-auto pt-12 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-[0.9fr_1.1fr] gap-x-12 gap-y-10 items-start">
          <div>
            <h2
              className="font-display font-medium text-wine tracking-tight"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
            >
              Three sharp openers, on the table<span className="text-pinky-bright">.</span>
            </h2>
            <p className="mt-5 text-[16px] leading-[1.6] text-wine/85 max-w-md">
              The morning of brunch, we generate three conversation seeds per guest. Specific, sideways, never &quot;tell us about your work.&quot; Printed on a small card, folded, set beside the cutlery.
            </p>
            <p className="mt-4 text-[14px] italic text-wine/75 max-w-md leading-snug">
              Eggs go cold. Ideas don&apos;t.
            </p>
          </div>

          {/* SAMPLE SEED CARD */}
          <div className="relative" style={{ minHeight: 380 }}>
            {/* back card */}
            <div
              aria-hidden="true"
              className="absolute inset-0 border border-wine/25 bg-butter/40 rounded-sm"
              style={{ transform: 'translate(14px, 14px) rotate(2.4deg)' }}
            />
            {/* middle card */}
            <div
              aria-hidden="true"
              className="absolute inset-0 border border-wine/30 bg-forest-soft/55 rounded-sm"
              style={{ transform: 'translate(7px, 7px) rotate(-1.4deg)' }}
            />
            {/* front card */}
            <div className="relative border border-wine bg-cream rounded-sm p-7 sm:p-9">
              <div className="flex items-baseline justify-between border-b border-wine/30 pb-3 mb-5">
                <div className="font-display italic font-light text-[14px] tracking-tight">A.B.C.</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-wine/75">No. 02</div>
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-forest font-semibold mb-2">Guest of honour</div>
              <div className="font-display font-medium text-wine leading-tight tracking-tight text-3xl">
                Geoffrey Hinton
              </div>
              <ol className="mt-7 space-y-4">
                {SAMPLE_QUESTIONS.map((q, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-display italic font-light text-butter text-xl leading-none shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, '0')}.
                    </span>
                    <span className="font-display italic font-light text-[15px] text-wine/90 leading-[1.55]">
                      {q}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-7 pt-4 border-t border-wine/30 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-wine/75">
                <span>Pinky Swear · New Toronto</span>
                <span className="font-display italic normal-case tracking-normal text-[13px] text-wine/65">
                  Sun, May 3
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION IV — WHATSAPP LOOP */}
      <Chapter roman="IV" eyebrow="The chat" />
      <section className="px-6 sm:px-10 max-w-5xl mx-auto pt-12 pb-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2
            className="font-display font-medium text-wine tracking-tight"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            The group chat is the spine<span className="text-pinky-bright">.</span><br />
            The site is the binding<span className="text-pinky-bright">.</span>
          </h2>
          <p className="mt-6 text-[16px] leading-[1.6] text-wine/85 max-w-2xl mx-auto">
            We built around how we already talk to each other. No new app to install. Tap a guest&apos;s name on the site, your WhatsApp opens with a draft invite. They tap a button on their own page to RSVP back into the group.
          </p>
        </div>

        {/* THREE-STEP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <LoopStep
            step="01"
            title="Send the invite"
            body="One tap. Your WhatsApp opens with a personalised draft - dossier link, group join link, ready to send."
            tone="forest"
          />
          <LoopStep
            step="02"
            title="They read the dossier"
            body="A personal page with their dossier, the date, the venue. Three big buttons: Pinky sworn, Maybe, Regrets."
            tone="pinky"
          />
          <LoopStep
            step="03"
            title="RSVP lands in the group"
            body="They tap an RSVP button. WhatsApp opens with a pre-filled reply. They pick our group. We see it land."
            tone="butter"
          />
        </div>
      </section>

      {/* SECTION V — CLOSING */}
      <section className="px-6 sm:px-10 max-w-3xl mx-auto pt-16 pb-24 text-center">
        <div className="border-t border-wine pt-12">
          <p
            className="font-display italic font-light text-wine/85 mx-auto"
            style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', lineHeight: 1.4, maxWidth: '32ch' }}
          >
            Built for one residency at Pinky Swear. Could fit any small standing brunch.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="bg-wine text-cream px-7 py-3.5 text-[12px] uppercase tracking-[0.18em] rounded-sm hover:bg-wine-soft transition-colors font-medium"
            >
              Open the magazine →
            </Link>
            <span className="text-[11px] uppercase tracking-[0.16em] text-wine/65">
              Vol. I · Brunch № 02 · Sun, May 3
            </span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto mt-16 pt-10 border-t border-wine">
        <div className="px-6 sm:px-10 flex flex-col items-center text-center gap-5">
          <PinkyMark size={28} className="text-wine/75" />
          <p
            className="font-display italic font-light text-wine/85"
            style={{ fontSize: 'clamp(20px, 2.6vw, 28px)', lineHeight: 1.25, maxWidth: '32ch' }}
          >
            First rule. Don&apos;t bring eggs to an idea fight.
          </p>
          <div className="text-[11px] uppercase tracking-[0.16em] text-wine/70">
            Est. 2026 · Vol. I · A.B.C.
          </div>
        </div>
      </footer>
    </main>
  );
}

function Chapter({ roman, eyebrow }) {
  const tones = { I: 'text-pinky-bright', II: 'text-forest', III: 'text-wine-soft', IV: 'text-pinky-bright' };
  return (
    <div className="px-6 sm:px-10 max-w-5xl mx-auto pt-8 border-t border-wine/15">
      <div className="flex items-center gap-3.5 pt-4">
        <span className={`font-display italic font-light text-[22px] tracking-tight ${tones[roman] || 'text-pinky-bright'}`}>
          {roman}.
        </span>
        <span
          className="flex-1 h-px"
          style={{
            background: 'linear-gradient(to right, rgba(63,90,58,0.55) 0%, rgba(63,90,58,0.25) 60%, transparent 100%)',
          }}
        />
        <span className="text-[11px] uppercase tracking-[0.16em] text-wine/75">{eyebrow}</span>
      </div>
    </div>
  );
}

function LoopStep({ step, title, body, tone }) {
  const accentMap = {
    forest: 'text-forest',
    pinky: 'text-pinky-bright',
    butter: 'text-wine-soft',
  };
  const accent = accentMap[tone] || 'text-forest';
  return (
    <div className="border border-wine/25 bg-cream rounded-sm p-6 flex flex-col">
      <div className={`text-[11px] uppercase tracking-[0.18em] font-semibold ${accent}`}>
        Step {step}
      </div>
      <div
        className="mt-2 font-display font-medium text-wine tracking-tight"
        style={{ fontSize: 'clamp(20px, 2.2vw, 26px)', lineHeight: 1.1 }}
      >
        {title}
      </div>
      <p className="mt-3 text-[14px] leading-[1.55] text-wine/85">
        {body}
      </p>
    </div>
  );
}
