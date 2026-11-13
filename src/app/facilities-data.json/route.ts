import { getAllFacilities } from '@/lib/facilities';

/**
 * 営業中の全施設を JSON で配る（ビルド時に1回だけ生成する静的ファイル）。
 *
 * サイトは静的書き出しで、サーバーで動く処理を持たない。検索・お気に入り・候補共有など
 * URL のパラメータで中身が変わる画面は、ブラウザがこれを取得して描画する（src/lib/facilitiesClient.ts）。
 */
export const dynamic = 'force-static';

export function GET() {
  return Response.json(getAllFacilities());
}
