import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getFacilityById, getAllIds, getRelatedFacilities } from '@/lib/facilities';
import FacilityDetailMapWrapper from '@/components/FacilityDetailMapWrapper';
import ImageGallery from '@/components/ImageGallery';
import BackButton from '@/components/BackButton';
import ShareButton from '@/components/ShareButton';
import dynamic from 'next/dynamic';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));
import PricingTable from '@/components/PricingTable';
import TimeSlotTable from '@/components/TimeSlotTable';
import RecordVisit from '@/components/RecordVisit';
import TrackFacilityView from '@/components/TrackFacilityView';
import ReservationLink from '@/components/ReservationLink';
import TrackExternalLink from '@/components/TrackExternalLink';
import AdUnit from '@/components/AdUnit';

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
    alternates: {
      canonical: `https://saunako.jp/facilities/${facility.id}`,
    },
    openGraph: {
      title: `${facility.name} | サウナ子`,
      description: `${facility.name}の料金・設備・アクセス情報`,
      images: facility.images.length > 0 ? [facility.images[0]] : [],
    },
  };
}

export default async function FacilityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const facility = getFacilityById(Number(id));

  if (!facility) {
    notFound();
  }

  const { sameArea, similarPrice } = getRelatedFacilities(facility, 3);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'TOP',
        item: 'https://saunako.jp/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: facility.prefectureLabel,
        item: `https://saunako.jp/area/${facility.prefecture}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: facility.name,
        item: `https://saunako.jp/facilities/${facility.id}`,
      },
    ],
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `https://saunako.jp/facilities/${facility.id}#webpage`,
        name: `${facility.name} | サウナ子`,
        description: facility.description,
        url: `https://saunako.jp/facilities/${facility.id}`,
        isPartOf: {
          '@type': 'WebSite',
          name: 'サウナ子',
          url: 'https://saunako.jp',
        },
        about: { '@id': `https://saunako.jp/facilities/${facility.id}#localbusiness` },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `https://saunako.jp/facilities/${facility.id}#localbusiness`,
        name: facility.name,
        ...(facility.phone && { telephone: facility.phone }),
        ...(facility.website && { url: facility.website }),
        ...(facility.images.length > 0 && { image: facility.images[0] }),
        address: {
          '@type': 'PostalAddress',
          addressLocality: facility.city,
          addressRegion: facility.prefectureLabel,
          addressCountry: 'JP',
        },
        ...(facility.lat && facility.lng && {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: facility.lat,
            longitude: facility.lng,
          },
        }),
        ...(facility.businessHours && facility.businessHours !== '不明' && {
          openingHours: facility.businessHours,
        }),
        ...(facility.priceMin > 0 && {
          priceRange: `¥${facility.priceMin.toLocaleString()}〜`,
        }),
        ...(facility.amenities.length > 0 && {
          amenityFeature: facility.amenities.map(amenity => ({
            '@type': 'LocationFeatureSpecification',
            name: amenity,
            value: true,
          })),
        }),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecordVisit facilityId={facility.id} />
      <TrackFacilityView facilityId={facility.id} facilityName={facility.name} area={facility.prefectureLabel} />
      {/* 専用ヘッダー */}
      <header className="bg-surface shadow h-14 px-4 md:h-16 md:px-8">
        <div className="flex items-center justify-between h-full">
          {/* 左: 戻るボタン + ロゴ */}
          <div className="flex items-center gap-2 md:gap-4">
            <BackButton />
            <div className="flex items-center gap-2">
              <Image
                src="/saunako-avatar.webp"
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
        {/* パンくずナビ */}
        <nav className="text-sm text-text-secondary px-4 py-3 md:px-0 md:pb-4 md:pt-0 max-w-[1400px] mx-auto">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <Link href={`/area/${facility.prefecture}`} className="hover:text-primary transition-colors">{facility.prefectureLabel}</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{facility.name}</span>
        </nav>
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
              {facility.saunakoCommentLong && (
                <div className="bg-saunako-bg border-y border-saunako-border md:border md:rounded-xl md:mt-6 px-4 py-5 md:p-6">
                  <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/saunako-avatar.webp"
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
                      {facility.saunakoCommentLong}
                    </p>
                  </div>
                </div>
              )}

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
                          <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m-7.071-2.929l.707-.707M4.929 4.929l.707.707M3 12h1m16 0h1m-2.636 7.071l-.707-.707M19.071 4.929l-.707.707M12 7a5 5 0 00-5 5h10a5 5 0 00-5-5z" /></svg>
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
                          <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
                          <p className="text-text-primary font-medium">セルフロウリュ</p>
                        </div>
                      )}
                      {facility.features.outdoorAir && (
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <p className="text-text-primary font-medium">外気浴スペース</p>
                        </div>
                      )}
                      {facility.amenities.map((amenity, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
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

              {/* d3. Time Slots Section */}
              {facility.timeSlots && facility.timeSlots.length > 0 && (
                <>
                  <div className="bg-surface md:shadow md:rounded-xl md:mt-6 px-4 py-5 md:p-6">
                    <div className="flex flex-col gap-3 md:gap-4">
                      <h2 className="text-text-primary text-base md:text-lg font-semibold">
                        予約枠の目安
                      </h2>
                      <TimeSlotTable timeSlots={facility.timeSlots} />
                      <p className="text-xs text-text-tertiary">
                        ※ 実際の空き状況は予約サイトでご確認ください
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
                      <ReservationLink
                        facilityId={facility.id}
                        facilityName={facility.name}
                        website={facility.website}
                      />
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
                    {facility.businessHours && facility.businessHours !== '不明' && (
                      <div className="flex">
                        <dt className="w-20 text-text-secondary flex-shrink-0 text-sm">営業時間</dt>
                        <dd className="text-text-primary text-sm">{facility.businessHours}</dd>
                      </div>
                    )}
                    {facility.holidays && facility.holidays !== '不明' && (
                      <div className="flex">
                        <dt className="w-20 text-text-secondary flex-shrink-0 text-sm">定休日</dt>
                        <dd className="text-text-primary text-sm">{facility.holidays}</dd>
                      </div>
                    )}
                    {facility.phone && (
                      <div className="flex">
                        <dt className="w-20 text-text-secondary flex-shrink-0 text-sm">電話</dt>
                        <dd className="text-text-primary text-sm">
                          <TrackExternalLink facilityId={facility.id} linkType="phone" href={`tel:${facility.phone}`} className="text-primary hover:underline">{facility.phone}</TrackExternalLink>
                        </dd>
                      </div>
                    )}
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
          {sameArea.length > 0 && (
            <>
              <h2 className="text-lg md:text-xl font-bold text-text-primary mb-4 md:mb-6">
                {facility.area}エリアの個室サウナ
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0 scrollbar-hide">
                {sameArea.map((f) => (
                  <Link
                    key={f.id}
                    href={`/facilities/${f.id}`}
                    className="min-w-[220px] w-[220px] md:min-w-0 md:w-auto bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex-shrink-0 md:flex-shrink"
                  >
                    <div className="relative h-[140px] md:h-[160px] bg-gray-200 flex items-center justify-center overflow-hidden">
                      <Image
                        src={f.images.length > 0 ? f.images[0] : '/placeholder-facility.svg'}
                        alt={f.name}
                        fill
                        sizes="(max-width: 768px) 220px, 33vw"
                        className={f.images.length > 0 ? 'object-cover' : 'object-contain p-4'}
                      />
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
            </>
          )}

          {similarPrice.length > 0 && (
            <div className={sameArea.length > 0 ? 'mt-8 md:mt-10' : ''}>
              <h2 className="text-lg md:text-xl font-bold text-text-primary mb-4 md:mb-6">
                似た価格帯の個室サウナ
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0 scrollbar-hide">
                {similarPrice.map((f) => (
                  <Link
                    key={f.id}
                    href={`/facilities/${f.id}`}
                    className="min-w-[220px] w-[220px] md:min-w-0 md:w-auto bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex-shrink-0 md:flex-shrink"
                  >
                    <div className="relative h-[140px] md:h-[160px] bg-gray-200 flex items-center justify-center overflow-hidden">
                      <Image
                        src={f.images.length > 0 ? f.images[0] : '/placeholder-facility.svg'}
                        alt={f.name}
                        fill
                        sizes="(max-width: 768px) 220px, 33vw"
                        className={f.images.length > 0 ? 'object-cover' : 'object-contain p-4'}
                      />
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="text-sm md:text-base font-semibold text-text-primary mb-1 truncate">{f.name}</h3>
                      <p className="text-text-secondary text-xs mb-1">{f.prefectureLabel} {f.area}</p>
                      <p className="text-saunako text-sm font-bold">
                        {f.priceMin > 0 ? `¥${f.priceMin.toLocaleString()}〜` : '要問合せ'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 広告ユニット: コンテンツ下部 */}
      <div className="bg-bg py-4 md:py-6">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <AdUnit slot="XXXXXXXXXX" format="auto" />
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-[#1A1A1A] text-white py-6 md:py-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <Image src="/saunako-avatar.webp" alt="サウナ子" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
            <span className="font-bold text-sm text-white">サウナ子</span>
          </Link>
          <p className="text-[11px] text-[#757575] max-w-lg mx-auto mb-3 leading-relaxed">
            当サイトは個室サウナの情報をまとめた非公式の検索サービスです。掲載情報は正確性を保証するものではありません。最新の料金・営業時間は各施設の公式サイトをご確認ください。掲載画像の著作権は各施設に帰属します。
          </p>
          <div className="flex items-center justify-center gap-4 mb-3">
            <Link href="/terms" className="text-[11px] text-[#757575] hover:text-white transition-colors">利用規約</Link>
            <Link href="/privacy" className="text-[11px] text-[#757575] hover:text-white transition-colors">プライバシーポリシー</Link>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#757575] hover:text-white transition-colors">お問い合わせ</a>
          </div>
          <p className="text-[11px] text-[#757575]">&copy; 2026 サウナ子 All rights reserved.</p>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
