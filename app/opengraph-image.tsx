import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#0b1220',
          color: '#f6f7f8',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 28,
            opacity: 0.6,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          APP Consulting
        </div>
        <div>
          <div style={{ fontSize: 80, lineHeight: 1.05 }}>Your Vision.</div>
          <div style={{ fontSize: 80, lineHeight: 1.05, color: '#c9a24a' }}>
            Our Mission.
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.6 }}>
          Ex-Big4 advisors · Ho Chi Minh City
        </div>
      </div>
    ),
    { ...size },
  );
}
