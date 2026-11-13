'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import PickReplyButton from '@/components/PickReplyButton';
import PickCompareTable from '@/components/PickCompareTable';
import { getFacilitiesByIds } from '@/lib/facilitiesClient';
import { getPerPersonPrice } from '@/lib/facility-utils';
import { parsePickIds, sanitizePickMessage, getPickBadges, getPickAreaLabel, MAX_PICK } from '@/lib/pick';
import { AREA_GROUPS } from '@/lib/types';
import type { Facility } from '@/lib/types';

function stationText(f: Facility): string | null {
  if (!f.nearestStation || (f.walkMinutes ?? 0) <= 0) return null;
  return `${f.nearestStation}${f.nearestStation.includes('駅') ? '' : '駅'}から徒歩${f.walkMinutes}分`;
}

function headline(facilities: Facility[]): string {
  const area = getPickAreaLabel(facilities);
  const where = area ? (area.area ?? area.prefectureLabel) : '';
  return `どれがいい？ ${where}の個室サウナ ${facilities.length}件`;
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

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-lg font-bold text-text-primary mb-2">{title}</h1>
      <p className="text-sm text-text-secondary mb-6">{body}</p>
      <Link href="/search" className="btn-primary inline-block">
        個室サウナを探す
      </Link>
    </div>
  );
}

/**
 * /pick?ids=85-18-84&m=ひとこと の中身。候補を受け取った側が見る画面。
 * サイトは静的書き出しでサーバー処理を持たないため、候補の施設はブラウザで /facilities-data.json から引く。
 * 旧 URL の /pick/85-18-84 は Worker（worker/index.ts）がここへ転送する。
 */
export default function PickView() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids') ?? '';
  const message = sanitizePickMessage(searchParams.get('m'));
  const [loaded, setLoaded] = useState<{ key: string; facilities: Facility[] } | null>(null);

  useEffect(() => {
    const ids = parsePickIds(idsParam);
    if (ids.length === 0) return;
    let active = true;
    getFacilitiesByIds(ids).then((facilities) => {
      if (!active) return;
      setLoaded({ key: idsParam, facilities });
      if (facilities.length > 0) document.title = `${headline(facilities)} | サウナ子`;
    });
    return () => {
      active = false;
    };
  }, [idsParam]);

  if (parsePickIds(idsParam).length === 0) {
    return <EmptyState title="候補がまだありません" body={`施設ページの「行きたい候補に入れる」で気になる施設を追加してね（最大${MAX_PICK}件）`} />;
  }
  if (!loaded || loaded.key !== idsParam) return null;
  const facilities = loaded.facilities;
  if (facilities.length === 0) {
    return <EmptyState title="候補がありません" body="リンクが古いか、施設が閉店した可能性があります" />;
  }

  const badges = getPickBadges(facilities);
  const area = getPickAreaLabel(facilities);
  const areaSlug = area?.area ? AREA_GROUPS[area.prefecture]?.find((a) => a.label === area.area)?.slug : undefined;
  const areaHref = area ? (areaSlug ? `/area/${area.prefecture}/${areaSlug}` : `/area/${area.prefecture}`) : '/search';
  const areaName = area ? (area.area ?? area.prefectureLabel) : '近く';
  const perPerson = new Map(facilities.map((f) => [f.id, getPerPersonPrice(f)] as const));

  return (
    <>
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
            badges.cheapestId === f.id ? 'いちばん安い' : badges.nearestId === f.id ? `${badges.nearestStation}にいちばん近い` : null;
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

      {facilities.length >= 2 && <PickCompareTable facilities={facilities} badges={badges} perPerson={perPerson} />}

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
    </>
  );
}
