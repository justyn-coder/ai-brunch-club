'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { waGuestInvite, waShareToGroup } from '@/lib/whatsapp';
import PinkyMark from './PinkyMark';

const STATUS_LABELS = {
  invited: 'Invited',
  confirmed: 'Pinky Sworn',
  maybe: 'Maybe',
  declined: 'Regrets',
};

const STATUS_GLYPHS = {
  invited: '·',
  confirmed: '×',
  maybe: '~',
  declined: '∅',
};

const STATUS_STYLES = {
  invited:   'bg-pinky-soft/55 text-wine border-pinky/55',
  confirmed: 'bg-forest-soft/55 text-forest border-forest/45',
  maybe:     'bg-butter/30 text-wine border-butter/70',
  declined:  'bg-ash-soft/60 text-ash border-ash/45',
};

const STATUS_DOT = {
  invited:   'bg-wine/20',
  confirmed: 'bg-pinky-bright',
  maybe:     'bg-butter',
  declined:  'bg-transparent border border-ash/50',
};

const STATUS_OPTIONS = ['invited', 'confirmed', 'maybe', 'declined'];

const INVITED_BY_OPTIONS = [
  { value: 'justyn', label: 'Justyn' },
  { value: 'brad', label: 'Brad' },
  { value: 'john', label: 'John' },
  { value: 'all', label: 'All three' },
];

const INVITED_BY_LABEL = {
  justyn: 'Justyn',
  brad: 'Brad',
  john: 'John',
  all: 'all three',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

function formatLongDate(d) {
  if (!d) return null;
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/* On-scroll reveal hook. Adds .is-visible to .reveal nodes. */
function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}

export default function ClubBoard() {
  const [events, setEvents] = useState([]);
  const [guests, setGuests] = useState([]);
  const [polls, setPolls] = useState([]);
  const [pollOptions, setPollOptions] = useState([]);
  const [pollResponses, setPollResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEventEditor, setShowEventEditor] = useState(false);

  useEffect(() => { fetchData(); }, []);
  useReveal();

  async function fetchData() {
    setLoading(true);
    const [eventsRes, guestsRes, pollsRes, optionsRes, respRes] = await Promise.all([
      supabase.from('abc_events').select('*').order('edition_number', { ascending: true }),
      supabase.from('abc_guests').select('*').order('invited_at', { ascending: false }),
      supabase.from('abc_date_polls').select('*'),
      supabase.from('abc_date_poll_options').select('id, poll_id, proposed_date, proposed_time'),
      supabase.from('abc_date_poll_responses').select('option_id, member, response'),
    ]);
    setEvents(eventsRes.data || []);
    setGuests(guestsRes.data || []);
    setPolls(pollsRes.data || []);
    setPollOptions(optionsRes.data || []);
    setPollResponses(respRes.data || []);
    setLoading(false);
  }

  const currentEvent = events.find((e) => e.status === 'planning') || events[events.length - 1];
  const currentGuests = currentEvent
    ? guests.filter((g) => g.event_id === currentEvent.id)
    : [];

  const confirmedCount = currentGuests.filter((g) => g.status === 'confirmed').length;
  const pendingCount = currentGuests.filter((g) => g.status === 'invited' || g.status === 'maybe').length;
  const totalSeats = Math.max(currentGuests.length, 3);

  return (
    <main className="min-h-screen pb-32">
      {/* MASTHEAD BAR */}
      <header className="px-6 sm:px-10 pt-6 pb-4 max-w-5xl mx-auto">
        <div className="flex items-start justify-between border-b border-wine pb-3.5">
          <div className="flex items-center gap-3">
            <PinkyMark size={42} className="text-wine" />
            <div>
              <div className="font-display italic font-light text-[18px] leading-none tracking-tight">A.B.C.</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-wine/75 mt-1">Vol. I · New Toronto</div>
            </div>
          </div>
          <div className="flex items-start gap-2 justify-end">
            <span className="w-2 h-2 rounded-full bg-butter mt-2 shrink-0" aria-hidden="true" />
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.16em] text-wine/75">Members</div>
              <div className="font-display italic font-light text-[14px] mt-1 tracking-tight">
                Justyn · Brad · John
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO — asymmetric two-column wordmark */}
      <section className="px-6 sm:px-10 max-w-5xl mx-auto pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-[0.9fr_1.1fr] gap-x-0 gap-y-2 items-start">
          <div className="reveal relative">
            <div
              className="font-display italic font-extralight text-wine"
              style={{ fontSize: 'clamp(120px, 24vw, 260px)', lineHeight: 0.82, letterSpacing: '-0.04em', marginTop: '-0.04em' }}
            >
              AI
            </div>
            {/* hairline tether — links AI to the period in Club. */}
            <span
              className="hidden sm:block absolute bg-wine/30"
              style={{ top: '54%', right: '-6%', height: 1, width: '24%' }}
              aria-hidden="true"
            />
          </div>

          <div className="reveal pt-0 sm:pt-3" style={{ '--reveal-delay': '120ms' }}>
            <div
              className="font-display font-medium text-wine"
              style={{ fontSize: 'clamp(64px, 13vw, 132px)', lineHeight: 0.88, letterSpacing: '-0.03em' }}
            >
              Brunch<br />Club<span className="text-pinky-bright">.</span>
            </div>
            <div className="mt-7 flex items-center gap-3">
              <div className="h-px w-9 bg-wine/70" />
              <p className="font-display italic font-light text-base sm:text-lg text-wine">
                Residency at Pinky Swear, New Toronto.
              </p>
            </div>
            <p className="mt-7 max-w-md text-[15px] leading-[1.65] text-wine/85">
              A standing date with two or three guests of honour. Conversation is the menu. Eggs go cold. Ideas don&apos;t.
            </p>
          </div>
        </div>
      </section>

      {/* CHAPTER MARK I */}
      <ChapterMark roman="I" label="The next gathering" className="px-6 sm:px-10 max-w-5xl mx-auto" />

      {/* FRONTISPIECE — current edition */}
      <section className="px-6 sm:px-10 max-w-5xl mx-auto mt-6 mb-16 sm:mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr_auto] gap-x-8 gap-y-8 items-start reveal">
          {/* oversized numeral with sage shadow */}
          <div className="relative">
            <div className="text-[11px] uppercase tracking-[0.18em] text-wine/75 mb-1">Brunch №</div>
            <div className="relative" style={{ height: 'clamp(96px, 16vw, 180px)' }}>
              {/* sage shadow numeral */}
              <div
                aria-hidden="true"
                className="absolute font-display font-light text-forest-soft pointer-events-none"
                style={{
                  fontSize: 'clamp(96px, 16vw, 180px)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.04em',
                  transform: 'translate(5px, 5px)',
                  opacity: 0.7,
                }}
              >
                <span className="font-extralight italic">
                  {currentEvent ? String(currentEvent.edition_number).padStart(2, '0').charAt(0) : '0'}
                </span>
                {currentEvent ? String(currentEvent.edition_number).padStart(2, '0').charAt(1) : '1'}
              </div>
              {/* real numeral */}
              <div
                className="relative font-display font-light text-wine"
                style={{ fontSize: 'clamp(96px, 16vw, 180px)', lineHeight: 0.95, letterSpacing: '-0.04em' }}
              >
                <span className="font-extralight italic">
                  {currentEvent ? String(currentEvent.edition_number).padStart(2, '0').charAt(0) : '0'}
                </span>
                {currentEvent ? String(currentEvent.edition_number).padStart(2, '0').charAt(1) : '1'}
              </div>
            </div>
          </div>

          {/* hairline rule + hung copy */}
          <div className="sm:border-l sm:border-wine/30 sm:pl-8 sm:self-stretch sm:pt-7">
            {/* GUESTS OF HONOUR — primary line */}
            <div className="text-[11px] uppercase tracking-[0.18em] text-wine/75 mb-3">
              Guests of honour
            </div>
            {(() => {
              const honoured = currentGuests.filter((g) => g.status === 'confirmed' || g.status === 'maybe');
              if (honoured.length === 0) {
                return (
                  <div className="font-display italic font-light text-2xl sm:text-[28px] leading-[1.15] tracking-tight text-wine/65 max-w-md">
                    To be sworn.
                  </div>
                );
              }
              return (
                <div
                  className="font-display italic font-light leading-[1.05] tracking-tight max-w-md text-wine"
                  style={{ fontSize: 'clamp(28px, 4.4vw, 44px)' }}
                >
                  {honoured.map((g, i) => (
                    <span key={g.id} className={g.status === 'maybe' ? 'text-wine/70' : ''}>
                      {g.name}
                      {i < honoured.length - 1 && <span className="text-pinky-bright not-italic mx-1.5">·</span>}
                    </span>
                  ))}
                </div>
              );
            })()}

            {/* date — demoted to smallcap, with sage ring date dot */}
            <div className="mt-5 flex items-center gap-2.5 flex-wrap">
              <span className="relative inline-flex items-center justify-center" style={{ width: 14, height: 14 }} aria-hidden="true">
                <span className="absolute inset-0 rounded-full border border-forest-soft" />
                <span className="w-1.5 h-1.5 rounded-full bg-pinky-bright" />
              </span>
              <span className="text-[12px] uppercase tracking-[0.16em] text-wine font-medium">
                {currentEvent?.event_date ? formatLongDate(currentEvent.event_date) : 'Date to be sworn'}
              </span>
              <span className="text-wine/30">·</span>
              <span className="text-[12px] uppercase tracking-[0.16em] text-wine/75">
                Pinky Swear · New Toronto
              </span>
            </div>

            {currentEvent?.notes && (
              <p className="mt-5 max-w-sm font-display italic font-light text-[15px] leading-[1.65] text-wine/85">
                &ldquo;{currentEvent.notes}&rdquo;
              </p>
            )}

            {/* settings row */}
            <div className="mt-7 flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] flex-wrap">
              <button
                onClick={() => setShowEventEditor(true)}
                className="text-wine/75 hover:text-wine transition-colors"
              >
                Edit edition
              </button>
              <span className="text-wine/30">·</span>
              <button
                onClick={async () => {
                  const next = (events.reduce((m, e) => Math.max(m, e.edition_number), 0) || 0) + 1;
                  await supabase.from('abc_events').insert({ edition_number: next, status: 'planning' });
                  await fetchData();
                }}
                className="text-wine/75 hover:text-wine transition-colors"
              >
                + New edition
              </button>
            </div>
          </div>

          {/* tally — quieter on the right */}
          <div className="sm:text-right sm:pl-8 sm:pt-7 sm:min-w-[140px]">
            <div className="text-[11px] uppercase tracking-[0.18em] text-wine/75 mb-2">Pinky sworn</div>
            <div className="flex items-baseline sm:justify-end gap-1.5">
              <span
                className="font-display font-light text-pinky-bright"
                style={{ fontSize: 'clamp(48px, 7vw, 64px)', lineHeight: 0.9, letterSpacing: '-0.04em' }}
              >
                {String(confirmedCount).padStart(2, '0')}
              </span>
              <span className="font-display italic font-light text-[22px] text-wine/65 tracking-tight">
                /{String(totalSeats).padStart(2, '0')}
              </span>
            </div>
            {pendingCount > 0 && (
              <div className="text-[11px] uppercase tracking-[0.16em] text-wine/75 mt-2 font-medium">
                {pendingCount} awaiting reply
              </div>
            )}
            <div className="mt-3 flex sm:justify-end gap-1.5">
              {currentGuests.map((g) => (
                <span
                  key={g.id}
                  title={`${g.name} · ${STATUS_LABELS[g.status]}`}
                  className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[g.status]}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DATE POLL + SEED CARDS — differentiated rituals */}
      {currentEvent && (() => {
        const eventPoll = polls.find((p) => p.event_id === currentEvent.id);
        const eventOptions = eventPoll
          ? pollOptions
              .filter((o) => o.poll_id === eventPoll.id)
              .map((o) => ({
                ...o,
                votes: pollResponses.filter((r) => r.option_id === o.id && r.response === 'yes').length,
                maybes: pollResponses.filter((r) => r.option_id === o.id && r.response === 'maybe').length,
              }))
              .sort((a, b) => (b.votes * 2 + b.maybes) - (a.votes * 2 + a.maybes) || a.proposed_date.localeCompare(b.proposed_date))
          : [];
        const dateLocked = !!eventPoll && eventPoll.status === 'decided';
        const composedGuests = currentGuests.filter((g) => Array.isArray(g.seed_questions) && g.seed_questions.length === 3);
        const composedCount = composedGuests.length;
        const seedTarget = Math.max(currentGuests.length, 1);
        const featured = composedGuests[0];
        const featuredQuestion = featured?.seed_questions?.[0];
        const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi'];
        return (
          <section className="px-6 sm:px-10 max-w-5xl mx-auto mt-2 mb-20 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12">
            {/* DATE POLL — as a ledger */}
            <div className="relative">
              <div className="flex items-baseline justify-between mb-3 gap-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-wine/75">Date poll</div>
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em]">
                  <a
                    href={waShareToGroup({ event: currentEvent, kind: 'poll' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest hover:text-wine-soft font-medium transition-colors flex items-center gap-1.5"
                    aria-label="Share poll to WhatsApp group"
                  >
                    <WaIcon /> Share
                  </a>
                  <Link
                    href={`/edition/${currentEvent.id}/poll`}
                    className="text-wine/75 hover:text-wine transition-colors"
                  >
                    Open ledger →
                  </Link>
                </div>
              </div>
              <div
                className="font-display italic font-light text-wine tracking-tight"
                style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', lineHeight: 1.1 }}
              >
                {dateLocked ? 'Date is locked.' : 'When shall we meet?'}
              </div>

              <ol className="mt-5 border-t border-wine/30">
                {eventOptions.length === 0 ? (
                  <li className="py-4 text-[14px] text-wine/75 italic">
                    No dates proposed yet. Open the ledger to auto-propose Sundays.
                  </li>
                ) : (
                  eventOptions.slice(0, 4).map((opt, idx) => {
                    const dt = new Date(opt.proposed_date + 'T12:00:00');
                    const label = dt.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
                    const isLocked = dateLocked && eventPoll.decided_option_id === opt.id;
                    return (
                      <li
                        key={opt.id}
                        className={`flex items-baseline gap-4 py-2.5 border-b border-wine/15 ${isLocked ? 'border-l-2 border-l-forest pl-3' : ''}`}
                      >
                        <span className="font-display italic font-light text-pinky-bright text-[14px] w-6 tracking-tight">
                          {ROMAN[idx]}.
                        </span>
                        <span className="font-display text-[15px] text-wine flex-1">
                          {label}
                          {opt.proposed_time && <span className="text-wine/70 italic ml-1.5">· {opt.proposed_time}</span>}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-wine/75">
                          {opt.votes === 0 && opt.maybes === 0
                            ? '—'
                            : `${opt.votes} sworn${opt.maybes ? ` · ${opt.maybes} maybe` : ''}`}
                        </span>
                      </li>
                    );
                  })
                )}
              </ol>
              {eventOptions.length > 0 && !dateLocked && (
                <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-wine/75">
                  {eventOptions[0].votes === 0 ? 'Awaiting first vote.' : `${eventOptions[0].votes} sworn so far.`}
                </div>
              )}
            </div>

            {/* SEED CARDS — actual stacked cards */}
            <div className="relative">
              <div className="flex items-baseline justify-between mb-3 gap-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-wine/75">Seed cards</div>
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em]">
                  <a
                    href={waShareToGroup({ event: currentEvent, kind: 'cards' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest hover:text-wine-soft font-medium transition-colors flex items-center gap-1.5"
                    aria-label="Share cards to WhatsApp group"
                  >
                    <WaIcon /> Share
                  </a>
                  <Link
                    href={`/edition/${currentEvent.id}`}
                    className="text-wine/75 hover:text-wine transition-colors"
                  >
                    Compose →
                  </Link>
                </div>
              </div>
              <div
                className="font-display italic font-light text-wine tracking-tight"
                style={{ fontSize: 'clamp(26px, 3.4vw, 34px)', lineHeight: 1.1 }}
              >
                Three sharp openers
              </div>

              {/* the card stack */}
              <div className="mt-6 relative" style={{ height: 220 }}>
                {/* card 3 — back, butter */}
                <div
                  className="absolute inset-0 border border-wine/25 bg-butter/40 rounded-sm"
                  style={{ transform: 'translate(14px, 14px) rotate(2.4deg)' }}
                  aria-hidden="true"
                />
                {/* card 2 — middle, sage */}
                <div
                  className="absolute inset-0 border border-wine/30 bg-forest-soft/55 rounded-sm"
                  style={{ transform: 'translate(7px, 7px) rotate(-1.4deg)' }}
                  aria-hidden="true"
                />
                {/* card 1 — front */}
                <div className="absolute inset-0 border border-wine bg-cream rounded-sm p-5 flex flex-col justify-between">
                  <div className="flex items-baseline justify-between">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-wine/75">
                      Card i
                    </div>
                    {featured && (
                      <div className="text-[11px] uppercase tracking-[0.16em] text-wine/75 italic font-display">
                        for {featured.name.split(' ')[0]}
                      </div>
                    )}
                  </div>
                  <div
                    className={`font-display italic font-light leading-snug ${featuredQuestion ? 'text-wine/90' : 'text-wine/60'}`}
                    style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', lineHeight: 1.45 }}
                  >
                    {featuredQuestion || 'Awaiting your first opener.'}
                  </div>
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-wine/75">
                    <span>{composedCount} of {seedTarget} composed</span>
                    <span className="font-display italic normal-case tracking-normal text-[13px] text-wine/65">
                      Pinky's quill
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* CHAPTER MARK II */}
      <ChapterMark roman="II" label="The Roster" className="px-6 sm:px-10 max-w-5xl mx-auto" />

      {/* THE ROSTER */}
      <section className="px-6 sm:px-10 max-w-5xl mx-auto mt-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-3xl sm:text-[44px] font-medium tracking-tight text-wine">
            The Roster<span className="text-forest">.</span>
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-[10px] uppercase tracking-[0.18em] text-forest hover:text-wine-soft font-medium transition-colors"
          >
            + Add a guest
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-wine/5 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : currentGuests.length === 0 ? (
          <div className="border border-dashed border-wine/20 rounded-sm p-12 text-center">
            <p className="font-display italic text-wine/60 text-lg">
              No guests on the list yet.
            </p>
            <p className="text-[12px] uppercase tracking-[0.18em] text-wine/65 mt-3">
              Send the first invite
            </p>
          </div>
        ) : (
          <ul className="border-t border-wine">
            {currentGuests.map((guest, i) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                event={currentEvent}
                idx={i}
                onEdit={() => setEditingId(guest.id)}
                onUpdate={fetchData}
              />
            ))}
          </ul>
        )}
      </section>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto mt-24 pt-10 border-t border-wine">
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

      {showAddForm && currentEvent && (
        <GuestForm
          eventId={currentEvent.id}
          event={currentEvent}
          onClose={() => setShowAddForm(false)}
          onSaved={() => { setShowAddForm(false); fetchData(); }}
        />
      )}

      {editingId && (
        <GuestForm
          eventId={currentEvent?.id}
          event={currentEvent}
          guest={guests.find((g) => g.id === editingId)}
          onClose={() => setEditingId(null)}
          onSaved={() => { setEditingId(null); fetchData(); }}
        />
      )}

      {showEventEditor && currentEvent && (
        <EventEditor
          event={currentEvent}
          onClose={() => setShowEventEditor(false)}
          onSaved={() => { setShowEventEditor(false); fetchData(); }}
        />
      )}
    </main>
  );
}

/* ---------- WhatsApp glyph ---------- */
function WaIcon({ className = '' }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31s-.86.85-.86 2.07.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
    </svg>
  );
}

/* ---------- Chapter mark ---------- */
const ROMAN_TONE = {
  I: 'text-pinky-bright',
  II: 'text-forest',
  III: 'text-wine-soft',
};
function ChapterMark({ roman, label, className = '' }) {
  const tone = ROMAN_TONE[roman] || 'text-pinky-bright';
  return (
    <div className={`flex items-center gap-3.5 reveal ${className}`}>
      <span className={`font-display italic font-light text-[22px] tracking-tight ${tone}`}>
        {roman}.
      </span>
      <span className="hairline flex-1" />
      <span className="text-[11px] uppercase tracking-[0.16em] text-wine/75">{label}</span>
    </div>
  );
}

/* ---------- Roster row ---------- */
function GuestRow({ guest, event, idx, onEdit, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [hover, setHover] = useState(false);

  async function quickSetStatus(newStatus) {
    if (updating) return;
    setUpdating(true);
    const responded = newStatus === 'confirmed' || newStatus === 'declined';
    await supabase
      .from('abc_guests')
      .update({
        status: newStatus,
        responded_at: responded && !guest.responded_at ? new Date().toISOString() : guest.responded_at,
      })
      .eq('id', guest.id);
    await onUpdate();
    setUpdating(false);
  }

  return (
    <li
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="grid items-center gap-x-4 py-4 sm:py-5 border-b border-wine/15 transition-all duration-300"
      style={{
        gridTemplateColumns: '36px 1fr auto',
        background: hover ? 'rgba(248,220,223,0.16)' : 'transparent',
        marginInline: hover ? '-12px' : 0,
        paddingInline: hover ? '12px' : 0,
      }}
    >
      {/* drop-cap numeral */}
      <div className="font-display italic font-light text-2xl sm:text-[28px] text-wine/60 leading-none tracking-tight">
        {String(idx + 1).padStart(2, '0')}
      </div>

      {/* name + meta + bloom note */}
      <div className="min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          {guest.linkedin_url ? (
            <a
              href={guest.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-lg sm:text-[22px] font-medium text-wine hover:text-pinky-bright transition-colors tracking-tight"
            >
              {guest.name}
            </a>
          ) : (
            <span className="font-display text-lg sm:text-[22px] font-medium text-wine tracking-tight">
              {guest.name}
            </span>
          )}
          {guest.linkedin_url && (
            <a
              href={guest.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="text-wine/60 hover:text-wine transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          )}
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-wine/75 mt-1">
          Inv. {INVITED_BY_LABEL[guest.invited_by] || guest.invited_by}
          <span className="text-wine/30 mx-1.5">·</span>
          <span className="font-display italic text-[12px] tracking-normal normal-case">
            {formatDate(guest.invited_at)}
          </span>
        </div>
        {guest.dossier && (
          <div
            className="overflow-hidden"
            style={{
              maxHeight: hover ? 220 : 0,
              opacity: hover ? 1 : 0,
              marginTop: hover ? 8 : 0,
              transition: 'max-height 360ms ease, opacity 320ms ease, margin-top 320ms ease',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-forest/85">Dossier</span>
              <span className="h-px flex-1 bg-forest/25" />
            </div>
            <p
              className="font-display italic font-light text-[13.5px] text-wine/75 leading-[1.55] max-w-2xl"
            >
              {guest.dossier}
            </p>
          </div>
        )}
        {!guest.dossier && guest.notes && (
          <div
            className="font-display italic font-light text-[13px] text-wine/60 leading-[1.5] overflow-hidden"
            style={{
              maxHeight: hover ? 80 : 0,
              opacity: hover ? 1 : 0,
              marginTop: hover ? 6 : 0,
              transition: 'max-height 320ms ease, opacity 320ms ease, margin-top 320ms ease',
            }}
          >
            &ldquo;{guest.notes}&rdquo;
          </div>
        )}
      </div>

      {/* pill + actions */}
      <div className="flex items-center gap-3 shrink-0">
        <StatusPill status={guest.status} onChange={quickSetStatus} disabled={updating} />
        {guest.phone && event && (
          <a
            href={waGuestInvite({ guest, event })}
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest hover:text-wine-soft transition-colors"
            aria-label="Send WhatsApp invite"
            title="Send WhatsApp invite"
          >
            <WaIcon className="w-[15px] h-[15px]" />
          </a>
        )}
        <button
          onClick={onEdit}
          className="text-wine/60 hover:text-wine transition-colors"
          aria-label="Edit guest"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
          </svg>
        </button>
      </div>
    </li>
  );
}

/* ---------- Status pill ---------- */
function StatusPill({ status, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} disabled={disabled}>
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] px-2.5 py-1.5 border rounded-full font-medium ${STATUS_STYLES[status]} cursor-pointer hover:opacity-85 transition-opacity ${disabled ? 'opacity-50' : ''}`}
        >
          <span className="pill-glyph">{STATUS_GLYPHS[status]}</span>
          {STATUS_LABELS[status]}
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-cream border border-wine/15 rounded-sm shadow-md py-1 min-w-[150px]">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-[11px] uppercase tracking-[0.16em] hover:bg-pinky-soft/50 flex items-center gap-2 ${s === status ? 'text-wine font-semibold' : 'text-wine/70'}`}
              >
                <span className="pill-glyph">{STATUS_GLYPHS[s]}</span>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Guest form ---------- */
function GuestForm({ eventId, guest, event, onClose, onSaved }) {
  const isEdit = !!guest;
  const [name, setName] = useState(guest?.name || '');
  const [linkedinUrl, setLinkedinUrl] = useState(guest?.linkedin_url || '');
  const [phone, setPhone] = useState(guest?.phone || '');
  const [invitedBy, setInvitedBy] = useState(guest?.invited_by || 'justyn');
  const [status, setStatus] = useState(guest?.status || 'invited');
  const [notes, setNotes] = useState(guest?.notes || '');
  const [dossier, setDossier] = useState(guest?.dossier || '');
  const [composing, setComposing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleCompose() {
    if (!name.trim()) { setError('Name first.'); return; }
    setComposing(true);
    setError('');
    try {
      const res = await fetch('/api/dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          linkedin_url: linkedinUrl.trim(),
          notes: notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Compose failed.');
      setDossier(data.dossier);
    } catch (e) {
      setError(e.message);
    } finally {
      setComposing(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      event_id: eventId,
      name: name.trim(),
      linkedin_url: linkedinUrl.trim() || null,
      phone: phone.trim() || null,
      invited_by: invitedBy,
      status,
      notes: notes.trim() || null,
      dossier: dossier.trim() || null,
    };
    if (dossier.trim() && dossier.trim() !== (guest?.dossier || '')) {
      payload.dossier_generated_at = new Date().toISOString();
    }
    if (status === 'confirmed' || status === 'declined') {
      payload.responded_at = guest?.responded_at || new Date().toISOString();
    }
    const op = isEdit
      ? supabase.from('abc_guests').update(payload).eq('id', guest.id)
      : supabase.from('abc_guests').insert(payload);
    const { error: err } = await op;
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved();
  }

  async function handleDelete() {
    if (!guest) return;
    if (!confirm(`Remove ${guest.name} from the roster?`)) return;
    setDeleting(true);
    const { error: err } = await supabase.from('abc_guests').delete().eq('id', guest.id);
    setDeleting(false);
    if (err) { setError(err.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-wine/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-cream border-t sm:border border-wine/15 sm:rounded-sm p-7 sm:p-9 max-w-lg w-full max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-7">
          <h3 className="font-display text-2xl text-wine tracking-tight">
            {isEdit ? 'Edit guest' : 'New guest'}
          </h3>
          <button type="button" onClick={onClose} className="text-wine/65 hover:text-wine text-2xl leading-none">×</button>
        </div>

        <div className="space-y-5">
          <Field label="Name">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Eg. Geoffrey Hinton" className="form-input" />
          </Field>

          <Field label="LinkedIn URL">
            <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" className="form-input" />
          </Field>

          <Field label="WhatsApp number (optional)">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 416 555 1234"
              className="form-input"
            />
            <div className="text-[11px] text-wine/65 mt-1.5 italic">
              Include the country code. We use this to pre-fill a WhatsApp invite when you tap Send.
            </div>
          </Field>

          <Field label="Invited by">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INVITED_BY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInvitedBy(opt.value)}
                  className={`px-3 py-2.5 text-[11px] uppercase tracking-[0.16em] border rounded-sm transition-colors ${
                    invitedBy === opt.value
                      ? 'bg-wine text-cream border-wine'
                      : 'bg-transparent text-wine/65 border-wine/15 hover:border-wine/35'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Status">
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2.5 text-[12px] uppercase tracking-[0.16em] border rounded-sm transition-colors flex items-center justify-center gap-2 ${
                    status === s
                      ? 'bg-wine text-cream border-wine'
                      : 'bg-transparent text-wine/65 border-wine/15 hover:border-wine/35'
                  }`}
                >
                  <span className="pill-glyph" style={{ color: status === s ? '#F4EDE0' : undefined }}>{STATUS_GLYPHS[s]}</span>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" placeholder="Why we want them at the table" className="form-input resize-none" />
          </Field>

          {/* Dossier (AI-composed) */}
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[10px] uppercase tracking-[0.16em] text-forest">Dossier</div>
              <button
                type="button"
                onClick={handleCompose}
                disabled={composing || !name.trim()}
                className="text-[10px] uppercase tracking-[0.18em] text-forest hover:text-wine-soft font-medium disabled:opacity-40"
              >
                {composing ? 'Composing…' : dossier ? 'Recompose' : '+ Compose'}
              </button>
            </div>
            {dossier ? (
              <textarea
                value={dossier}
                onChange={(e) => setDossier(e.target.value)}
                rows="5"
                className="form-input resize-none italic"
                style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 14, lineHeight: 1.6 }}
              />
            ) : (
              <div className="border border-dashed border-wine/15 rounded-sm px-4 py-5 text-center">
                <p className="font-display italic text-[13px] text-wine/70">
                  An editorial paragraph on why this person belongs at the table.
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-[14px] text-alert font-medium">{error}</p>}
        </div>

        {isEdit && phone && event && (
          <div className="mt-6 border-t border-wine/15 pt-5">
            <a
              href={waGuestInvite({ guest: { ...guest, name: name.trim() || guest.name, phone }, event })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border border-forest/40 bg-forest-soft/30 hover:bg-forest-soft/55 rounded-sm px-4 py-3 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-forest font-medium text-[13px] uppercase tracking-[0.16em]">
                <WaIcon /> Send WhatsApp invite
              </span>
              <span className="text-forest font-display italic text-xl">→</span>
            </a>
            <div className="text-[11px] text-wine/65 italic mt-2">
              Opens WhatsApp with a draft message ready to send. Edit before sending if you like.
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <div>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-[11px] uppercase tracking-[0.18em] text-ash hover:text-alert disabled:opacity-50 font-medium"
              >
                {deleting ? 'Removing…' : 'Remove guest'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="text-[11px] uppercase tracking-[0.18em] text-wine/65 hover:text-wine">
              Cancel
            </button>
            <button type="submit" disabled={!name || saving} className="bg-wine text-cream px-6 py-2.5 text-[11px] uppercase tracking-[0.18em] rounded-sm hover:bg-wine-soft disabled:opacity-40">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add to roster'}
            </button>
          </div>
        </div>
      </form>
      <style jsx>{`
        .form-input {
          width: 100%;
          background: rgba(237, 227, 210, 0.5);
          border: 1px solid rgba(58, 22, 34, 0.15);
          border-radius: 2px;
          padding: 12px 14px;
          color: #3A1622;
          font-size: 14px;
          outline: none;
        }
        .form-input:focus { border-color: #F47A86; }
        .form-input::placeholder { color: rgba(58, 22, 34, 0.35); font-style: italic; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-[10px] uppercase tracking-[0.16em] text-wine/75 mb-2">{label}</div>
      {children}
    </label>
  );
}

/* ---------- Event editor (logic unchanged) ---------- */
function EventEditor({ event, onClose, onSaved }) {
  const [eventDate, setEventDate] = useState(event?.event_date || '');
  const [editionNumber, setEditionNumber] = useState(event?.edition_number || 1);
  const [status, setStatus] = useState(event?.status || 'planning');
  const [notes, setNotes] = useState(event?.notes || '');
  const [waUrl, setWaUrl] = useState(event?.whatsapp_invite_url || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      edition_number: parseInt(editionNumber, 10),
      event_date: eventDate || null,
      status,
      notes: notes.trim() || null,
      whatsapp_invite_url: waUrl.trim() || null,
    };
    const { error: err } = await supabase.from('abc_events').update(payload).eq('id', event.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved();
  }

  async function handleDelete() {
    if (!event) return;
    const { count } = await supabase
      .from('abc_guests')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id);
    const hasGuests = (count || 0) > 0;
    const message = hasGuests
      ? `This edition has ${count} guest${count === 1 ? '' : 's'} attached. Removing the edition will also remove its roster and any date poll. Continue?`
      : `Remove Brunch № ${String(event.edition_number).padStart(2, '0')}? It has no guests and no date poll responses.`;
    if (!confirm(message)) return;
    setDeleting(true);
    setError('');
    const { error: err } = await supabase.from('abc_events').delete().eq('id', event.id);
    setDeleting(false);
    if (err) { setError(err.message); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 bg-wine/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-cream border-t sm:border border-wine/15 sm:rounded-sm p-7 sm:p-9 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-7">
          <h3 className="font-display text-2xl text-wine tracking-tight">Edit edition</h3>
          <button type="button" onClick={onClose} className="text-wine/65 hover:text-wine text-2xl leading-none">×</button>
        </div>

        <div className="space-y-5">
          <Field label="Brunch number">
            <input type="number" min="1" value={editionNumber} onChange={(e) => setEditionNumber(e.target.value)} className="form-input" />
          </Field>
          <Field label="Date">
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="form-input" />
          </Field>
          <Field label="Status">
            <div className="grid grid-cols-3 gap-2">
              {['planning', 'locked', 'past'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-3 py-2.5 text-[11px] uppercase tracking-[0.16em] border rounded-sm transition-colors ${
                    status === s ? 'bg-wine text-cream border-wine' : 'bg-transparent text-wine/65 border-wine/15 hover:border-wine/35'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Notes">
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="2" className="form-input resize-none" />
          </Field>
          <Field label="WhatsApp group invite link">
            <input
              type="url"
              value={waUrl}
              onChange={(e) => setWaUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/…"
              className="form-input"
            />
            <div className="text-[11px] text-wine/65 mt-1.5 italic">
              Paste your group's invite link once. Used to invite guests in one tap.
            </div>
          </Field>
          {error && <p className="text-[14px] text-alert font-medium">{error}</p>}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="text-[11px] uppercase tracking-[0.18em] text-ash hover:text-alert disabled:opacity-40 font-medium"
          >
            {deleting ? 'Removing…' : 'Remove edition'}
          </button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="text-[11px] uppercase tracking-[0.18em] text-wine/65 hover:text-wine">Cancel</button>
            <button type="submit" disabled={saving} className="bg-wine text-cream px-6 py-2.5 text-[11px] uppercase tracking-[0.18em] rounded-sm hover:bg-wine-soft disabled:opacity-40">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </form>
      <style jsx>{`
        .form-input {
          width: 100%;
          background: rgba(237, 227, 210, 0.5);
          border: 1px solid rgba(58, 22, 34, 0.15);
          border-radius: 2px;
          padding: 12px 14px;
          color: #3A1622;
          font-size: 14px;
          outline: none;
        }
        .form-input:focus { border-color: #F47A86; }
      `}</style>
    </div>
  );
}
