import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'AI Brunch Club — How it works';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Og() {
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
            <span style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#3F5A3A', fontWeight: 600 }}>
              How it works
            </span>
            <span style={{ fontStyle: 'italic', fontSize: 17, color: 'rgba(58,22,34,0.7)', marginTop: 4 }}>
              A short tour
            </span>
          </div>
        </div>

        {/* HERO */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 42, flex: 1, justifyContent: 'center' }}>
          <span style={{
            fontSize: 80, fontWeight: 500, lineHeight: 1.0, letterSpacing: -2, maxWidth: 1000,
          }}>
            A small editorial brunch club
          </span>
          <span style={{
            fontSize: 80, fontWeight: 500, lineHeight: 1.0, letterSpacing: -2, marginTop: 6,
          }}>
            needs editorial tools<span style={{ color: '#F47A86' }}>.</span>
          </span>
          <span style={{
            fontSize: 22, fontStyle: 'italic',
            color: 'rgba(58,22,34,0.75)', lineHeight: 1.45,
            marginTop: 26, maxWidth: 920,
          }}>
            Composed dossiers. A date ledger. Printed seed cards. A WhatsApp loop. Built on Claude.
          </span>
        </div>

        {/* FOOTER */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          paddingTop: 22, borderTop: '1px solid rgba(58,22,34,0.2)',
        }}>
          <span style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(58,22,34,0.6)' }}>
            Vol. I · New Toronto
          </span>
          <span style={{ fontSize: 17, fontStyle: 'italic', color: 'rgba(58,22,34,0.7)' }}>
            ai-brunch-club.vercel.app/demo
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
