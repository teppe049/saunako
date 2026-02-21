import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSearchForm from '@/components/HeroSearchForm';
import dynamic from 'next/dynamic';
import { getPopularFacilities, getAllFacilities, getNewFacilities } from '@/lib/facilities';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));
const RecentlyViewed = dynamic(() => import('@/components/RecentlyViewed'));

export default function Home() {
  const popularFacilities = getPopularFacilities(3);
  const newFacilities = getNewFacilities(3);
  const allFacilities = getAllFacilities();

  return (
    <div className="min-h-screen bg-bg">
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
                priority
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
            <Link href="/search" className="text-primary text-sm font-medium hover:opacity-80 transition-opacity">
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

      {/* New Facilities Section */}
      {newFacilities.length > 0 && (
        <section className="bg-bg py-6 md:py-12">
          <div className="max-w-7xl mx-auto px-5 md:px-20">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-text-primary">最近追加された施設</h2>
              <Link href="/search?sort=newest" className="text-primary text-sm font-medium hover:opacity-80 transition-opacity">
                すべて見る →
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 pr-5 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0 md:pr-0 scrollbar-hide">
              {newFacilities.map((facility) => (
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
                    <span className="absolute top-2 left-2 bg-saunako text-white text-xs font-bold px-2 py-0.5 rounded">NEW</span>
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
      )}

      {/* Recently Viewed */}
      <RecentlyViewed allFacilities={allFacilities} />

      <Footer />
      <ScrollToTop />
    </div>
  );
}
