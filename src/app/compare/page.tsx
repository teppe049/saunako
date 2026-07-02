import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { getFacilityById } from '@/lib/facilities';
import { getPerPersonPrice, isFacilityClosed } from '@/lib/facility-utils';
import type { Facility } from '@/lib/types';

export const metadata: Metadata = {
  title: '個室サウナを比較',
  description: '気になる個室サウナを最大4件まで並べて、料金・設備・アクセスを比較できます。',
  robots: { index: false, follow: true },
};

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>;
}

// 比較テーブルの視認性を保てる上限
const MAX_COMPARE = 4;

function BoolCell({ value, note }: { value: boolean; note?: string | null }) {
  if (!value) return <span className="text-text-tertiary">—</span>;
  return (
    <span className="text-primary font-bold">
      ○{note ? <span className="ml-1 text-xs font-normal text-text-secondary">({note})</span> : null}
    </span>
  );
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const ids = (params.ids || '')
    .split(',')
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0);
  const uniqueIds = [...new Set(ids)].slice(0, MAX_COMPARE);

  const facilities = uniqueIds
    .map((id) => getFacilityById(id))
    .filter((f): f is Facility => !!f && !isFacilityClosed(f));

  if (facilities.length === 0) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="text-4xl mb-4">🧖</div>
          <h1 className="text-lg font-bold text-text-primary mb-2">比較する施設がありません</h1>
          <p className="text-sm text-text-secondary mb-6">
            検索結果の「＋比較」ボタンで気になる施設を追加してね（最大{MAX_COMPARE}件）
          </p>
          <Link href="/search" className="btn-primary inline-block">
            個室サウナを探す
          </Link>
        </main>
      </div>
    );
  }

  const rows: { label: string; render: (f: Facility) => React.ReactNode }[] = [
    {
      label: '料金',
      render: (f) =>
        f.priceMin > 0 ? (
          <span className="font-bold text-primary">
            ¥{f.priceMin.toLocaleString()}
            <span className="text-xs font-normal text-text-tertiary">〜 / 1時間</span>
          </span>
        ) : (
          <span className="text-text-tertiary text-xs">要問合せ</span>
        ),
    },
    {
      label: '1人あたり',
      render: (f) => {
        const perPerson = getPerPersonPrice(f);
        return perPerson != null ? (
          <span className="font-medium">¥{perPerson.toLocaleString()}〜</span>
        ) : (
          <span className="text-text-tertiary">—</span>
        );
      },
    },
    { label: '最大人数', render: (f) => `${f.capacity}名` },
    {
      label: '水風呂',
      render: (f) => <BoolCell value={f.features.waterBath} note={f.features.waterBathTemp ? `${f.features.waterBathTemp}℃` : null} />,
    },
    { label: 'セルフロウリュ', render: (f) => <BoolCell value={f.features.selfLoyly} /> },
    { label: '外気浴', render: (f) => <BoolCell value={f.features.outdoorAir} /> },
    { label: '男女OK', render: (f) => <BoolCell value={f.features.coupleOk} /> },
    {
      label: '最寄駅',
      render: (f) =>
        f.nearestStation && (f.walkMinutes ?? 0) > 0
          ? `${f.nearestStation}${f.nearestStation.includes('駅') ? '' : '駅'} 徒歩${f.walkMinutes}分`
          : <span className="text-text-tertiary">—</span>,
    },
    { label: 'エリア', render: (f) => `${f.prefectureLabel} ${f.area}` },
    {
      label: '営業時間',
      render: (f) => (f.businessHours && f.businessHours !== '不明' ? f.businessHours : <span className="text-text-tertiary">—</span>),
    },
    {
      label: '定休日',
      render: (f) => (f.holidays && f.holidays !== '不明' ? f.holidays : <span className="text-text-tertiary">—</span>),
    },
    {
      label: '予約',
      render: (f) =>
        f.bookingUrl || f.website ? (
          <a
            href={`/go/${f.id}?dest=booking`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
            data-track-click="compare_reservation"
          >
            {f.bookingUrl ? '予約ページへ' : '公式サイトへ'}
          </a>
        ) : (
          <span className="text-text-tertiary text-xs">情報なし</span>
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-1">個室サウナを比較</h1>
        <p className="text-sm text-text-secondary mb-5">
          {facilities.length}件を比較中。このページのURLを送れば、そのまま相手と共有できるよ
        </p>

        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm border-collapse min-w-[560px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-surface w-24 md:w-32 p-3 border-b border-border" />
                {facilities.map((f) => (
                  <th key={f.id} className="p-3 border-b border-border align-top min-w-[140px]">
                    <Link href={`/facilities/${f.id}`} className="block group">
                      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 mb-2">
                        {f.images[0] && (
                          <Image
                            src={f.images[0]}
                            alt={f.name}
                            fill
                            sizes="(max-width: 768px) 40vw, 220px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                      <span className="font-bold text-text-primary text-[13px] leading-snug group-hover:text-primary transition-colors">
                        {f.name}
                      </span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border/60 last:border-b-0">
                  <th className="sticky left-0 z-10 bg-surface p-3 text-left text-xs font-medium text-text-secondary align-top whitespace-nowrap">
                    {row.label}
                  </th>
                  {facilities.map((f) => (
                    <td key={f.id} className="p-3 align-top text-text-primary">
                      {row.render(f)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Link
            href="/search"
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors text-center"
          >
            検索に戻って施設を追加する
          </Link>
        </div>
      </main>
    </div>
  );
}
