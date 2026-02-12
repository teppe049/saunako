import { ImageResponse } from 'next/og';
import { getFacilityById, getAllIds } from '@/lib/facilities';

export const alt = '施設詳細 | サウナ子';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const ids = getAllIds();
  return ids.map((id) => ({ id: String(id) }));
}

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const facility = getFacilityById(Number(id));

  if (!facility) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            fontFamily: 'sans-serif',
            fontSize: 32,
            color: '#666666',
          }}
        >
          施設が見つかりません
        </div>
      ),
      { ...size }
    );
  }

  const stationText =
    facility.nearestStation && facility.walkMinutes > 0
      ? `${facility.nearestStation}${facility.nearestStation.includes('駅') ? '' : '駅'}から徒歩${facility.walkMinutes}分`
      : null;

  const locationText = [facility.prefectureLabel, facility.area].filter(Boolean).join(' ');

  const priceText =
    facility.priceMin > 0
      ? `¥${facility.priceMin.toLocaleString()}〜 / 1時間`
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, #ffffff 0%, #faf8f6 50%, #f5f0ec 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #E8725C, #D4634A, #E8725C)',
            display: 'flex',
          }}
        />

        {/* Decorative circle top-right */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(232, 114, 92, 0.08)',
            display: 'flex',
          }}
        />

        {/* Decorative circle bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(232, 114, 92, 0.06)',
            display: 'flex',
          }}
        />

        {/* Brand text - top left */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '36px 0 0 56px',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E8725C, #D4634A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#ffffff',
            }}
          >
            ♨
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#E8725C',
              display: 'flex',
            }}
          >
            サウナ子
          </div>
        </div>

        {/* Main content - centered */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            padding: '0 56px',
            gap: 20,
          }}
        >
          {/* Facility name */}
          <div
            style={{
              fontSize: facility.name.length > 20 ? 44 : 52,
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.3,
              display: 'flex',
            }}
          >
            {facility.name}
          </div>

          {/* Location info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {locationText && (
              <div
                style={{
                  fontSize: 26,
                  color: '#666666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#E8725C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    color: '#ffffff',
                  }}
                >
                  📍
                </div>
                {locationText}
              </div>
            )}
            {stationText && (
              <div
                style={{
                  fontSize: 22,
                  color: '#888888',
                  display: 'flex',
                  paddingLeft: 34,
                }}
              >
                {stationText}
              </div>
            )}
          </div>
        </div>

        {/* Bottom section - price */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '0 56px 40px 56px',
          }}
        >
          {priceText ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: '#E8725C',
                  display: 'flex',
                }}
              >
                {`¥${facility.priceMin.toLocaleString()}`}
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: '#888888',
                  display: 'flex',
                }}
              >
                〜 / 1時間
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex' }} />
          )}

          {/* Subdomain / site label */}
          <div
            style={{
              fontSize: 18,
              color: '#aaaaaa',
              display: 'flex',
            }}
          >
            saunako.vercel.app
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(90deg, #E8725C, #D4634A, #E8725C)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
