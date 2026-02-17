import { ImageResponse } from 'next/og';
import { getAllPrefectures, getFacilitiesByArea, getAreaBySlug } from '@/lib/facilities';
import { PREFECTURES, AREA_GROUPS } from '@/lib/types';

export const alt = 'エリア別個室サウナ | サウナ子';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const prefectures = getAllPrefectures();
  const params: { prefecture: string; area: string }[] = [];
  for (const pref of prefectures) {
    const areas = AREA_GROUPS[pref] || [];
    for (const area of areas) {
      params.push({ prefecture: pref, area: area.slug });
    }
  }
  return params;
}

export default async function OGImage({ params }: { params: Promise<{ prefecture: string; area: string }> }) {
  const { prefecture, area: areaSlug } = await params;
  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  const areaData = getAreaBySlug(prefecture, areaSlug);

  if (!prefData || !areaData) {
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
          エリアが見つかりません
        </div>
      ),
      { ...size }
    );
  }

  const facilities = getFacilitiesByArea(prefecture, areaData.label);
  const facilityCount = facilities.length;

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
            gap: 24,
          }}
        >
          {/* Area title */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.3,
              display: 'flex',
            }}
          >
            {`${prefData.label} ${areaData.label}の個室サウナ`}
          </div>

          {/* Facility count badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 20px',
                background: 'rgba(232, 114, 92, 0.12)',
                borderRadius: 24,
                fontSize: 28,
                fontWeight: 600,
                color: '#E8725C',
              }}
            >
              {facilityCount}件の施設
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            padding: '0 56px 40px 56px',
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: '#aaaaaa',
              display: 'flex',
            }}
          >
            saunako.jp
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
