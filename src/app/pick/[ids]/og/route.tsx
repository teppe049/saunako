import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { getFacilityById } from '@/lib/facilities';
import { isFacilityClosed } from '@/lib/facility-utils';
import { parsePickIds, getPickAreaLabel } from '@/lib/pick';
import type { Facility } from '@/lib/types';

/**
 * /pick/[ids] の OG 画像。メッセージアプリのプレビューで「写真つきの候補が届いた」と一目で分かるのが目的。
 *
 * opengraph-image.tsx の規約を使わないのは、robots.ts が `/*\/opengraph-image` を Disallow していて
 * メッセージアプリのクローラに弾かれ得るため。Route Handler なら任意パスで返せる。
 */

const SIZE = { width: 1200, height: 630 };

async function readPublicAsBase64(relPath: string, mime: string): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), 'public', relPath));
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

// 施設写真は全て webp だが、Next 同梱の @vercel/og は webp をデコードできない（"u2 is not iterable" で落ちる）ため
// リクエスト時に JPEG へ変換して埋め込む。1列あたりの表示幅に合わせて縮小し、生成時間とレスポンスサイズを抑える
const PHOTO_WIDTH = 600;
const PHOTO_HEIGHT = 520;

async function facilityPhotoAsJpeg(image: string): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), 'public', image.replace(/^\//, '')));
    const jpeg = await sharp(buf).resize({ width: PHOTO_WIDTH, height: PHOTO_HEIGHT, fit: 'cover' }).jpeg({ quality: 78 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch {
    return null;
  }
}

function price(f: Facility): string {
  if (f.priceMin <= 0) return '料金は要問合せ';
  return `¥${f.priceMin.toLocaleString()} / ${f.duration > 0 ? `${f.duration}分` : '宿泊'}`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ ids: string }> }) {
  const { ids } = await params;
  const facilities = parsePickIds(ids)
    .map((id) => getFacilityById(id))
    .filter((f): f is Facility => !!f && !isFacilityClosed(f));

  if (facilities.length === 0) {
    const fallback = await readFile(join(process.cwd(), 'public/og-image.png'));
    return new Response(new Uint8Array(fallback), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' } });
  }

  const [avatar, ...photos] = await Promise.all([
    readPublicAsBase64('saunako-avatar.png', 'image/png'),
    ...facilities.map((f) => (f.images[0] ? facilityPhotoAsJpeg(f.images[0]) : Promise.resolve(null))),
  ]);

  const area = getPickAreaLabel(facilities);
  const where = area ? (area.area ?? area.prefectureLabel) : '全国';
  const allCouple = facilities.every((f) => f.features.coupleOk);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          fontFamily: 'sans-serif',
          color: '#1A1A1A',
        }}
      >
        <div style={{ flex: 1, display: 'flex', gap: 8, padding: '8px 8px 0' }}>
          {facilities.map((f, idx) => (
            <div
              key={f.id}
              style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                borderRadius: 16,
                overflow: 'hidden',
                background: '#E5E7EB',
              }}
            >
              {photos[idx] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[idx] as string} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: '#1A1A1A',
                  color: '#FFFFFF',
                  fontSize: 22,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {idx + 1}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '40px 16px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(180deg, rgba(26,26,26,0) 0%, rgba(26,26,26,0.8) 100%)',
                  color: '#FFFFFF',
                }}
              >
                <div style={{ fontSize: facilities.length >= 4 ? 18 : 22, fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {f.name}
                </div>
                <div style={{ fontSize: facilities.length >= 4 ? 15 : 18, opacity: 0.9 }}>{price(f)}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 124, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.2 }}>どれがいい？</div>
            {/* Satori は複数のテキストノードを別子要素として扱うので1文字列にまとめる */}
            <div style={{ fontSize: 20, color: '#4B5563' }}>{`${where}の個室サウナ ${facilities.length}件${allCouple ? '・全部男女OK' : ''}`}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" width={56} height={56} style={{ borderRadius: 28 }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 26, fontWeight: 700 }}>サウナ子</div>
              <div style={{ fontSize: 15, color: '#596066' }}>個室サウナ検索</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
    }
  );
}
