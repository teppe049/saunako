import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import HeroSearchForm from '@/components/HeroSearchForm';
import dynamic from 'next/dynamic';
import { getPopularFacilities, getAllFacilities } from '@/lib/facilities';
import { PREFECTURES } from '@/lib/types';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));
const RecentlyViewed = dynamic(() => import('@/components/RecentlyViewed'));

export default function Home() {
  const popularFacilities = getPopularFacilities(3);
  const allFacilities = getAllFacilities();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'サウナ子',
    url: 'https://saunako.jp',
    description: 'プライベートサウナ専門の比較・検索サービス',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://saunako.jp/search?prefecture={prefecture}',
      'query-input': 'required name=prefecture',
    },
  };

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'サウナ子',
    url: 'https://saunako.jp',
    description: `全国${allFacilities.length}施設以上の個室サウナを掲載。${PREFECTURES.length}都府県のエリアから検索できます。`,
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Header />

      {/* Hero Section */}
      <section className="bg-surface py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-20">
          <div className="text-center mb-6 md:mb-10">
            <h1 className="text-[28px] leading-[1.3] md:text-[40px] md:leading-tight font-bold text-text-primary mb-4">
              あなたの「整い」を、私が見つける
            </h1>
            <p className="text-text-tertiary md:text-text-secondary text-sm md:text-base">
              プライベートサウナ専門の比較・検索サービス
            </p>
          </div>

          {/* Saunako Comment */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-saunako-bg border border-saunako-border rounded-[12px] md:rounded-xl px-4 py-3 md:px-5 md:py-4 flex items-start gap-2.5 md:gap-3">
              <Image
                src="/saunako-avatar.webp"
                alt="サウナ子"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
              />
              <p className="text-sm text-text-primary leading-relaxed pt-2">
                今日はどんなサウナをお探し？条件を教えて、ぴったりの施設を見つけるね！
              </p>
            </div>
          </div>

          {/* Search Form */}
          <HeroSearchForm />
        </div>
      </section>

      {/* Popular Facilities Section */}
      <section className="bg-bg py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-5 md:px-20">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">ピックアップ</h2>
            <Link href="/search?prefecture=tokyo" className="text-primary text-sm font-medium hover:opacity-80 transition-opacity">
              すべて見る →
            </Link>
          </div>

          {/* Mobile: horizontal scroll, PC: 3-column grid */}
          <div className="flex gap-3 overflow-x-auto pb-2 pr-5 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0 md:pr-0 scrollbar-hide">
            {popularFacilities.map((facility) => (
              <Link
                key={facility.id}
                href={`/facilities/${facility.id}`}
                className="min-w-[72vw] w-[72vw] md:min-w-0 md:w-auto bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex-shrink-0 md:flex-shrink"
              >
                {/* Image */}
                <div className="relative h-[140px] md:h-[180px] bg-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src={facility.images.length > 0 ? facility.images[0] : '/placeholder-facility.svg'}
                    alt={facility.name}
                    fill
                    sizes="(max-width: 768px) 72vw, 33vw"
                    className={facility.images.length > 0 ? 'object-cover' : 'object-contain p-4'}
                  />
                </div>

                {/* Info */}
                <div className="p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-semibold text-text-primary mb-1">
                    {facility.name}
                  </h3>
                  <p className="text-[13px] text-text-tertiary mb-3">
                    {facility.nearestStation && facility.walkMinutes > 0
                      ? `${facility.nearestStation}${facility.nearestStation.includes('駅') ? '' : '駅'} 徒歩${facility.walkMinutes}分 | `
                      : ''}{facility.area}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-saunako text-sm md:text-base font-bold">
                      {facility.priceMin > 0 ? (
                        <>
                          ¥{facility.priceMin.toLocaleString()}〜
                          <span className="text-text-tertiary text-xs md:text-sm font-normal ml-1">/ 1時間</span>
                        </>
                      ) : (
                        <span className="text-text-tertiary text-xs md:text-sm font-normal">要問合せ</span>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed allFacilities={allFacilities} />

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-8 md:pt-12 md:pb-8">
        <div className="max-w-7xl mx-auto px-5 md:px-20">
          {/* Mobile: centered single column */}
          <div className="flex flex-col items-center gap-4 md:hidden">
            <span className="font-bold text-base text-white">サウナ子</span>
            <div className="flex items-center gap-3">
              <a href="https://x.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-white transition-colors" aria-label="X (Twitter)" data-track-click="sns_follow" data-track-service="x">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://instagram.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-white transition-colors" aria-label="Instagram" data-track-click="sns_follow" data-track-service="instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            </div>
            <p className="text-[11px] text-[#757575] text-center leading-relaxed">
              当サイトは個室サウナの情報をまとめた非公式の検索サービスです。掲載情報は正確性を保証するものではありません。最新の料金・営業時間は各施設の公式サイトをご確認ください。掲載画像の著作権は各施設に帰属します。
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {PREFECTURES.map((pref) => (
                <Link key={pref.code} href={`/area/${pref.code}`} className="text-[11px] text-[#9CA3AF] hover:text-white transition-colors">{pref.label}</Link>
              ))}
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link href="/search" className="text-[11px] text-[#757575] hover:text-white transition-colors">施設を探す</Link>
              <Link href="/articles" className="text-[11px] text-[#757575] hover:text-white transition-colors">コラム</Link>
              <Link href="/terms" className="text-[11px] text-[#757575] hover:text-white transition-colors">利用規約</Link>
              <Link href="/privacy" className="text-[11px] text-[#757575] hover:text-white transition-colors">プライバシーポリシー</Link>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#757575] hover:text-white transition-colors">お問い合わせ</a>
              <Link href="/faq" className="text-[11px] text-[#757575] hover:text-white transition-colors">よくある質問</Link>
              <Link href="/for-owners" className="text-[11px] text-[#757575] hover:text-white transition-colors">施設掲載のご案内</Link>
            </div>
            <p className="text-[11px] text-[#757575]">
              © 2026 サウナ子 All rights reserved.
            </p>
          </div>

          {/* PC: 3-column grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-4 gap-12 mb-10">
              {/* Brand Column */}
              <div className="max-w-[320px]">
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src="/saunako-avatar.webp"
                    alt="サウナ子"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-bold text-base">サウナ子</span>
                </div>
                <p className="text-[13px] text-[#9CA3AF] leading-relaxed">
                  あなたの「整い」を見つける、プライベートサウナ専門の比較・検索サービス。水風呂の温度からロウリュの有無まで、サウナ好きが気になるポイントを徹底比較。
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <a href="https://x.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-white transition-colors" aria-label="X (Twitter)" data-track-click="sns_follow" data-track-service="x">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  <a href="https://instagram.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-[#9CA3AF] hover:text-white transition-colors" aria-label="Instagram" data-track-click="sns_follow" data-track-service="instagram">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  </a>
                </div>
              </div>

              {/* Service Column */}
              <div>
                <h3 className="text-[13px] font-semibold text-white mb-4">サービス</h3>
                <ul className="space-y-3">
                  <li><Link href="/search" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">施設を探す</Link></li>
                  <li><Link href="/articles" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">コラム</Link></li>
                  <li><Link href="/faq" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">よくある質問</Link></li>
                </ul>
              </div>

              {/* Area Column */}
              <div>
                <h3 className="text-[13px] font-semibold text-white mb-4">エリアから探す</h3>
                <ul className="space-y-3">
                  {PREFECTURES.map((pref) => (
                    <li key={pref.code}><Link href={`/area/${pref.code}`} className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">{pref.label}</Link></li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer Column */}
              <div>
                <h3 className="text-[13px] font-semibold text-white mb-4">ご注意</h3>
                <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
                  当サイトは個室サウナの情報をまとめた非公式の検索サービスです。掲載情報は正確性を保証するものではありません。最新の料金・営業時間は各施設の公式サイトをご確認ください。掲載画像の著作権は各施設に帰属します。
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#333333] pt-6 flex flex-col items-center gap-3">
              <div className="flex items-center gap-4">
                <Link href="/terms" className="text-[12px] text-[#6B7280] hover:text-white transition-colors">利用規約</Link>
                <Link href="/privacy" className="text-[12px] text-[#6B7280] hover:text-white transition-colors">プライバシーポリシー</Link>
                <a href="https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#6B7280] hover:text-white transition-colors">お問い合わせ</a>
                <Link href="/for-owners" className="text-[12px] text-[#6B7280] hover:text-white transition-colors">施設掲載のご案内</Link>
              </div>
              <div className="flex items-center gap-3">
                <a href="https://x.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-[#6B7280] hover:text-white transition-colors" aria-label="X (Twitter)" data-track-click="sns_follow" data-track-service="x">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="https://instagram.com/saunako_jp" target="_blank" rel="noopener noreferrer" className="text-[#6B7280] hover:text-white transition-colors" aria-label="Instagram" data-track-click="sns_follow" data-track-service="instagram">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
              </div>
              <p className="text-[12px] text-[#6B7280] text-center">
                © 2026 サウナ子 All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
