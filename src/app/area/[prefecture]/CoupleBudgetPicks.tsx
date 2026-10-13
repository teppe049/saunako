import Link from 'next/link';
import { coupleBudgetPicks } from '@/lib/coupleBudget';
import type { Facility } from '@/lib/types';

// 一覧より上に置くため、スクロールを押し下げすぎない件数に抑える
const PICK_LIMIT = 6;

interface Props {
  facilities: Facility[];
  prefectureLabel: string;
  /** 続きを読む記事（任意） */
  moreArticle?: { slug: string; title: string };
}

export default function CoupleBudgetPicks({ facilities, prefectureLabel, moreArticle }: Props) {
  const picks = coupleBudgetPicks(facilities, PICK_LIMIT);
  if (picks.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-text-primary mb-2">{prefectureLabel}でカップル（男女2人）で安く入れる個室サウナ</h2>
      <p className="text-sm text-text-secondary leading-relaxed mb-4">
        男女で利用できる施設を、2人で入れるいちばん安いプランの料金順に並べたよ。利用時間は施設ごとに違うから、時間とセットで見てね。
      </p>
      <ol className="bg-surface border border-border rounded-xl divide-y divide-border">
        {picks.map(({ facility, price, duration, perPerson }, i) => (
          <li key={facility.id}>
            <Link
              href={`/facilities/${facility.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-bg transition-colors"
              data-track-click="couple_budget_pick"
              data-track-facility-id={facility.id}
              data-track-index={i}
            >
              <span className="w-6 text-center text-sm font-bold text-primary flex-shrink-0">{i + 1}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-text-primary truncate">{facility.name}</span>
                {facility.nearestStation && (
                  <span className="block text-xs text-text-tertiary truncate">
                    {facility.nearestStation}
                    {facility.walkMinutes ? ` 徒歩${facility.walkMinutes}分` : ''}
                  </span>
                )}
              </span>
              <span className="text-right flex-shrink-0">
                <span className="block font-bold text-text-primary">
                  ¥{price.toLocaleString()}
                  <span className="text-xs font-normal text-text-tertiary"> / 2人{duration}分</span>
                </span>
                <span className="block text-xs text-text-tertiary">1人あたり¥{perPerson.toLocaleString()}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="text-xs text-text-tertiary mt-2">※平日・時間帯限定の料金を含みます。最新の料金は各施設ページと公式予約サイトで確認してください。</p>
      {moreArticle && (
        <Link
          href={`/articles/${moreArticle.slug}`}
          className="text-sm text-primary font-semibold mt-3 inline-block hover:opacity-80"
          data-track-click="couple_budget_more"
          data-track-article={moreArticle.slug}
        >
          → {moreArticle.title}
        </Link>
      )}
    </section>
  );
}
