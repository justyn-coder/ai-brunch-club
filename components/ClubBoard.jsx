'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import PinkyMark from './PinkyMark';

const STATUS_LABELS = {
  invited: 'Invited',
  confirmed: 'Pinky Sworn',
  maybe: 'Maybe',
  declined: 'Regrets',
};

const STATUS_STYLES = {
  invited: 'bg-pinky-soft text-wine border-pinky/40',
  confirmed: 'bg-forest-soft text-forest border-forest/30',
  maybe: 'bg-butter/30 text-wine border-butter/40',
  declined: 'bg-ash-soft text-ash border-ash/30',
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

export default function ClubBoard() {
  const [events, setEvents] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEventEditor, setShowEventEditor] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <main className="min-h-screen pb-32">
      {/* top bar */}
      <header className="px-6 pt-6 pb-12 max-w-3xl mx-auto flex items-center justify-between text-wine">
        <div className="flex items-center gap-3">
          <PinkyMark size={36} className="text-wine" />
          <span className="font-display italic text-sm tracking-tight">A.B.C.</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-wine/60 text-right">
          Members
          <span className="block text-wine/45 mt-0.5 normal-case tracking-normal text-[11px] font-display italic">
            Justyn · Brad · John
          </span>
        </div>
      </header>

      {/* hero */}
      <section className="px-6 max-w-3xl mx-auto pt-2 pb-16">
        <h1 className="font-display text-[16vw] sm:text-[112px] leading-[0.92] tracking-[-0.04em] text-wine">
          <span className="italic font-light">AI</span>
          <br />
          <span className="font-medium">Brunch</span>
          <br />
          <span className="font-medium">Club</span>
          <span className="text-pinky-bright">.</span>
        </h1>
        <div className="mt-10 flex items-center gap-3 text-wine/70">
          <div className="h-px w-10 bg-wine/30" />
          <p className="font-display italic text-base sm:text-lg">
            Founded at Pinky Swear, Etobicoke.
          </p>
        </div>
        <p className="mt-8 max-w-md text-[15px] leading-[1.65] text-wine/85">
          A standing date with two guests of honour. Conversation is the menu.
          Eggs go cold. Ideas don&apos;t.
        </p>
      </section>

      {/* current edition card */}
      <section className="px-6 max-w-3xl mx-auto mb-10">
        <div className="border border-wine/15 bg-cream-deep/50 rounded-sm p-7 sm:p-9">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-wine/55 mb-3">
                The next gathering
              </div>
              <div className="font-display text-3xl sm:text-4xl text-wine tracking-tight">
                Brunch No. {currentEvent ? String(currentEvent.edition_number).padStart(2, '0') : '01'}
              </div>
              <div className="font-display italic text-wine/70 text-base sm:text-lg mt-2">
                {currentEvent?.event_date
                  ? formatLongDate(currentEvent.event_date)
                  : 'Date to be sworn'}
              </div>
              <div className="text-[12px] uppercase tracking-[0.18em] text-wine/55 mt-4">
                Pinky Swear · Etobicoke
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display text-5xl sm:text-6xl text-pinky-bright leading-none">
                {String(confirmedCount).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-wine/55 mt-2">
                Pinky sworn
              </div>
              {pendingCount > 0 && (
                <div className="text-[11px] text-wine/50 mt-3 font-display italic">
                  {pendingCount} awaiting
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-wine/10 flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setShowEventEditor(true)}
              className="uppercase tracking-[0.16em] text-wine/55 hover:text-wine"
            >
              Edit edition
            </button>
            <button
              onClick={async () => {
                const next = (events.reduce((m, e) => Math.max(m, e.edition_number), 0) || 0) + 1;
                await supabase.from('abc_events').insert({ edition_number: next, status: 'planning' });
                await fetchData();
              }}
              className="uppercase tracking-[0.16em] text-wine/55 hover:text-wine"
            >
              + New edition
            </button>
          </div>
        </div>
      </section>

      {/* the roster */}
      <section className="px-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-wine tracking-tight">The Roster</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-[11px] uppercase tracking-[0.18em] text-pinky-bright hover:text-wine transition-colors flex items-center gap-2"
          >
            <span className="text-base leading-none">+</span> Add a guest
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-wine/5 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : currentGuests.length === 0 ? (
          <div className="border border-dashed border-wine/20 rounded-sm p-12 text-center">
            <p className="font-display italic text-wine/60 text-lg">
              No guests on the list yet.
            </p>
            <p className="text-[12px] uppercase tracking-[0.18em] text-wine/40 mt-3">
              Send the first invite
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-wine/10 border-y border-wine/10">
            {currentGuests.map((guest) => (
              <GuestRow
                key={guest.id}
                guest={guest}
                onEdit={() => setEditingId(guest.id)}
                onUpdate={fetchData}
              />
            ))}
          </ul>
        )}
      </section>

      {/* footer */}
      <footer className="px-6 max-w-3xl mx-auto mt-24 pt-10 border-t border-wine/10">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-wine/45">
          <div className="flex items-center gap-2">
            <PinkyMark size={20} className="text-wine/40" />
            <span>Est. 2026</span>
          </div>
          <span className="font-display italic normal-case tracking-normal text-wine/40">
            First rule: don&apos;t bring eggs to an idea fight.
          </span>
        </div>
      </footer>

      {showAddForm && currentEvent && (
        <GuestForm
          eventId={currentEvent.id}
          onClose={() => setShowAddForm(false)}
          onSaved={() => {
            setShowAddForm(false);
            fetchData();
          }}
        />
      )}

      {editingId && (
        <GuestForm
          eventId={currentEvent?.id}
          guest={guests.find((g) => g.id === editingId)}
          onClose={() => setEditingId(null)}
          onSaved={() => {
            setEditingId(null);
            fetchData();
          }}
        />
      )}

      {showEventEditor && currentEvent && (
        <EventEditor
          event={currentEvent}
          onClose={() => setShowEventEditor(false)}
          onSaved={() => {
            setShowEventEditor(false);
            fetchData();
          }}
        />
      )}
    </main>
  );
}

function GuestRow({ guest, onEdit, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const initials = guest.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
    <li className="py-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-pinky-soft border border-pinky/30 flex items-center justify-center font-display italic text-wine text-sm shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {guest.linkedin_url ? (
            <a
              href={guest.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-lg text-wine hover:text-pinky-bright transition-colors tracking-tight"
            >
              {guest.name}
            </a>
          ) : (
            <span className="font-display text-lg text-wine tracking-tight">{guest.name}</span>
          )}
          {guest.linkedin_url && (
            <a
              href={guest.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="text-wine/40 hover:text-wine"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          )}
        </div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-wine/50 mt-1">
          Invited by {INVITED_BY_LABEL[guest.invited_by] || guest.invited_by} · {formatDate(guest.invited_at)}
        </div>
        {guest.notes && (
          <div className="font-display italic text-[13px] text-wine/60 mt-2">
            &ldquo;{guest.notes}&rdquo;
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusPill status={guest.status} onChange={quickSetStatus} disabled={updating} />
        <button
          onClick={onEdit}
          className="text-wine/35 hover:text-wine"
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

function StatusPill({ status, onChange, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} disabled={disabled}>
        <span
          className={`inline-block text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 border rounded-full font-medium ${STATUS_STYLES[status]} cursor-pointer hover:opacity-80 ${disabled ? 'opacity-50' : ''}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-cream border border-wine/15 rounded-sm shadow-md py-1 min-w-[140px]">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[11px] uppercase tracking-[0.16em] hover:bg-pinky-soft/50 ${s === status ? 'text-wine font-semibold' : 'text-wine/70'}`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GuestForm({ eventId, guest, onClose, onSaved }) {
  const isEdit = !!guest;
  const [name, setName] = useState(guest?.name || '');
  const [linkedinUrl, setLinkedinUrl] = useState(guest?.linkedin_url || '');
  const [invitedBy, setInvitedBy] = useState(guest?.invited_by || 'justyn');
  const [status, setStatus] = useState(guest?.status || 'invited');
  const [notes, setNotes] = useState(guest?.notes || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

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
    };
    if (status === 'confirmed' || status === 'declined') {
      payload.responded_at = guest?.responded_at || new Date().toISOString();
    }
    const op = isEdit
      ? supabase.from('abc_guests').update(payload).eq('id', guest.id)
      : supabase.from('abc_guests').insert(payload);
    const { error: err } = await op;
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  }

  async function handleDelete() {
    if (!guest) return;
    if (!confirm(`Remove ${guest.name} from the roster?`)) return;
    setDeleting(true);
    const { error: err } = await supabase.from('abc_guests').delete().eq('id', guest.id);
    setDeleting(false);
    if (err) {
      setError(err.message);
      return;
    }
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
          <button type="button" onClick={onClose} className="text-wine/40 hover:text-wine text-2xl leading-none">×</button>
        </div>

        <div className="space-y-5">
          <Field label="Name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eg. Geoffrey Hinton"
              className="form-input"
            />
          </Field>

          <Field label="LinkedIn URL">
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/…"
              className="form-input"
            />
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
                  className={`px-4 py-2.5 text-[12px] uppercase tracking-[0.16em] border rounded-sm transition-colors ${
                    status === s
                      ? 'bg-wine text-cream border-wine'
                      : 'bg-transparent text-wine/65 border-wine/15 hover:border-wine/35'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Why we want them at the table"
              className="form-input resize-none"
            />
          </Field>

          {error && <p className="text-[12px] text-pinky-bright italic">{error}</p>}
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
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] uppercase tracking-[0.18em] text-wine/50 hover:text-wine"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || saving}
              className="bg-wine text-cream px-6 py-2.5 text-[11px] uppercase tracking-[0.18em] rounded-sm hover:bg-wine-soft disabled:opacity-40"
            >
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
      <div className="text-[10px] uppercase tracking-[0.22em] text-wine/55 mb-2">{label}</div>
      {children}
    </label>
  );
}

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
    if (err) {
      setError(err.message);
      return;
    }
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
          <button type="button" onClick={onClose} className="text-wine/40 hover:text-wine text-2xl leading-none">×</button>
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
          {error && <p className="text-[12px] text-pinky-bright italic">{error}</p>}
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
