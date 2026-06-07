import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0b1220',
          color: '#c9a24a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontFamily: 'serif',
          fontWeight: 600,
        }}
      >
        A
      </div>
    ),
    { ...size },
  );
}
