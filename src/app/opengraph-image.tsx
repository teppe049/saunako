import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'サウナ子 | 個室サウナ検索';
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
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(232, 121, 87, 0.15)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(232, 121, 87, 0.1)',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E87957, #D4634A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
            }}
          >
            ♨
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#ffffff',
              display: 'flex',
            }}
          >
            サウナ子
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              color: '#E87957',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            個室サウナ検索
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.7)',
              marginTop: 8,
              display: 'flex',
            }}
          >
            あなたの「整い」を、私が見つける
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #E87957, #D4634A, #E87957)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
