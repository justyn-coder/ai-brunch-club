'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PinkyMark from './PinkyMark';

const SEEDABLE_STATUSES = ['confirmed', 'maybe', 'invited'];

function formatLongDate(d) {
  if (!d) return null;
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function EditionCards({ eventId }) {
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, [eventId]);

  async function fetchAll() {
    setLoading(true);
    const [eRes, gRes] = await Promise.all([
      supabase.from('abc_events').select('*').eq('id', eventId).single(),
      supabase.from('abc_guests').select('*').eq('event_id', eventId).order('invited_at', { ascending: true }),
    ]);
    setEvent(eRes.data);
    setGuests(gRes.data || []);
    setLoading(false);
  }

  async function generateForGuest(guest) {
    setGeneratingId(guest.id);
    setError('');
    try {
      const res = await fetch('/api/seed-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guest.name,
          linkedin_url: guest.linkedin_url || '',
          dossier: guest.dossier || '',
          notes: guest.notes || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed.');
      const { error: err } = await supabase
        .from('abc_guests')
        .update({
          seed_questions: data.questions,
          seed_questions_generated_at: new Date().toISOString(),
        })
        .eq('id', guest.id);
      if (err) throw new Error(err.message);
      await fetchAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setGeneratingId(null);
    }
  }

  async function generateAll() {
    setGeneratingAll(true);
    const targets = guests.filter((g) => SEEDABLE_STATUSES.includes(g.status));
    for (const g of targets) {
      await generateForGuest(g);
    }
    setGeneratingAll(false);
  }

  const seedableGuests = guests.filter((g) => SEEDABLE_STATUSES.includes(g.status));
  const editionLabel = event ? String(event.edition_number).padStart(2, '0') : '—';

  return (
    <main className="min-h-screen pb-32 max-w-5xl mx-auto px-6 sm:px-10 pt-8">
      {/* HEADER (screen only) */}
      <header className="flex items-start justify-between border-b border-wine pb-3.5 print:hidden">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <PinkyMark size={42} className="text-wine" />
          <div>
            <div className="font-display italic font-light text-[18px] leading-none tracking-tight">A.B.C.</div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-wine/55 mt-1">Vol. I · New Toronto</div>
          </div>
        </Link>
        <div className="text-right">
          <div className="text-[9px] uppercase tracking-[0.22em] text-forest">Pre-brunch missive</div>
          <div className="font-display italic font-light text-[14px] mt-1 tracking-tight">
            Brunch № {editionLabel}
          </div>
        </div>
      </header>

      {/* COMMAND BAR (screen only) */}
      <section className="mt-8 mb-10 print:hidden">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl sm:text-[44px] font-medium tracking-tight text-wine">
              Seed cards<span className="text-butter">.</span>
            </h1>
            <p className="text-[13px] text-wine/65 mt-2 max-w-md leading-[1.55]">
              Three sharp openers per guest, set on a small card. Print, fold, place beside the cutlery.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={generateAll}
              disabled={generatingAll || seedableGuests.length === 0}
              className="text-[11px] uppercase tracking-[0.18em] text-pinky-bright hover:text-wine disabled:opacity-40"
            >
              {generatingAll ? 'Composing…' : '+ Compose all'}
            </button>
            <button
              onClick={() => window.print()}
              className="bg-wine text-cream px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] rounded-sm hover:bg-wine-soft"
            >
              Print
            </button>
          </div>
        </div>
        {error && (
          <p className="text-[12px] text-pinky-bright italic mt-4">{error}</p>
        )}
      </section>

      {/* CARDS */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-48 bg-wine/5 rounded-sm animate-pulse" />)}
        </div>
      ) : seedableGuests.length === 0 ? (
        <div className="border border-dashed border-wine/20 rounded-sm p-12 text-center">
          <p className="font-display italic text-wine/60 text-lg">
            No guests on the roster yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:gap-3">
          {seedableGuests.map((g) => (
            <SeedCard
              key={g.id}
              guest={g}
              edition={editionLabel}
              dateLine={event?.event_date ? formatLongDate(event.event_date) : 'Date to be sworn'}
              onGenerate={() => generateForGuest(g)}
              generating={generatingId === g.id}
            />
          ))}
        </div>
      )}

      <style jsx global>{`
        @media print {
          html, body { background: #fff !important; }
          body::before, body::after { display: none !important; }
          @page { size: letter; margin: 0.5in; }
        }
      `}</style>
    </main>
  );
}

function SeedCard({ guest, edition, dateLine, onGenerate, generating }) {
  const questions = Array.isArray(guest.seed_questions) ? guest.seed_questions : [];
  const hasQs = questions.length === 3;

  return (
    <article
      className="border border-wine/20 rounded-sm bg-cream relative break-inside-avoid"
      style={{ aspectRatio: '5 / 7' }}
    >
      <div className="h-full p-6 sm:p-7 flex flex-col">
        {/* TOP MARGIN — masthead */}
        <header className="flex items-baseline justify-between border-b border-wine/30 pb-2.5">
          <div className="font-display italic font-light text-[14px] tracking-tight">
            A.B.C.
          </div>
          <div className="text-[8px] uppercase tracking-[0.24em] text-wine/55">
            № {edition}
          </div>
        </header>

        {/* GUEST NAME */}
        <div className="mt-5">
          <div className="text-[8px] uppercase tracking-[0.24em] text-forest mb-1.5">Guest of honour</div>
          <div className="font-display font-medium text-wine leading-[1.05] tracking-tight"
               style={{ fontSize: 'clamp(22px, 4vw, 30px)' }}>
            {guest.name}
          </div>
        </div>

        {/* QUESTIONS or PROMPT */}
        <div className="mt-5 flex-1 min-h-0 overflow-hidden">
          {hasQs ? (
            <ol className="space-y-3.5">
              {questions.map((q, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-display italic font-light text-butter text-lg leading-none shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <span className="font-display italic font-light text-[14px] text-wine/85 leading-[1.5]">
                    {q}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="border border-dashed border-wine/15 rounded-sm h-full flex items-center justify-center p-4">
              <button
                onClick={onGenerate}
                disabled={generating}
                className="text-[11px] uppercase tracking-[0.18em] text-pinky-bright hover:text-wine disabled:opacity-40"
              >
                {generating ? 'Composing…' : '+ Compose three'}
              </button>
            </div>
          )}
        </div>

        {/* FOOTER — date */}
        <footer className="border-t border-wine/30 pt-2.5 mt-4">
          <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.24em] text-wine/55">
            <span>Pinky Swear · New Toronto</span>
            <span className="font-display italic normal-case tracking-normal text-[11px] text-wine/65">
              {dateLine}
            </span>
          </div>
        </footer>
      </div>
    </article>
  );
}
