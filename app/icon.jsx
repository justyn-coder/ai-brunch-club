import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F4EDE0',
          borderRadius: 12,
        }}
      >
        <svg width="48" height="30" viewBox="0 0 100 60" fill="none" stroke="#3A1622" strokeWidth="6" strokeLinecap="round">
          <path d="M 6 18 L 38 18 Q 50 18 50 30 Q 50 42 38 42 L 30 42" />
          <path d="M 94 42 L 62 42 Q 50 42 50 30 Q 50 18 62 18 L 70 18" />
        </svg>
      </div>
    ),
    size
  );
}
