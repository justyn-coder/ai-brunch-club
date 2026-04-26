'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEventEditor, setShowEventEditor] = useState(false);

  useEffect(() => { fetchData(); }, []);
  useReveal();

  async function fetchData() {
    setLoading(true);
    const [eventsRes, guestsRes] = await Promise.all([
      supabase.from('abc_events').select('*').order('edition_number', { ascending: true }),
      supabase.from('abc_guests').select('*').order('invited_at', { ascending: false }),
    ]);
    setEvents(eventsRes.data || []);
    setGuests(guestsRes.data || []);
    setLoading(false);
  }

  const currentEvent = events.find((e) => e.status === 'planning') || events[events.length - 1];
  const currentGuests = currentEvent
    ? guests.filter((g) => g.event_id === currentEvent.id)
    : [];

  const confirmedCount = currentGuests.filter((g) => g.status === 'confirmed').length;
  const pendingCount = currentGuests.filter((g) => g.status === 'invited' || g.status === 'maybe').length;
  const totalSeats = Math.max(currentGuests.length, 6);

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
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.16em] text-wine/75">Members</div>
            <div className="font-display italic font-light text-[14px] mt-1 tracking-tight">
              Justyn · Brad · John
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
              A standing date with two guests of honour. Conversation is the menu. Eggs go cold. Ideas don&apos;t.
            </p>
          </div>
        </div>
      </section>

      {/* CHAPTER MARK I */}
      <ChapterMark roman="I" label="The next gathering" className="px-6 sm:px-10 max-w-5xl mx-auto" />

      {/* FRONTISPIECE — current edition */}
      <section className="px-6 sm:px-10 max-w-5xl mx-auto mt-8 mb-24 sm:mb-28">
        <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr_auto] gap-x-0 sm:gap-x-0 gap-y-8 items-start reveal">
          {/* oversized 01 numeral */}
          <div className="relative">
            <div
              className="font-display font-light text-wine"
              style={{ fontSize: 'clamp(180px, 24vw, 280px)', lineHeight: 0.85, letterSpacing: '-0.06em', marginLeft: '-0.04em', marginTop: '-0.08em' }}
            >
              <span className="font-extralight italic">
                {currentEvent ? String(currentEvent.edition_number).padStart(2, '0').charAt(0) : '0'}
              </span>
              {currentEvent ? String(currentEvent.edition_number).padStart(2, '0').charAt(1) : '1'}
            </div>
            <div className="absolute bottom-1 left-1 text-[11px] uppercase tracking-[0.16em] text-wine/75">
              Brunch №
            </div>
          </div>

          {/* hairline rule + hung copy */}
          <div className="sm:border-l sm:border-wine sm:pl-8 sm:self-stretch sm:pt-2">
            <div className="font-display italic font-light text-2xl sm:text-[28px] leading-[1.15] tracking-tight max-w-md">
              {currentEvent?.event_date ? formatLongDate(currentEvent.event_date) : 'Date to be sworn'}
            </div>
            <div className="mt-4 flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-pinky-bright" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-wine/65">
                Pinky Swear · New Toronto
              </span>
            </div>
            {currentEvent?.notes && (
              <p className="mt-5 max-w-sm font-display italic font-light text-[14px] leading-[1.65] text-wine/70">
                &ldquo;{currentEvent.notes}&rdquo;
              </p>
            )}
            <div className="mt-6 flex items-center gap-4 text-[11px] flex-wrap">
              <button
                onClick={() => setShowEventEditor(true)}
                className="uppercase tracking-[0.16em] text-wine/75 hover:text-wine transition-colors"
              >
                Edit edition
              </button>
              {currentEvent && (
                <Link
                  href={`/edition/${currentEvent.id}/poll`}
                  className="uppercase tracking-[0.16em] text-forest hover:text-wine-soft transition-colors font-medium"
                >
                  Date poll →
                </Link>
              )}
              {currentEvent && (
                <Link
                  href={`/edition/${currentEvent.id}`}
                  className="uppercase tracking-[0.16em] text-wine-soft hover:text-wine transition-colors font-medium"
                >
                  Seed cards →
                </Link>
              )}
              <button
                onClick={async () => {
                  const next = (events.reduce((m, e) => Math.max(m, e.edition_number), 0) || 0) + 1;
                  await supabase.from('abc_events').insert({ edition_number: next, status: 'planning' });
                  await fetchData();
                }}
                className="uppercase tracking-[0.16em] text-wine/75 hover:text-wine transition-colors"
              >
                + New edition
              </button>
            </div>
          </div>

          {/* tally */}
          <div className="text-right min-w-[140px] sm:pl-8 sm:pt-2">
            <div className="text-[10px] uppercase tracking-[0.16em] text-wine/75 mb-2.5">
              Pinky sworn
            </div>
            <div className="flex items-baseline justify-end gap-1.5">
              <span
                className="font-display font-light text-pinky-bright"
                style={{ fontSize: 'clamp(64px, 9vw, 84px)', lineHeight: 0.9, letterSpacing: '-0.04em' }}
              >
                {String(confirmedCount).padStart(2, '0')}
              </span>
              <span className="font-display italic font-light text-[28px] text-wine/65 tracking-tight">
                /{String(totalSeats).padStart(2, '0')}
              </span>
            </div>
            {pendingCount > 0 && (
              <div className="text-[11px] uppercase tracking-[0.16em] text-wine/70 mt-3">
                {pendingCount} awaiting reply
              </div>
            )}
            {/* dot tally — one per guest, color by status */}
            <div className="mt-4 flex justify-end gap-1.5">
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
                idx={i}
                onEdit={() => setEditingId(guest.id)}
                onUpdate={fetchData}
              />
            ))}
          </ul>
        )}
      </section>

      {/* FOOTER */}
      <footer className="px-6 sm:px-10 max-w-5xl mx-auto mt-24 pt-7 border-t border-wine">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-wine/75">
          <div className="flex items-center gap-2.5">
            <PinkyMark size={22} className="text-wine/70" />
            <span>Est. 2026 · Vol. I</span>
          </div>
          <span className="font-display italic normal-case tracking-normal text-[13px] text-wine/50">
            First rule. Don&apos;t bring eggs to an idea fight.
          </span>
        </div>
      </footer>

      {showAddForm && currentEvent && (
        <GuestForm
          eventId={currentEvent.id}
          onClose={() => setShowAddForm(false)}
          onSaved={() => { setShowAddForm(false); fetchData(); }}
        />
      )}

      {editingId && (
        <GuestForm
          eventId={currentEvent?.id}
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
function GuestRow({ guest, idx, onEdit, onUpdate }) {
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

      {/* pill + edit */}
      <div className="flex items-center gap-2 shrink-0">
        <StatusPill status={guest.status} onChange={quickSetStatus} disabled={updating} />
        <button
          onClick={onEdit}
          className="text-wine/30 hover:text-wine transition-colors"
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
function GuestForm({ eventId, guest, onClose, onSaved }) {
  const isEdit = !!guest;
  const [name, setName] = useState(guest?.name || '');
  const [linkedinUrl, setLinkedinUrl] = useState(guest?.linkedin_url || '');
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

        <div className="mt-8 flex items-center justify-between gap-4">
          <div>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-[11px] uppercase tracking-[0.18em] text-ash hover:text-pinky-bright disabled:opacity-50"
              >
                {deleting ? 'Removing…' : 'Remove guest'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="text-[11px] uppercase tracking-[0.18em] text-wine/50 hover:text-wine">
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
  const [saving, setSaving] = useState(false);
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
    };
    const { error: err } = await supabase.from('abc_events').update(payload).eq('id', event.id);
    setSaving(false);
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
          {error && <p className="text-[14px] text-alert font-medium">{error}</p>}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-[11px] uppercase tracking-[0.18em] text-wine/50 hover:text-wine">Cancel</button>
          <button type="submit" disabled={saving} className="bg-wine text-cream px-6 py-2.5 text-[11px] uppercase tracking-[0.18em] rounded-sm hover:bg-wine-soft disabled:opacity-40">
            {saving ? 'Saving…' : 'Save'}
          </button>
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
