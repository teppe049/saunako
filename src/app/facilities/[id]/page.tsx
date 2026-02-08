import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getFacilityById, getAllIds, getFacilitiesByPrefecture } from '@/lib/facilities';
import FacilityDetailMapWrapper from '@/components/FacilityDetailMapWrapper';
import ImageGallery from '@/components/ImageGallery';
import BackButton from '@/components/BackButton';
import ShareButton from '@/components/ShareButton';
import ScrollToTop from '@/components/ScrollToTop';
import PricingTable from '@/components/PricingTable';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const ids = getAllIds();
  return ids.map((id) => ({ id: String(id) }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const facility = getFacilityById(Number(id));
  if (!facility) return { title: 'Not Found' };

  return {
    title: `${facility.name} | サウナ子`,
    description: `${facility.name}の料金・設備・アクセス情報。${facility.nearestStation && facility.walkMinutes > 0 ? `${facility.nearestStation}${facility.nearestStation.includes('駅') ? '' : '駅'}から徒歩${facility.walkMinutes}分。` : ''}${facility.priceMin > 0 ? `${facility.priceMin.toLocaleString()}円〜` : '料金要問合せ'}`,
  };
}

export default async function FacilityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const facility = getFacilityById(Number(id));

  if (!facility) {
    notFound();
  }

  const relatedFacilities = getFacilitiesByPrefecture(facility.prefecture)
    .filter((f) => f.id !== facility.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-bg">
      {/* 専用ヘッダー */}
      <header className="bg-surface shadow h-14 px-4 md:h-16 md:px-8">
        <div className="flex items-center justify-between h-full">
          {/* 左: 戻るボタン + ロゴ */}
          <div className="flex items-center gap-2 md:gap-4">
            <BackButton />
            <div className="flex items-center gap-2">
              <Image
                src="/saunako-avatar.png"
                alt="サウナ子"
                width={36}
                height={36}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover"
              />
              <span className="text-lg md:text-xl font-bold text-text-primary">サウナ子</span>
            </div>
          </div>

          {/* 右: 共有ボタン */}
          <div className="flex items-center gap-2 md:gap-3">
            <ShareButton name={facility.name} url={`/facilities/${facility.id}`} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-0 md:p-8">
        <div className="flex flex-col md:flex-row gap-0 md:gap-8 max-w-[1400px] mx-auto">
          {/* 左パネル: モバイル全幅、PC 880px固定 */}
          <div className="w-full md:w-[880px] md:flex-shrink-0">
            <div className="flex flex-col">
              {/* a. Image Gallery */}
              <ImageGallery images={facility.images} facilityName={facility.name} />

              {/* セクション区切り (モバイルのみ) */}
              <div className="h-2 bg-bg md:hidden" />

              {/* b. Facility Info Panel */}
              <div className="bg-surface md:shadow md:rounded-xl md:mt-6 px-4 py-5 md:p-6">
                <div className="flex flex-col gap-3 md:gap-5">
                  <div>
                    <h1 className="text-text-primary text-[22px] md:text-2xl font-bold">
                      {facility.name}
                    </h1>
                    {facility.nearestStation && facility.walkMinutes > 0 && (
                      <p className="text-text-secondary mt-1 text-sm">
                        {facility.nearestStation}{facility.nearestStation.includes('駅') ? '' : '駅'}から徒歩{facility.walkMinutes}分
                      </p>
                    )}
                    <div className="flex items-baseline gap-1 mt-2">
                      {facility.priceMin > 0 ? (
                        <>
                          <span className="text-saunako text-[28px] font-bold">
                            ¥{facility.priceMin.toLocaleString()}
                          </span>
                          <span className="text-text-primary text-sm">〜 /時間</span>
                        </>
                      ) : (
                        <span className="text-text-secondary text-sm">料金は公式サイトをご確認ください</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {facility.features.waterBath && <span className="tag tag-primary">水風呂あり</span>}
                    {facility.features.selfLoyly && <span className="tag tag-primary">ロウリュ可</span>}
                    {facility.features.outdoorAir && <span className="tag tag-primary">外気浴</span>}
                    {facility.features.coupleOk && <span className="tag tag-available">男女OK</span>}
                  </div>
                </div>
              </div>

              {/* セクション区切り (モバイルのみ) */}
              <div className="h-2 bg-bg md:hidden" />

              {/* サウナ子のおすすめポイント */}
              <div className="bg-saunako-bg border-y border-saunako-border md:border md:rounded-xl md:mt-6 px-4 py-5 md:p-6">
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/saunako-avatar.png"
                      alt="サウナ子"
                      width={44}
                      height={44}
                      className="w-10 h-10 md:w-11 md:h-11 rounded-full flex-shrink-0 object-cover"
                    />
                    <div>
                      <h2 className="font-bold text-text-primary text-base md:text-lg">サウナ子のおすすめポイント</h2>
                    </div>
                  </div>
                  <p className="text-text-secondary text-[13px] md:text-sm leading-[1.6] md:leading-[1.8]">
                    {facility.saunakoCommentLong ? (
                      facility.saunakoCommentLong
                    ) : (
                      'ここは本当におすすめできる場所！今回はいろんなところを見比べて、カップルでいらっしゃいながら、まだまだ開拓中のお二人でも安心して楽しめる、コスパの良い施設を選びました。'
                    )}
                  </p>
                </div>
              </div>

              {/* セクション区切り (モバイルのみ) */}
              <div className="h-2 bg-bg md:hidden" />

              {/* c. Equipment Section */}
              <div className="bg-surface md:shadow md:rounded-xl md:mt-6 px-4 py-5 md:p-6">
                <div className="flex flex-col gap-4 md:gap-5">
                  <h2 className="text-text-primary text-base md:text-lg font-semibold">
                    設備・サービス
                  </h2>
                  {(facility.features.waterBath || facility.features.selfLoyly || facility.features.outdoorAir || facility.amenities.length > 0) ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {facility.features.waterBath && (
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💧</span>
                          <div>
                            <p className="text-text-primary font-medium">水風呂</p>
                            {facility.features.waterBathTemp && (
                              <p className="text-sm text-text-secondary">{facility.features.waterBathTemp}℃</p>
                            )}
                          </div>
                        </div>
                      )}
                      {facility.features.selfLoyly && (
                        <div className="flex items-center gap-3">
                          <span className="text-xl">💨</span>
                          <p className="text-text-primary font-medium">セルフロウリュ</p>
                        </div>
                      )}
                      {facility.features.outdoorAir && (
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🌿</span>
                          <p className="text-text-primary font-medium">外気浴スペース</p>
                        </div>
                      )}
                      {facility.amenities.map((amenity, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xl">✨</span>
                          <p className="text-text-primary font-medium">{amenity}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm">設備情報は現在準備中です</p>
                  )}
                </div>
              </div>

              {/* セクション区切り (モバイルのみ) */}
              <div className="h-2 bg-bg md:hidden" />

              {/* d. Description Section */}
              <div className="bg-surface md:shadow md:rounded-xl md:mt-6 px-4 py-5 md:p-6">
                <div className="flex flex-col gap-3 md:gap-5">
                  <h2 className="text-text-primary text-base md:text-lg font-semibold">
                    施設紹介
                  </h2>
                  <p className="text-text-secondary text-[13px] md:text-sm leading-[1.6] md:leading-[1.8]">
                    {facility.description}
                  </p>
                </div>
              </div>

              {/* セクション区切り (モバイルのみ) */}
              <div className="h-2 bg-bg md:hidden" />

              {/* d2. Pricing Table Section */}
              {facility.plans && facility.plans.length > 0 && (
                <>
                  <div className="bg-surface md:shadow md:rounded-xl md:mt-6 px-4 py-5 md:p-6">
                    <div className="flex flex-col gap-3 md:gap-4">
                      <h2 className="text-text-primary text-base md:text-lg font-semibold">
                        料金プラン
                      </h2>
                      <PricingTable plans={facility.plans} />
                      <p className="text-xs text-text-tertiary">
                        ※ 最新の料金は公式サイトでご確認ください
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-bg md:hidden" />
                </>
              )}

              {/* e. Notes Section */}
              <div className="md:mt-6 px-4 py-4 md:px-6 md:py-5 md:rounded-lg" style={{ background: '#FFF8F0' }}>
                <div className="md:border md:border-[#FFE0CC] md:rounded-lg md:p-4">
                  <div className="flex flex-col gap-2.5 md:gap-3">
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      <h2 className="text-text-primary font-semibold text-sm md:text-base">ご利用にあたっての注意事項</h2>
                    </div>
                    <ul className="space-y-1.5 md:space-y-2 text-text-secondary text-xs md:text-sm leading-[1.5] md:leading-normal">
                      <li>・最大収容人数：{facility.capacity}名</li>
                      {facility.note && facility.note.split('\n').map((line, i) => (
                        <li key={i}>・{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右パネル: モバイルでは左パネルの後にインライン表示、PCではstickyサイドバー */}
          <div className="w-full md:flex-1 md:min-w-0">
            <div className="md:sticky md:top-6 flex flex-col">
              {/* セクション区切り (モバイルのみ) */}
              <div className="h-2 bg-bg md:hidden" />

              {/* a. Reservation Panel */}
              <div className="bg-surface md:shadow md:rounded-xl px-4 py-5 md:p-6">
                <div className="flex flex-col gap-4 md:gap-5">
                  <h3 className="font-bold text-text-primary text-lg">{facility.name}</h3>

                  {/* 料金情報 */}
                  {facility.priceMin > 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-text-secondary text-sm">料金:</span>
                      <span className="text-saunako text-2xl font-bold">
                        ¥{facility.priceMin.toLocaleString()}
                      </span>
                      <span className="text-text-secondary text-sm">〜 / {facility.duration}分</span>
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm">料金は公式サイトをご確認ください</p>
                  )}

                  {/* 基本情報 */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">利用時間</span>
                      <span className="text-text-primary">{facility.duration}分〜</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">最大人数</span>
                      <span className="text-text-primary">{facility.capacity}名</span>
                    </div>
                  </div>

                  {/* CTA */}
                  {facility.website ? (
                    <>
                      <a
                        href={facility.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full text-white font-semibold rounded-[10px] h-12 md:h-[52px] bg-saunako hover:opacity-90 transition-opacity"
                      >
                        公式サイトで予約する
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      <p className="text-xs text-text-tertiary text-center">
                        ※ 予約・料金の詳細は公式サイトでご確認ください
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full text-text-tertiary text-sm font-medium rounded-[10px] h-12 md:h-[52px] bg-gray-100">
                      公式サイト情報なし
                    </div>
                  )}
                </div>
              </div>

              {/* セクション区切り (モバイルのみ) */}
              <div className="h-2 bg-bg md:hidden" />

              {/* b. Access Info */}
              <div className="bg-surface md:shadow md:rounded-xl md:mt-6 px-4 py-5 md:p-5">
                <div className="flex flex-col gap-3 md:gap-4">
                  <h3 className="font-bold text-text-primary">アクセス</h3>
                  {facility.lat && facility.lng ? (
                    <div className="h-40 md:h-48 rounded-lg overflow-hidden">
                      <FacilityDetailMapWrapper
                        lat={facility.lat}
                        lng={facility.lng}
                        name={facility.name}
                      />
                    </div>
                  ) : (
                    <div className="h-40 md:h-48 bg-gray-200 rounded-lg md:rounded-xl flex items-center justify-center">
                      <span className="text-text-tertiary">地図情報なし</span>
                    </div>
                  )}
                  <dl className="space-y-2">
                    <div className="flex">
                      <dt className="w-20 text-text-secondary flex-shrink-0 text-sm">住所</dt>
                      <dd className="text-text-primary text-sm">{facility.address}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-20 text-text-secondary flex-shrink-0 text-sm">アクセス</dt>
                      <dd className="text-text-primary text-sm">
                        {facility.nearestStation && facility.walkMinutes > 0
                          ? `${facility.nearestStation}${facility.nearestStation.includes('駅') ? '' : '駅'}から徒歩${facility.walkMinutes}分`
                          : '詳細は公式サイトをご確認ください'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Related Facilities */}
      <section className="bg-bg py-6 md:py-10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <h2 className="text-lg md:text-xl font-bold text-text-primary mb-4 md:mb-6">
            {facility.prefectureLabel}の他の個室サウナ
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0 scrollbar-hide">
            {relatedFacilities.map((f) => (
              <Link
                key={f.id}
                href={`/facilities/${f.id}`}
                className="min-w-[220px] w-[220px] md:min-w-0 md:w-auto bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex-shrink-0 md:flex-shrink"
              >
                <div className="relative h-[140px] md:h-[160px] bg-gray-200 flex items-center justify-center overflow-hidden">
                  {f.images.length > 0 ? (
                    <Image src={f.images[0]} alt={f.name} fill sizes="(max-width: 768px) 220px, 33vw" className="object-cover" />
                  ) : (
                    <span className="text-text-tertiary text-sm">No Image</span>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-sm md:text-base font-semibold text-text-primary mb-1 truncate">{f.name}</h3>
                  <p className="text-saunako text-sm font-bold">
                    {f.priceMin > 0 ? `¥${f.priceMin.toLocaleString()}〜` : '要問合せ'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-[#1A1A1A] text-white py-6 md:py-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <Image src="/saunako-avatar.png" alt="サウナ子" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
            <span className="font-bold text-sm text-white">サウナ子</span>
          </Link>
          <p className="text-[11px] text-[#757575]">&copy; 2026 サウナ子 All rights reserved.</p>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
