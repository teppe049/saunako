import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const alt = 'コラム | サウナ子';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  const avatarData = await readFile(join(process.cwd(), 'public/saunako-avatar.png'));
  const avatarBase64 = `data:image/png;base64,${avatarData.toString('base64')}`;

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
          {/* Avatar */}
          <img
            src={avatarBase64}
            width={120}
            height={120}
            style={{
              borderRadius: '50%',
              border: '4px solid rgba(232, 121, 87, 0.4)',
            }}
          />

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#ffffff',
              display: 'flex',
            }}
          >
            コラム
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
            サウナ子
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
            個室サウナのお役立ち情報をお届け
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
