import type { BookingMethod, Facility } from '@/lib/types';

const METHOD_LABELS: Record<BookingMethod, string> = {
  web: 'Web',
  phone: '電話',
  line: 'LINE',
  'walk-in': '予約なしで来店',
};

const card = 'bg-surface md:shadow md:rounded-xl md:mt-6 px-4 py-5 md:p-6';
const divider = <div className="h-2 bg-bg md:hidden" />;

function Booking({ booking }: { booking: NonNullable<Facility['booking']> }) {
  const rows: [string, string][] = [];
  if (booking.methods.length > 0) rows.push(['方法', booking.methods.map((m) => METHOD_LABELS[m]).join('・')]);
  if (booking.leadDays) rows.push(['受付開始', `${booking.leadDays}日前から`]);
  if (booking.sameDay != null) rows.push(['当日', booking.sameDay ? '当日もOK' : '前日まで']);
  if (booking.cancelPolicy) rows.push(['キャンセル', booking.cancelPolicy]);
  if (rows.length === 0) return null;

  return (
    <>
      <div className={card}>
        <h2 className="text-text-primary text-base md:text-lg font-semibold mb-3">予約の仕方</h2>
        <dl className="space-y-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex">
              <dt className="w-24 text-text-secondary flex-shrink-0 text-sm">{label}</dt>
              <dd className="text-text-primary text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      {divider}
    </>
  );
}

function FitFor({ fit, notFit }: { fit: string[]; notFit: string[] }) {
  if (fit.length === 0 && notFit.length === 0) return null;
  return (
    <>
      <div className={card}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fit.length > 0 && (
            <div>
              <h2 className="text-text-primary text-base font-semibold mb-2">向いている人</h2>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                {fit.map((t) => (
                  <li key={t}>○ {t}</li>
                ))}
              </ul>
            </div>
          )}
          {notFit.length > 0 && (
            <div>
              <h2 className="text-text-primary text-base font-semibold mb-2">向いていない人</h2>
              <ul className="space-y-1.5 text-sm text-text-secondary">
                {notFit.map((t) => (
                  <li key={t}>△ {t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {divider}
    </>
  );
}

function Visits({ visits }: { visits: NonNullable<Facility['visits']> }) {
  if (visits.length === 0) return null;
  return (
    <>
      <div className={card}>
        <h2 className="text-text-primary text-base md:text-lg font-semibold mb-3">サウナ子が行ってきた</h2>
        <div className="space-y-6">
          {visits.map((v) => (
            <article key={`${v.date}-${v.plan}`}>
              <p className="text-xs text-text-tertiary mb-2">
                {v.date.replace(/-/g, '/')}・{v.plan}・{v.people}人で¥{v.paid.toLocaleString()}
              </p>
              <p className="text-sm text-text-secondary leading-[1.8] whitespace-pre-line">{v.body}</p>
              {(v.good.length > 0 || v.concerns.length > 0) && (
                <ul className="mt-3 space-y-1 text-sm text-text-secondary">
                  {v.good.map((t) => (
                    <li key={`g-${t}`}>○ {t}</li>
                  ))}
                  {v.concerns.map((t) => (
                    <li key={`c-${t}`}>△ {t}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
      {divider}
    </>
  );
}

/**
 * 施設名で検索した人が公式サイトの次に読むページにするための追加情報（予約・向き不向き・実訪レポ）。
 * データがある項目だけ出す。データ未整備の施設では何も描画しない。
 */
export default function FacilityGuide({ facility }: { facility: Facility }) {
  return (
    <>
      {facility.visits && <Visits visits={facility.visits} />}
      <FitFor fit={facility.fitFor ?? []} notFit={facility.notFitFor ?? []} />
      {facility.booking && <Booking booking={facility.booking} />}
    </>
  );
}
