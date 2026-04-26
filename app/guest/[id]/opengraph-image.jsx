import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const alt = 'AI Brunch Club personal invitation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function fetchData(id) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_KEY,
      { auth: { persistSession: false } }
    );
    const { data: guest } = await supabase
      .from('abc_guests').select('*').eq('id', id).single();
    if (!guest) return null;
    const { data: event } = await supabase
      .from('abc_events').select('*').eq('id', guest.event_id).single();
    return { guest, event };
  } catch {
    return null;
  }
}

function formatLong(d) {
  if (!d) return null;
  return new Date(d + 'T12:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

export default async function Og({ params }) {
  const data = await fetchData(params.id);
  if (!data) {
    return new ImageResponse(
      (
        <div style={{
          width: '100%', height: '100%', display: 'flex',
          background: '#F4EDE0', color: '#3A1622',
          alignItems: 'center', justifyContent: 'center', fontSize: 64,
          fontFamily: 'serif',
        }}>AI Brunch Club</div>
      ),
      { ...size }
    );
  }
  const { guest, event } = data;
  const editionLabel = `№ ${String(event?.edition_number || 1).padStart(2, '0')}`;
  const dateLine = event?.event_date ? formatLong(event.event_date) : 'Date being sworn';
  const dossierTeaser = guest.dossier
    ? guest.dossier.split(/[.!?]\s/).slice(0, 2).join('. ').trim() + (guest.dossier.length > 200 ? '.' : '')
    : null;

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        background: '#F4EDE0', color: '#3A1622',
        padding: '56px 72px', fontFamily: 'serif',
      }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <svg width="44" height="26" viewBox="0 0 100 60" fill="none" stroke="#3A1622" strokeWidth="3" strokeLinecap="round">
              <path d="M 6 18 L 38 18 Q 50 18 50 30 Q 50 42 38 42 L 30 42" />
              <path d="M 94 42 L 62 42 Q 50 42 50 30 Q 50 18 62 18 L 70 18" />
            </svg>
            <span style={{ fontStyle: 'italic', fontSize: 22 }}>A.B.C.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#F47A86', fontWeight: 600 }}>
              Personal invitation
            </span>
            <span style={{ fontStyle: 'italic', fontSize: 17, color: 'rgba(58,22,34,0.7)', marginTop: 4 }}>
              Brunch {editionLabel}
            </span>
          </div>
        </div>

        {/* HERO — guest name */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 38 }}>
          <span style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(58,22,34,0.6)' }}>
            Guest of honour
          </span>
          <span style={{
            fontSize: guest.name.length > 18 ? 84 : 108,
            fontWeight: 500,
            lineHeight: 1.0,
            letterSpacing: -2,
            marginTop: 12,
          }}>
            {guest.name}<span style={{ color: '#F47A86' }}>.</span>
          </span>
          {dossierTeaser && (
            <span style={{
              fontSize: 22, fontStyle: 'italic',
              color: 'rgba(58,22,34,0.75)', lineHeight: 1.5,
              marginTop: 24, maxWidth: 920,
            }}>
              {dossierTeaser.length > 240 ? dossierTeaser.slice(0, 240) + '…' : dossierTeaser}
            </span>
          )}
        </div>

        {/* SPACER */}
        <div style={{ display: 'flex', flex: 1 }} />

        {/* FOOTER */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          paddingTop: 22, borderTop: '1px solid rgba(58,22,34,0.2)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(58,22,34,0.55)' }}>
              The next gathering
            </span>
            <span style={{ fontSize: 26, fontWeight: 500, marginTop: 5, letterSpacing: -0.5 }}>
              {dateLine}
            </span>
            <span style={{ fontSize: 17, fontStyle: 'italic', color: 'rgba(58,22,34,0.7)', marginTop: 2 }}>
              Pinky Swear, New Toronto
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#3F5A3A', fontWeight: 600 }}>
              RSVP via WhatsApp
            </span>
            <span style={{ fontSize: 17, fontStyle: 'italic', color: 'rgba(58,22,34,0.65)', marginTop: 4 }}>
              Tap to swear pinky.
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
