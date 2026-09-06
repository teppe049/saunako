import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PickReplyButton from '@/components/PickReplyButton';
import { getFacilityById, getAreaSlugByLabel } from '@/lib/facilities';
import { getPerPersonPrice, isFacilityClosed } from '@/lib/facility-utils';
import { parsePickIds, sanitizePickMessage, getPickBadges, getPickAreaLabel, buildPickPath } from '@/lib/pick';
import type { Facility } from '@/lib/types';

interface PickPageProps {
  params: Promise<{ ids: string }>;
  searchParams: Promise<{ m?: string | string[] }>;
}

function loadFacilities(segment: string): Facility[] {
  return parsePickIds(segment)
    .map((id) => getFacilityById(id))
    .filter((f): f is Facility => !!f && !isFacilityClosed(f));
}

function stationText(f: Facility): string | null {
  if (!f.nearestStation || (f.walkMinutes ?? 0) <= 0) return null;
  return `${f.nearestStation}${f.nearestStation.includes('駅') ? '' : '駅'}から徒歩${f.walkMinutes}分`;
}

function headline(facilities: Facility[]): string {
  const area = getPickAreaLabel(facilities);
  const where = area ? (area.area ?? area.prefectureLabel) : '';
  return `どれがいい？ ${where}の個室サウナ ${facilities.length}件`;
}

export async function generateMetadata({ params, searchParams }: PickPageProps): Promise<Metadata> {
  const { ids } = await params;
  const { m } = await searchParams;
  const facilities = loadFacilities(ids);
  if (facilities.length === 0) {
    return { title: '候補がありません', robots: { index: false, follow: true } };
  }
  const title = headline(facilities);
  const message = sanitizePickMessage(m);
  const names = facilities.map((f) => f.name).join('／');
  const description = `${message ? `「${message}」` : 'ここ行きたいんだよね。'}${names}。料金・駅からの距離・水風呂で比べて、予約ページまでそのまま進めます。`;
  const ogImage = `${buildPickPath(facilities.map((f) => f.id))}/og`;
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

function FeatureTags({ f }: { f: Facility }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {f.features.waterBath && (
        <span className="tag tag-available">水風呂{f.features.waterBathTemp ? ` ${f.features.waterBathTemp}℃` : ''}</span>
      )}
      {f.features.selfLoyly && <span className="tag bg-gray-100 text-text-secondary">セルフロウリュ</span>}
      {f.features.outdoorAir && <span className="tag bg-primary text-white">外気浴</span>}
      {f.features.coupleOk && <span className="tag bg-warning text-white">男女OK</span>}
    </div>
  );
}

export default async function PickPage({ params, searchParams }: PickPageProps) {
  const { ids } = await params;
  const { m } = await searchParams;
  const facilities = loadFacilities(ids);
  const message = sanitizePickMessage(m);

  if (facilities.length === 0) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-lg font-bold text-text-primary mb-2">候補がありません</h1>
          <p className="text-sm text-text-secondary mb-6">リンクが古いか、施設が閉店した可能性があります</p>
          <Link href="/search" className="btn-primary inline-block">
            個室サウナを探す
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const badges = getPickBadges(facilities);
  const area = getPickAreaLabel(facilities);
  const areaSlug = area?.area ? getAreaSlugByLabel(area.prefecture, area.area) : undefined;
  const areaHref = area ? (areaSlug ? `/area/${area.prefecture}/${areaSlug}` : `/area/${area.prefecture}`) : '/search';
  const areaName = area ? (area.area ?? area.prefectureLabel) : '近く';
  const perPerson = new Map(facilities.map((f) => [f.id, getPerPersonPrice(f)] as const));
  const shortName = (f: Facility) => (f.name.length > 8 ? `${f.name.slice(0, 8)}…` : f.name);

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-3xl mx-auto px-4 pt-5 pb-8 md:py-10">
        {/* 見出し */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="tag tag-primary">候補 {facilities.length}件</span>
            {area && <span className="text-xs text-text-tertiary">{area.prefectureLabel}{area.area ? ` ${area.area}` : ''}</span>}
          </div>
          <h1 className="text-[22px] md:text-2xl font-bold text-text-primary leading-snug">
            ここ行きたいんだよね。<br className="md:hidden" />どれがいい？
          </h1>
          {message && (
            <div className="bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary leading-relaxed flex gap-2 items-start">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <span>{message}</span>
            </div>
          )}
        </div>

        {/* 候補カード */}
        <ol className="flex flex-col gap-3">
          {facilities.map((f, idx) => {
            const pp = perPerson.get(f.id) ?? null;
            const badge =
              badges.cheapestId === f.id
                ? 'いちばん安い'
                : badges.nearestId === f.id
                  ? `${badges.nearestStation}にいちばん近い`
                  : null;
            const station = stationText(f);
            return (
              <li key={f.id} className="card overflow-hidden">
                <Link href={`/facilities/${f.id}`} className="block relative h-44 bg-gray-200" data-track-click="pick_view_facility" data-track-facility={f.id}>
                  {f.images[0] && (
                    <Image src={f.images[0]} alt={f.name} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority={idx === 0} />
                  )}
                  <span className="absolute top-2.5 left-2.5 w-[26px] h-[26px] rounded-full bg-text-primary text-white text-[13px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {badge && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-white text-[11px] font-bold text-[#C7392E]">{badge}</span>
                  )}
                </Link>
                <div className="px-3.5 pt-3 pb-3.5 flex flex-col gap-2">
                  <Link href={`/facilities/${f.id}`} className="text-[17px] font-semibold text-text-primary leading-snug hover:text-primary transition-colors">
                    {f.name}
                  </Link>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    {f.priceMin > 0 ? (
                      <>
                        <span className="text-lg font-bold text-primary">¥{f.priceMin.toLocaleString()}</span>
                        <span className="text-xs text-text-tertiary">
                          / {f.duration > 0 ? `${f.duration}分` : '宿泊'}・{f.capacity}名まで
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-text-tertiary">料金は要問合せ</span>
                    )}
                    {pp !== null && <span className="ml-auto text-xs font-medium text-text-secondary">1人あたり ¥{pp.toLocaleString()}〜</span>}
                  </div>
                  {station && (
                    <p className="text-[13px] text-text-tertiary flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" strokeWidth={2} />
                      </svg>
                      {station}
                    </p>
                  )}
                  <FeatureTags f={f} />
                  {f.saunakoCommentShort && (
                    <div className="saunako-comment flex gap-2 items-start !py-2 !px-3">
                      <Image src="/saunako-avatar.webp" alt="" width={22} height={22} className="w-[22px] h-[22px] rounded-full flex-shrink-0 mt-px" />
                      <p className="text-[13px] text-text-secondary leading-relaxed">{f.saunakoCommentShort}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-0.5">
                    {f.bookingUrl || f.website ? (
                      <a
                        href={`/go/${f.id}?dest=booking`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-11 rounded-lg bg-primary text-white text-sm font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
                        data-track-click="pick_reservation"
                        data-track-facility={f.id}
                      >
                        {f.bookingUrl ? '予約ページへ' : '公式サイトへ'}
                      </a>
                    ) : (
                      <span className="flex-1 h-11 rounded-lg bg-gray-100 text-text-tertiary text-sm flex items-center justify-center">予約情報なし</span>
                    )}
                    <PickReplyButton index={idx + 1} facilityId={f.id} facilityName={f.name} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* 決め手で比べる */}
        {facilities.length >= 2 && (
          <section className="mt-6">
            <h2 className="text-[15px] font-bold text-text-primary mb-2.5">決め手で比べる</h2>
            <div className="card overflow-hidden text-xs">
              <div className="grid" style={{ gridTemplateColumns: `88px repeat(${facilities.length}, minmax(0, 1fr))` }}>
                <div className="px-3 py-2.5 border-b border-border" />
                {facilities.map((f, idx) => (
                  <div key={f.id} className="px-1.5 py-2.5 text-center font-semibold text-text-primary border-b border-border truncate">
                    {idx + 1} {shortName(f)}
                  </div>
                ))}

                <div className="px-3 py-3 text-text-tertiary border-b border-border/60">1人あたり</div>
                {facilities.map((f) => {
                  const pp = perPerson.get(f.id) ?? null;
                  const best = badges.cheapestId === f.id;
                  return (
                    <div key={f.id} className={`px-1.5 py-3 text-center border-b border-border/60 ${best ? 'font-bold text-primary' : 'text-text-primary'}`}>
                      {pp !== null ? `¥${pp.toLocaleString()}` : '—'}
                    </div>
                  );
                })}

                <div className="px-3 py-3 text-text-tertiary border-b border-border/60">最寄駅</div>
                {facilities.map((f) => {
                  const best = badges.nearestId === f.id;
                  const s = f.nearestStation && (f.walkMinutes ?? 0) > 0
                    ? `${f.nearestStation.replace(/駅$/, '')} ${f.walkMinutes}分`
                    : '—';
                  return (
                    <div key={f.id} className={`px-1.5 py-3 text-center border-b border-border/60 ${best ? 'font-bold text-primary' : 'text-text-primary'}`}>
                      {s}
                    </div>
                  );
                })}

                <div className="px-3 py-3 text-text-tertiary border-b border-border/60">水風呂</div>
                {facilities.map((f) => (
                  <div key={f.id} className={`px-1.5 py-3 text-center border-b border-border/60 ${f.features.waterBath ? 'font-bold text-primary' : 'text-text-tertiary'}`}>
                    {f.features.waterBath ? (f.features.waterBathTemp ? `${f.features.waterBathTemp}℃` : '○') : '—'}
                  </div>
                ))}

                <div className="px-3 py-3 text-text-tertiary">外気浴</div>
                {facilities.map((f) => (
                  <div key={f.id} className={`px-1.5 py-3 text-center ${f.features.outdoorAir ? 'font-bold text-primary' : 'text-text-tertiary'}`}>
                    {f.features.outdoorAir ? '○' : '—'}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 受け取った側を次の利用者に */}
        <div className="mt-6 saunako-comment flex gap-3 items-center">
          <Image src="/saunako/smile.webp" alt="サウナ子" width={64} height={64} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-sm font-bold text-text-primary">他にも気になるとこある？</p>
            <p className="text-xs text-text-secondary leading-relaxed">近くの個室サウナを見て、自分の候補も足して送り返せるよ</p>
            <Link href={areaHref} className="text-[13px] font-semibold text-primary inline-flex items-center gap-0.5 hover:underline" data-track-click="pick_area_link">
              {areaName}の個室サウナを見る
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
