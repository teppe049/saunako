import { NextResponse } from 'next/server';
import { getFacilityAvailability, hasCoubic, AVAILABILITY_REVALIDATE_SEC } from '@/lib/coubic';

/**
 * 施設の本日・明日の空き枠（STORES予約 経由）
 * GET /api/availability/{facilityId}
 *
 * - Coubic未対応施設: 404
 * - 取得失敗: 204（表示側は何も出さない）
 * - CDNで10分キャッシュし、非公式APIへの負荷を抑える
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const facilityId = Number(id);
  if (!Number.isInteger(facilityId) || !hasCoubic(facilityId)) {
    return NextResponse.json({ error: 'not supported' }, { status: 404 });
  }

  const availability = await getFacilityAvailability(facilityId);
  if (!availability) {
    return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'public, s-maxage=120' } });
  }

  return NextResponse.json(availability, {
    headers: {
      'Cache-Control': `public, s-maxage=${AVAILABILITY_REVALIDATE_SEC}, stale-while-revalidate=${AVAILABILITY_REVALIDATE_SEC * 3}`,
    },
  });
}
