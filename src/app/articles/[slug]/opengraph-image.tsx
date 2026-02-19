import { ImageResponse } from 'next/og';
import { getAllSlugs } from '@/lib/articles';
import { getAllArticles } from '@/lib/articles';
import { ARTICLE_CATEGORIES } from '@/lib/types';

export const alt = '記事 | サウナ子';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articles = getAllArticles();
  const meta = articles.find((a) => a.slug === slug);

  if (!meta) {
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
          記事が見つかりません
        </div>
      ),
      { ...size }
    );
  }

  const categoryLabel = ARTICLE_CATEGORIES.find((c) => c.slug === meta.category)?.label || meta.category;

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

        {/* Decorative circle */}
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

        {/* Brand */}
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
          <div style={{ fontSize: 22, fontWeight: 700, color: '#E8725C', display: 'flex' }}>
            サウナ子
          </div>
        </div>

        {/* Main content */}
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
          {/* Category badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                background: '#E8725C',
                color: '#ffffff',
                fontSize: 18,
                fontWeight: 600,
                padding: '6px 16px',
                borderRadius: 20,
                display: 'flex',
              }}
            >
              {categoryLabel}
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: meta.title.length > 30 ? 38 : 46,
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.3,
              display: 'flex',
            }}
          >
            {meta.title}
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '0 56px 40px 56px',
          }}
        >
          <div style={{ fontSize: 20, color: '#888888', display: 'flex' }}>
            {meta.readingTime}分で読める
          </div>
          <div style={{ fontSize: 18, color: '#aaaaaa', display: 'flex' }}>
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
