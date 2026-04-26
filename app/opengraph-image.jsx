import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const alt = 'AI Brunch Club';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function fetchData() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_KEY,
      { auth: { persistSession: false } }
    );
    const [eventsRes, guestsRes] = await Promise.all([
      supabase.from('abc_events').select('*').order('edition_number', { ascending: true }),
      supabase.from('abc_guests').select('*'),
    ]);
    return { events: eventsRes.data || [], guests: guestsRes.data || [] };
  } catch {
    return { events: [], guests: [] };
  }
}

function formatLongDate(d) {
  if (!d) return null;
  const date = new Date(d + 'T12:00:00');
  return date.toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default async function OgImage() {
  const { events, guests } = await fetchData();
  const currentEvent = events.find((e) => e.status === 'planning') || events[events.length - 1];
  const eventGuests = currentEvent ? guests.filter((g) => g.event_id === currentEvent.id) : [];
  const confirmed = eventGuests.filter((g) => g.status === 'confirmed').length;
  const pending = eventGuests.filter((g) => g.status === 'invited' || g.status === 'maybe').length;

  const editionLabel = currentEvent
    ? `Brunch No. ${String(currentEvent.edition_number).padStart(2, '0')}`
    : 'Brunch No. 01';
  const dateLabel = currentEvent?.event_date ? formatLongDate(currentEvent.event_date) : 'Date to be sworn';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#F4EDE0',
          padding: '72px 88px',
          fontFamily: 'serif',
          color: '#3A1622',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width="56" height="34" viewBox="0 0 100 60" fill="none" stroke="#3A1622" strokeWidth="3" strokeLinecap="round">
              <path d="M 6 18 L 38 18 Q 50 18 50 30 Q 50 42 38 42 L 30 42" />
              <path d="M 94 42 L 62 42 Q 50 42 50 30 Q 50 18 62 18 L 70 18" />
            </svg>
            <span style={{ fontStyle: 'italic', fontSize: 22 }}>A.B.C.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(58,22,34,0.55)' }}>
              Members
            </span>
            <span style={{ fontStyle: 'italic', fontSize: 18, color: 'rgba(58,22,34,0.65)', marginTop: 4 }}>
              Justyn · Brad · John
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 38, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
            <span style={{ fontSize: 156, fontStyle: 'italic', fontWeight: 300, lineHeight: 0.92, letterSpacing: -6 }}>AI</span>
            <span style={{ fontSize: 156, fontWeight: 500, lineHeight: 0.92, letterSpacing: -6 }}>Brunch Club</span>
            <span style={{ fontSize: 156, color: '#F47A86', fontWeight: 500, lineHeight: 0.92 }}>.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 38 }}>
            <div style={{ width: 64, height: 1, background: 'rgba(58,22,34,0.35)' }} />
            <span style={{ fontStyle: 'italic', fontSize: 28, color: 'rgba(58,22,34,0.75)' }}>
              Founded at Pinky Swear, Etobicoke.
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: 32,
            borderTop: '1px solid rgba(58,22,34,0.18)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(58,22,34,0.5)' }}>
              The next gathering
            </span>
            <span style={{ fontSize: 38, fontWeight: 500, marginTop: 8, letterSpacing: -1 }}>{editionLabel}</span>
            <span style={{ fontSize: 22, fontStyle: 'italic', color: 'rgba(58,22,34,0.7)', marginTop: 4 }}>
              {dateLabel}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(58,22,34,0.5)' }}>
              Pinky sworn
            </span>
            <span style={{ fontSize: 110, color: '#F47A86', fontWeight: 500, lineHeight: 1 }}>
              {String(confirmed).padStart(2, '0')}
            </span>
            {pending > 0 && (
              <span style={{ fontSize: 16, fontStyle: 'italic', color: 'rgba(58,22,34,0.55)', marginTop: 4 }}>
                {pending} awaiting reply
              </span>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
