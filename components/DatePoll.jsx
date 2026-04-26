'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PinkyMark from './PinkyMark';

const MEMBERS = [
  { id: 'justyn', label: 'Justyn', activeChip: 'bg-pinky-bright text-cream border-pinky-bright', dot: 'bg-pinky-bright' },
  { id: 'brad', label: 'Brad', activeChip: 'bg-butter text-wine border-butter', dot: 'bg-butter' },
  { id: 'john', label: 'John', activeChip: 'bg-forest text-cream border-forest', dot: 'bg-forest' },
];

const RESPONSE_GLYPH = { yes: '✓', maybe: '~', no: '✗' };
const RESPONSE_TONE = {
  yes: 'bg-forest text-cream border-forest',
  maybe: 'bg-butter text-wine border-butter',
  no: 'bg-ash-soft text-ash border-ash/40',
  none: 'bg-transparent text-wine/40 border-wine/15',
};

function formatLong(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatShortDow(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long' });
}

function nextNSundays(n, fromDate = new Date()) {
  const out = [];
  const d = new Date(fromDate);
  d.setHours(12, 0, 0, 0);
  // advance to next Sunday (0 = Sun)
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
  // if it's today before noon, still include; otherwise start with next
  if (d.getTime() <= fromDate.getTime() - 1) d.setDate(d.getDate() + 7);
  for (let i = 0; i < n; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 7);
  }
  return out;
}

export default function DatePoll({ eventId }) {
  const [event, setEvent] = useState(null);
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMember, setActiveMember] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchAll(); }, [eventId]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('abc_member');
    if (stored) setActiveMember(stored);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeMember) localStorage.setItem('abc_member', activeMember);
  }, [activeMember]);

  async function fetchAll() {
    setLoading(true);
    const { data: ev } = await supabase
      .from('abc_events').select('*').eq('id', eventId).single();
    setEvent(ev);

    let { data: p } = await supabase
      .from('abc_date_polls').select('*').eq('event_id', eventId)
      .order('created_at', { ascending: false }).limit(1).single();
    if (!p) {
      // auto-create the open poll
      const { data: created } = await supabase
        .from('abc_date_polls').insert({ event_id: eventId }).select().single();
      p = created;
    }
    setPoll(p);

    if (p) {
      const [optRes, respRes] = await Promise.all([
        supabase.from('abc_date_poll_options').select('*').eq('poll_id', p.id).order('proposed_date'),
        supabase.from('abc_date_poll_responses').select('*'),
      ]);
      const optList = optRes.data || [];
      const optIds = new Set(optList.map((o) => o.id));
      setOptions(optList);
      setResponses((respRes.data || []).filter((r) => optIds.has(r.option_id)));
    }
    setLoading(false);
  }

  async function addOption(date, time, member) {
    if (!poll || !date) return;
    setBusy(true);
    setError('');
    const { error: err } = await supabase.from('abc_date_poll_options').insert({
      poll_id: poll.id,
      proposed_date: date,
      proposed_time: time || null,
      proposed_by: member || null,
    });
    setBusy(false);
    if (err) { setError(err.message); return; }
    await fetchAll();
  }

  async function setResponse(optionId, member, response) {
    if (!member) { setError('Pick who you are first.'); return; }
    setBusy(true);
    const existing = responses.find((r) => r.option_id === optionId && r.member === member);
    if (existing && existing.response === response) {
      // toggle off
      await supabase.from('abc_date_poll_responses').delete().eq('id', existing.id);
    } else if (existing) {
      await supabase.from('abc_date_poll_responses').update({ response }).eq('id', existing.id);
    } else {
      await supabase.from('abc_date_poll_responses').insert({
        option_id: optionId, member, response,
      });
    }
    setBusy(false);
    await fetchAll();
  }

  async function lockDate(option) {
    if (!confirm(`Lock ${formatLong(option.proposed_date)} as the official date?`)) return;
    setBusy(true);
    await supabase.from('abc_events').update({
      event_date: option.proposed_date,
      status: 'planning',
    }).eq('id', eventId);
    await supabase.from('abc_date_polls').update({
      status: 'decided',
      decided_option_id: option.id,
    }).eq('id', poll.id);
    setBusy(false);
    await fetchAll();
  }

  async function deleteOption(optionId) {
    if (!confirm('Remove this date option?')) return;
    await supabase.from('abc_date_poll_options').delete().eq('id', optionId);
    await fetchAll();
  }

  // build responses-by-option lookup
  const byOption = useMemo(() => {
    const m = {};
    for (const r of responses) {
      if (!m[r.option_id]) m[r.option_id] = {};
      m[r.option_id][r.member] = r.response;
    }
    return m;
  }, [responses]);

  // ranking: count yes, then maybe, deduct no
  const ranked = useMemo(() => {
    return [...options].map((o) => {
      const r = byOption[o.id] || {};
      const yes = MEMBERS.filter((m) => r[m.id] === 'yes').length;
      const maybe = MEMBERS.filter((m) => r[m.id] === 'maybe').length;
      const no = MEMBERS.filter((m) => r[m.id] === 'no').length;
      return { ...o, score: yes * 2 + maybe - no * 3, yes, maybe, no };
    }).sort((a, b) => b.score - a.score || a.proposed_date.localeCompare(b.proposed_date));
  }, [options, byOption]);

  const top = ranked[0];
  const allYes = top && top.yes === MEMBERS.length;

  const editionLabel = event ? String(event.edition_number).padStart(2, '0') : '—';

  return (
    <main className="min-h-screen pb-32 max-w-5xl mx-auto px-6 sm:px-10 pt-8">
      {/* HEADER */}
      <header className="flex items-start justify-between border-b border-wine pb-3.5">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <PinkyMark size={42} className="text-wine" />
          <div>
            <div className="font-display italic font-light text-[18px] leading-none tracking-tight">A.B.C.</div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-wine/55 mt-1">Vol. I · New Toronto</div>
          </div>
        </Link>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-[0.22em] text-pinky-bright">Date poll</div>
          <div className="font-display italic font-light text-[14px] mt-1 tracking-tight">
            Brunch № {editionLabel}
          </div>
        </div>
      </header>

      {/* TITLE + ACTIVE MEMBER */}
      <section className="mt-8 mb-8">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl sm:text-[44px] font-medium tracking-tight text-wine">
              When shall we meet<span className="text-pinky-bright">?</span>
            </h1>
            <p className="text-[13px] text-wine/65 mt-2 max-w-md leading-[1.55]">
              Each member marks themselves yes, maybe, or no on each option. We triangulate. Sundays default, since Brad teaches Saturdays.
            </p>
          </div>
        </div>

        {/* WHO ARE YOU */}
        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] uppercase tracking-[0.22em] text-wine/55">You are</span>
          <div className="flex items-center gap-2">
            {MEMBERS.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMember(m.id)}
                className={`px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] border rounded-full transition-colors ${
                  activeMember === m.id
                    ? m.activeChip
                    : 'bg-transparent text-wine/65 border-wine/15 hover:border-wine/35'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {activeMember && (
            <button
              onClick={() => setActiveMember(null)}
              className="text-[10px] uppercase tracking-[0.18em] text-wine/40 hover:text-wine"
            >
              Switch
            </button>
          )}
        </div>
      </section>

      {/* TOP CANDIDATE BANNER */}
      {top && top.yes >= 2 && (
        <div className={`mb-6 border rounded-sm px-5 py-4 flex items-center justify-between gap-4 flex-wrap ${
          allYes ? 'border-forest bg-forest-soft/30' : 'border-butter bg-butter/10'
        }`}>
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-wine/55">
              {allYes ? 'Three pinkies up' : 'Leading candidate'}
            </div>
            <div className="font-display italic font-light text-xl sm:text-2xl tracking-tight mt-0.5">
              {formatLong(top.proposed_date)}
              {top.proposed_time ? ` · ${top.proposed_time}` : ''}
            </div>
          </div>
          {poll?.status !== 'decided' && (
            <button
              onClick={() => lockDate(top)}
              disabled={busy}
              className="bg-wine text-cream px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] rounded-sm hover:bg-wine-soft disabled:opacity-40"
            >
              Lock this date
            </button>
          )}
        </div>
      )}

      {/* OPTIONS */}
      <section className="border-t border-wine">
        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-wine/5 rounded-sm animate-pulse" />)}
          </div>
        ) : ranked.length === 0 ? (
          <div className="border-x border-b border-wine/15 p-10 text-center">
            <p className="font-display italic text-wine/60 text-lg">
              No dates proposed yet.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 text-[11px] uppercase tracking-[0.18em] text-pinky-bright hover:text-wine"
            >
              + Propose Sundays
            </button>
          </div>
        ) : (
          <ul>
            {ranked.map((opt, idx) => (
              <OptionRow
                key={opt.id}
                opt={opt}
                idx={idx}
                isLocked={poll?.decided_option_id === opt.id}
                responseFor={byOption[opt.id] || {}}
                activeMember={activeMember}
                onResponse={(member, response) => setResponse(opt.id, member, response)}
                onLock={() => lockDate(opt)}
                onDelete={() => deleteOption(opt.id)}
                pollStatus={poll?.status}
              />
            ))}
          </ul>
        )}
      </section>

      {/* ADD DATE */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={() => setShowAdd(true)}
          className="text-[11px] uppercase tracking-[0.18em] text-pinky-bright hover:text-wine"
        >
          + Propose another date
        </button>
        {options.length === 0 && (
          <button
            onClick={async () => {
              const sundays = nextNSundays(4, new Date('2026-04-26'));
              for (const s of sundays) {
                await supabase.from('abc_date_poll_options').insert({
                  poll_id: poll.id, proposed_date: s, proposed_time: '11:00 AM',
                });
              }
              await fetchAll();
            }}
            className="text-[11px] uppercase tracking-[0.18em] text-butter hover:text-wine"
          >
            ✨ Auto-propose 4 Sundays
          </button>
        )}
      </div>

      {error && <p className="text-[12px] text-pinky-bright italic mt-3">{error}</p>}

      {showAdd && (
        <ProposeDateModal
          activeMember={activeMember}
          onClose={() => setShowAdd(false)}
          onAdd={async (date, time) => { await addOption(date, time, activeMember); setShowAdd(false); }}
        />
      )}

      <Link href="/" className="inline-block mt-12 text-[11px] uppercase tracking-[0.18em] text-wine/55 hover:text-wine">
        ← Back to the front page
      </Link>
    </main>
  );
}

function OptionRow({ opt, idx, isLocked, responseFor, activeMember, onResponse, onLock, onDelete, pollStatus }) {
  return (
    <li
      className={`grid items-center gap-x-4 py-4 sm:py-5 border-b border-wine/15 transition-colors ${
        isLocked ? 'bg-forest-soft/20' : ''
      }`}
      style={{ gridTemplateColumns: '36px 1fr auto' }}
    >
      {/* numeral */}
      <div className="font-display italic font-light text-2xl sm:text-[28px] text-wine/35 leading-none tracking-tight">
        {String(idx + 1).padStart(2, '0')}
      </div>

      {/* date */}
      <div className="min-w-0">
        <div className="font-display text-lg sm:text-[22px] font-medium text-wine tracking-tight">
          {formatLong(opt.proposed_date)}
          {opt.proposed_time && (
            <span className="text-wine/55 font-light italic ml-2">· {opt.proposed_time}</span>
          )}
          {isLocked && (
            <span className="ml-3 text-[9px] uppercase tracking-[0.22em] text-forest border border-forest/40 rounded-full px-2 py-0.5">
              Locked
            </span>
          )}
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-wine/45 mt-1">
          {formatShortDow(opt.proposed_date)}
          <span className="text-wine/25 mx-1.5">·</span>
          <span>
            {opt.yes} yes · {opt.maybe} maybe · {opt.no} no
          </span>
        </div>
      </div>

      {/* member chips */}
      <div className="flex items-center gap-1.5 shrink-0">
        {MEMBERS.map((m) => {
          const r = responseFor[m.id] || 'none';
          const isYou = activeMember === m.id;
          return (
            <MemberChip
              key={m.id}
              member={m}
              response={r}
              isYou={isYou}
              onClick={(next) => onResponse(m.id, next)}
              disabled={!isYou && !!activeMember}
            />
          );
        })}
        {!isLocked && pollStatus !== 'decided' && (
          <button
            onClick={onDelete}
            aria-label="Remove option"
            className="ml-2 text-wine/25 hover:text-pinky-bright text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>
    </li>
  );
}

function MemberChip({ member, response, isYou, onClick, disabled }) {
  const [open, setOpen] = useState(false);
  const tone = RESPONSE_TONE[response] || RESPONSE_TONE.none;
  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`relative w-9 h-9 rounded-full border text-[11px] font-medium tracking-tight transition-colors ${tone} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-85'
        }`}
        title={`${member.label}: ${response === 'none' ? 'no response' : response}`}
      >
        <span className="absolute inset-0 flex items-center justify-center">
          {response === 'none' ? member.label[0] : RESPONSE_GLYPH[response]}
        </span>
        {isYou && (
          <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${member.dot} border border-cream`} />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-cream border border-wine/15 rounded-sm shadow-md py-1 min-w-[120px]">
            {['yes', 'maybe', 'no'].map((r) => (
              <button
                key={r}
                onClick={() => { onClick(r); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-[11px] uppercase tracking-[0.16em] hover:bg-pinky-soft/50 ${
                  r === response ? 'text-wine font-semibold' : 'text-wine/70'
                }`}
              >
                {RESPONSE_GLYPH[r]}  {r}
              </button>
            ))}
            {response !== 'none' && (
              <button
                onClick={() => { onClick(response); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ash hover:bg-ash-soft/50"
              >
                clear
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ProposeDateModal({ activeMember, onClose, onAdd }) {
  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('11:00 AM');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    await onAdd(date, time);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-wine/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-cream border-t sm:border border-wine/15 sm:rounded-sm p-7 sm:p-9 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-7">
          <h3 className="font-display text-2xl text-wine tracking-tight">Propose a date</h3>
          <button type="button" onClick={onClose} className="text-wine/40 hover:text-wine text-2xl leading-none">×</button>
        </div>
        <div className="space-y-5">
          <label className="block">
            <div className="text-[10px] uppercase tracking-[0.22em] text-wine/55 mb-2">Date</div>
            <input
              type="date" required value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-cream-deep/50 border border-wine/15 rounded-sm px-3.5 py-2.5 text-wine text-sm outline-none"
            />
          </label>
          <label className="block">
            <div className="text-[10px] uppercase tracking-[0.22em] text-wine/55 mb-2">Time (optional)</div>
            <input
              type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="11:00 AM"
              className="w-full bg-cream-deep/50 border border-wine/15 rounded-sm px-3.5 py-2.5 text-wine text-sm outline-none"
            />
          </label>
          {!activeMember && (
            <p className="text-[11px] italic text-wine/55">
              Pick who you are on the previous screen if you want this proposal attributed.
            </p>
          )}
        </div>
        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="text-[11px] uppercase tracking-[0.18em] text-wine/50 hover:text-wine">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="bg-wine text-cream px-6 py-2.5 text-[11px] uppercase tracking-[0.18em] rounded-sm hover:bg-wine-soft disabled:opacity-40">
            {saving ? 'Proposing…' : 'Add'}
          </button>
        </div>
      </form>
    </div>
  );
}
