import Link from 'next/link';
import type { Facility } from '@/lib/types';
import { getPerPersonPrice } from '@/lib/facility-utils';
import { getDistanceKm, formatDistance } from '@/lib/distance';

interface Props {
  current: Facility;
  nearby: Facility[];
}

function station(f: Facility): string {
  if (!f.nearestStation || (f.walkMinutes ?? 0) <= 0) return '—';
  return `${f.nearestStation}${f.nearestStation.includes('駅') ? '' : '駅'} 徒歩${f.walkMinutes}分`;
}

function yen(n: number | null): string {
  return n !== null && n > 0 ? `¥${n.toLocaleString()}` : '—';
}

/**
 * この施設と近くの施設を1つの表で見比べるセクション。
 * 「近くで他にないか」で離脱する人を、サイト内の比較に留める。
 */
export default function NearbyCompareTable({ current, nearby }: Props) {
  if (nearby.length === 0) return null;
  const rows = [current, ...nearby];
  const hasCoords = current.lat !== null && current.lng !== null;

  return (
    <div className="mt-6 md:mt-8">
      <h3 className="text-base md:text-lg font-bold text-text-primary mb-3">近くの施設と比べる</h3>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-bg text-text-secondary text-xs">
              <th className="text-left font-medium py-2.5 px-3">施設</th>
              {hasCoords && <th className="text-right font-medium py-2.5 px-3">距離</th>}
              <th className="text-right font-medium py-2.5 px-3">室料</th>
              <th className="text-right font-medium py-2.5 px-3">1人あたり</th>
              <th className="text-left font-medium py-2.5 px-3">最寄駅</th>
              <th className="text-center font-medium py-2.5 px-3">水風呂</th>
              <th className="text-center font-medium py-2.5 px-3">外気浴</th>
              <th className="text-center font-medium py-2.5 px-3">男女OK</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => {
              const isCurrent = f.id === current.id;
              const dist =
                hasCoords && f.lat !== null && f.lng !== null && !isCurrent
                  ? formatDistance(getDistanceKm(current.lat!, current.lng!, f.lat, f.lng))
                  : null;
              return (
                <tr key={f.id} className={`border-t border-border/60 ${isCurrent ? 'bg-saunako-bg' : ''}`}>
                  <td className="py-2.5 px-3 font-medium text-text-primary max-w-[200px]">
                    {isCurrent ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-saunako bg-saunako/10 px-1.5 py-0.5 rounded flex-shrink-0">この施設</span>
                        <span className="truncate">{f.name}</span>
                      </span>
                    ) : (
                      <Link href={`/facilities/${f.id}`} className="text-primary hover:underline block truncate">
                        {f.name}
                      </Link>
                    )}
                  </td>
                  {hasCoords && (
                    <td className="py-2.5 px-3 text-right text-text-secondary whitespace-nowrap">{isCurrent ? '—' : dist ?? '—'}</td>
                  )}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className="font-bold text-text-primary">{yen(f.priceMin)}</span>
                    {f.priceMin > 0 && <span className="text-xs text-text-tertiary"> / {f.duration}分</span>}
                  </td>
                  <td className="py-2.5 px-3 text-right text-text-secondary whitespace-nowrap">{yen(getPerPersonPrice(f))}</td>
                  <td className="py-2.5 px-3 text-text-secondary whitespace-nowrap">{station(f)}</td>
                  <td className="py-2.5 px-3 text-center text-text-secondary whitespace-nowrap">
                    {f.features.waterBath ? (f.features.waterBathTemp ? `${f.features.waterBathTemp}℃` : '○') : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center">{f.features.outdoorAir ? '○' : '—'}</td>
                  <td className="py-2.5 px-3 text-center">{f.features.coupleOk ? '○' : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
