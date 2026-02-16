import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import HeroSearchForm from '@/components/HeroSearchForm';
import ScrollToTop from '@/components/ScrollToTop';
import { getPopularFacilities, getAllFacilities } from '@/lib/facilities';
import RecentlyViewed from '@/components/RecentlyViewed';

export default function Home() {
  const popularFacilities = getPopularFacilities(3);
  const allFacilities = getAllFacilities();

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      {/* Hero Section */}
      <section className="bg-surface py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-20">
          <div className="text-center mb-6 md:mb-10">
            <h1 className="text-[28px] leading-[1.3] md:text-[40px] md:leading-tight font-bold text-text-primary mb-4 whitespace-pre-line">
              {`あなたの「整い」を、\n私が見つける`}
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
            <p className="text-[11px] text-[#757575] text-center leading-relaxed">
              当サイトは個室サウナの情報をまとめた非公式の検索サービスです。掲載情報は正確性を保証するものではありません。最新の料金・営業時間は各施設の公式サイトをご確認ください。掲載画像の著作権は各施設に帰属します。
            </p>
            <p className="text-[11px] text-[#757575]">
              © 2026 サウナ子 All rights reserved.
            </p>
          </div>

          {/* PC: 3-column grid */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-16 mb-10">
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
              </div>

              {/* Service Column */}
              <div>
                <h3 className="text-[13px] font-semibold text-white mb-4">サービス</h3>
                <ul className="space-y-3">
                  <li><Link href="/search" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">施設を探す</Link></li>
                  <li><Link href="/area/tokyo" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">エリアから探す</Link></li>
                  <li><Link href="/search" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">施設一覧</Link></li>
                  <li><Link href="/search?sort=newest" className="text-[13px] text-[#9CA3AF] hover:text-white transition-colors">新着施設</Link></li>
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
            <div className="border-t border-[#333333] pt-6">
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
