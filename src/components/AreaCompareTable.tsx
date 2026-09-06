import Link from 'next/link';
import type { Facility } from '@/lib/types';
import { getPerPersonPrice } from '@/lib/facility-utils';

interface Props {
  facilities: Facility[];
  areaLabel: string;
  /** 表に出す最大件数。超えた分は下の一覧へ誘導する */
  limit?: number;
}

function station(f: Facility): string {
  if (!f.nearestStation || (f.walkMinutes ?? 0) <= 0) return '—';
  return `${f.nearestStation}${f.nearestStation.includes('駅') ? '' : '駅'} 徒歩${f.walkMinutes}分`;
}

function yen(n: number | null): string {
  return n !== null && n > 0 ? `¥${n.toLocaleString()}` : '—';
}

/**
 * エリア内の施設を料金順に見比べる表（/analytics-pdca 2026-09-06 施策3）。
 *
 * サブエリアページは施設カードの羅列だけで、料金・駅距離・カップル可否を
 * 横並びで比較できなかった。検索から来た人が最初に知りたいのはその3点なので、
 * 一覧より前に置いて「比較できるページ」として滞在してもらう。
 */
export default function AreaCompareTable({ facilities, areaLabel, limit = 6 }: Props) {
  if (facilities.length < 2) return null;

  // 料金順（未設定は末尾）。宿泊など duration=0 の施設は時間あたりで比べられないため後ろに置く。
  const sorted = [...facilities].sort((a, b) => {
    if (a.priceMin <= 0) return 1;
    if (b.priceMin <= 0) return -1;
    if (a.duration <= 0 && b.duration > 0) return 1;
    if (b.duration <= 0 && a.duration > 0) return -1;
    return a.priceMin - b.priceMin;
  });
  const rows = sorted.slice(0, limit);
  const rest = sorted.length - rows.length;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-text-primary mb-4">{areaLabel}の個室サウナを料金で比べる</h2>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-bg text-text-secondary text-xs">
              <th className="text-left font-medium py-2.5 px-3">施設</th>
              <th className="text-right font-medium py-2.5 px-3">室料</th>
              <th className="text-right font-medium py-2.5 px-3">1人あたり</th>
              <th className="text-left font-medium py-2.5 px-3">最寄駅</th>
              <th className="text-center font-medium py-2.5 px-3">水風呂</th>
              <th className="text-center font-medium py-2.5 px-3">外気浴</th>
              <th className="text-center font-medium py-2.5 px-3">男女OK</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.id} className="border-t border-border/60">
                <td className="py-2.5 px-3 font-medium max-w-[200px]">
                  <Link href={`/facilities/${f.id}`} className="text-primary hover:underline block truncate">
                    {f.name}
                  </Link>
                </td>
                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  <span className="font-bold text-text-primary">{yen(f.priceMin)}</span>
                  {f.priceMin > 0 && f.duration > 0 && (
                    <span className="text-xs text-text-tertiary"> / {f.duration}分</span>
                  )}
                  {f.priceMin > 0 && f.duration <= 0 && (
                    <span className="text-xs text-text-tertiary"> / 宿泊プラン</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-right text-text-secondary whitespace-nowrap">{yen(getPerPersonPrice(f))}</td>
                <td className="py-2.5 px-3 text-text-secondary whitespace-nowrap">{station(f)}</td>
                <td className="py-2.5 px-3 text-center text-text-secondary whitespace-nowrap">
                  {f.features.waterBath ? (f.features.waterBathTemp ? `${f.features.waterBathTemp}℃` : '○') : '—'}
                </td>
                <td className="py-2.5 px-3 text-center">{f.features.outdoorAir ? '○' : '—'}</td>
                <td className="py-2.5 px-3 text-center">{f.features.coupleOk ? '○' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rest > 0 && (
        <p className="mt-2 text-sm text-text-secondary">
          <a href="#facility-list" className="text-primary hover:underline">
            下の一覧で{areaLabel}の全{sorted.length}施設を見る
          </a>
        </p>
      )}
    </section>
  );
}
