'use client';

import Link from 'next/link';
import PinkyMark from './PinkyMark';

const STATUS_LABEL = {
  invited: 'Invited',
  confirmed: 'Pinky Sworn',
  maybe: 'Maybe',
  declined: 'Regrets',
};

function formatLong(d) {
  if (!d) return null;
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function pad(n) {
  return String(n || 0).padStart(2, '0');
}

function digitsOnly(p) {
  return (p || '').replace(/[^\d]/g, '');
}

export default function GuestPage({ guest, event }) {
  const editionLabel = pad(event?.edition_number);
  const dateLine = event?.event_date ? formatLong(event.event_date) : 'Date being sworn';
  const groupUrl = event?.whatsapp_invite_url || null;

  // Pre-filled RSVP messages for tap-to-WhatsApp.
  // No founder phone in scope here; we send to the group via wa.me/?text=...
  function rsvpUrl(verb) {
    const message = `${verb} for Brunch № ${editionLabel}. - ${guest.name}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  return (
    <main className="min-h-screen pb-32 max-w-3xl mx-auto px-6 sm:px-10 pt-8">
      {/* MASTHEAD */}
      <header className="flex items-start justify-between border-b border-wine pb-3.5">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <PinkyMark size={42} className="text-wine" />
          <div>
            <div className="font-display italic font-light text-[18px] leading-none tracking-tight">A.B.C.</div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-wine/75 mt-1">Vol. I · New Toronto</div>
          </div>
        </Link>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.16em] text-pinky-bright font-semibold">Personal invitation</div>
          <div className="font-display italic font-light text-[14px] mt-1 tracking-tight">
            Brunch № {editionLabel}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mt-10 sm:mt-14 mb-8">
        <div className="text-[11px] uppercase tracking-[0.18em] text-wine/75 mb-3">Guest of honour</div>
        <h1
          className="font-display font-medium text-wine tracking-tight leading-[0.92]"
          style={{ fontSize: 'clamp(48px, 9vw, 84px)', letterSpacing: '-0.02em' }}
        >
          {guest.name}<span className="text-pinky-bright">.</span>
        </h1>
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-pinky-bright" />
          <span className="text-[13px] uppercase tracking-[0.16em] text-wine/85 font-medium">
            {dateLine}
          </span>
          <span className="text-wine/30">·</span>
          <span className="text-[13px] uppercase tracking-[0.16em] text-wine/85 font-medium">
            Pinky Swear, New Toronto
          </span>
        </div>
      </section>

      {/* DOSSIER */}
      {guest.dossier && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] uppercase tracking-[0.18em] text-forest font-semibold">Dossier</span>
            <span className="h-px flex-1 bg-forest/30" />
          </div>
          <p className="font-display italic font-light text-[18px] sm:text-[20px] leading-[1.55] text-wine/85 max-w-2xl">
            {guest.dossier}
          </p>
        </section>
      )}

      {/* RSVP */}
      <section className="border-t border-wine/30 pt-8 mb-10">
        <div className="text-[11px] uppercase tracking-[0.18em] text-wine/75 mb-2">RSVP</div>
        <div className="font-display italic font-light text-[24px] sm:text-[28px] tracking-tight text-wine mb-5">
          Pinky sworn?
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href={rsvpUrl('Pinky sworn')}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-forest bg-forest text-cream rounded-sm px-5 py-4 text-center hover:bg-forest/90 transition-colors"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] opacity-80">Yes</div>
            <div className="font-display italic font-light text-xl mt-1">Pinky sworn</div>
          </a>
          <a
            href={rsvpUrl('Maybe')}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-butter/80 bg-butter/30 text-wine rounded-sm px-5 py-4 text-center hover:bg-butter/50 transition-colors"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-wine/75">Maybe</div>
            <div className="font-display italic font-light text-xl mt-1">Tentative</div>
          </a>
          <a
            href={rsvpUrl('Regrets')}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-ash/40 bg-ash-soft text-wine rounded-sm px-5 py-4 text-center hover:bg-ash-soft/80 transition-colors"
          >
            <div className="text-[10px] uppercase tracking-[0.18em] text-wine/75">No</div>
            <div className="font-display italic font-light text-xl mt-1">Regrets</div>
          </a>
        </div>
        <p className="text-[13px] text-wine/75 mt-4 italic">
          Each option opens WhatsApp with a pre-filled reply. Pick the chat (the AI Brunch Club group), then send.
        </p>
      </section>

      {/* GROUP JOIN */}
      {groupUrl && (
        <section className="border border-forest/40 bg-forest-soft/30 rounded-sm p-6 mb-10">
          <div className="text-[11px] uppercase tracking-[0.18em] text-forest font-semibold">The group chat</div>
          <div className="font-display italic font-light text-xl text-wine mt-1">Where the conversation lives</div>
          <p className="text-[14px] text-wine/85 mt-2 leading-snug max-w-md">
            Once you've sworn pinky, join the WhatsApp group. Three founders, two or three guests of honour. Loose, on-the-record, eggs on the table.
          </p>
          <a
            href={groupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 bg-wine text-cream px-5 py-2.5 text-[12px] uppercase tracking-[0.16em] rounded-sm hover:bg-wine-soft transition-colors font-medium"
          >
            Join the group →
          </a>
        </section>
      )}

      {/* FOOTER */}
      <footer className="mt-16 pt-7 border-t border-wine">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-wine/75">
          <span>Est. 2026 · Vol. I</span>
          <span className="font-display italic normal-case tracking-normal text-[13px] text-wine/65">
            First rule. Don't bring eggs to an idea fight.
          </span>
        </div>
      </footer>
    </main>
  );
}
