import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getFacilityBySlug, getAllSlugs, getFacilitiesByPrefecture } from '@/lib/facilities';
import FacilityCard from '@/components/FacilityCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const facility = getFacilityBySlug(slug);
  if (!facility) return { title: 'Not Found' };

  return {
    title: `${facility.name} | サウナ子`,
    description: `${facility.name}の料金・設備・アクセス情報。${facility.nearestStation}から徒歩${facility.walkMinutes}分。${facility.priceMin.toLocaleString()}円〜`,
  };
}

export default async function FacilityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const facility = getFacilityBySlug(slug);

  if (!facility) {
    notFound();
  }

  // 近くの施設（同じ都道府県）
  const nearbyFacilities = getFacilitiesByPrefecture(facility.prefecture)
    .filter((f) => f.id !== facility.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <Link href={`/area/${facility.prefecture}`} className="hover:text-primary">
            {facility.prefectureLabel}
          </Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{facility.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image placeholder */}
            <div className="h-64 sm:h-80 bg-gray-200 rounded-xl flex items-center justify-center mb-6">
              <span className="text-text-tertiary">No Image</span>
            </div>

            {/* Basic Info */}
            <h1 className="text-2xl font-bold text-text-primary mb-2">{facility.name}</h1>
            <p className="text-text-secondary mb-4">
              {facility.nearestStation} 徒歩{facility.walkMinutes}分
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {facility.features.waterBath && <span className="tag tag-primary">水風呂</span>}
              {facility.features.selfLoyly && <span className="tag tag-primary">ロウリュ可</span>}
              {facility.features.outdoorAir && <span className="tag tag-primary">外気浴</span>}
              {facility.features.coupleOk && <span className="tag tag-primary">カップルOK</span>}
            </div>

            {/* Saunako Comment */}
            {facility.saunakoCommentLong ? (
              <div className="saunako-comment mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-saunako">●</span>
                  <span className="font-bold text-text-primary">サウナ子のひとこと</span>
                </div>
                <p className="text-text-secondary">{facility.saunakoCommentLong}</p>
              </div>
            ) : (
              <div className="saunako-comment mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-saunako">●</span>
                  <span className="font-bold text-text-primary">サウナ子のひとこと</span>
                </div>
                <p className="text-text-tertiary italic">コメント準備中...</p>
              </div>
            )}

            {/* Equipment */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">設備・サービス</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <span className={facility.features.waterBath ? 'text-available' : 'text-unavailable'}>
                    {facility.features.waterBath ? '○' : '×'}
                  </span>
                  <span className="text-text-primary">水風呂</span>
                  {facility.features.waterBathTemp && (
                    <span className="text-text-secondary text-sm">({facility.features.waterBathTemp}℃)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={facility.features.selfLoyly ? 'text-available' : 'text-unavailable'}>
                    {facility.features.selfLoyly ? '○' : '×'}
                  </span>
                  <span className="text-text-primary">セルフロウリュ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={facility.features.outdoorAir ? 'text-available' : 'text-unavailable'}>
                    {facility.features.outdoorAir ? '○' : '×'}
                  </span>
                  <span className="text-text-primary">外気浴</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={facility.features.coupleOk ? 'text-available' : 'text-unavailable'}>
                    {facility.features.coupleOk ? '○' : '×'}
                  </span>
                  <span className="text-text-primary">カップル利用</span>
                </div>
              </div>
            </section>

            {/* Amenities */}
            {facility.amenities.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-bold text-text-primary mb-4">アメニティ</h2>
                <div className="flex flex-wrap gap-2">
                  {facility.amenities.map((amenity) => (
                    <span key={amenity} className="tag bg-gray-100 text-text-secondary">
                      {amenity}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Basic Information */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">基本情報</h2>
              <dl className="grid grid-cols-1 gap-3">
                <div className="flex">
                  <dt className="w-24 text-text-secondary">住所</dt>
                  <dd className="text-text-primary">{facility.address}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-text-secondary">アクセス</dt>
                  <dd className="text-text-primary">{facility.nearestStation} 徒歩{facility.walkMinutes}分</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-text-secondary">営業時間</dt>
                  <dd className="text-text-primary">{facility.businessHours}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-text-secondary">定休日</dt>
                  <dd className="text-text-primary">{facility.holidays}</dd>
                </div>
                {facility.phone && (
                  <div className="flex">
                    <dt className="w-24 text-text-secondary">電話番号</dt>
                    <dd className="text-text-primary">
                      <a href={`tel:${facility.phone}`} className="text-primary hover:underline">
                        {facility.phone}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Map placeholder */}
            {facility.lat && facility.lng && (
              <section className="mb-8">
                <h2 className="text-lg font-bold text-text-primary mb-4">アクセス</h2>
                <div className="h-64 bg-gray-200 rounded-xl flex items-center justify-center">
                  <span className="text-text-tertiary">Map (lat: {facility.lat}, lng: {facility.lng})</span>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-6">
              <div className="text-2xl font-bold text-text-primary mb-1">
                {facility.priceMin.toLocaleString()}円〜
              </div>
              <p className="text-text-secondary mb-4">{facility.duration}分 / 最大{facility.capacity}名</p>

              <a
                href={facility.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary block text-center mb-3"
              >
                予約サイトで空きを確認 →
              </a>

              {facility.phone && (
                <a
                  href={`tel:${facility.phone}`}
                  className="block text-center py-3 border border-border rounded-lg text-text-primary hover:bg-gray-50"
                >
                  電話で予約する
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Nearby Facilities */}
        {nearbyFacilities.length > 0 && (
          <section className="mt-12">
            <div className="saunako-comment inline-block mb-4">
              <span className="text-saunako">●</span>
              <span className="ml-2 text-text-secondary">このあたりなら、こっちもチェックしてみて</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyFacilities.map((f) => (
                <FacilityCard key={f.id} facility={f} showComment={false} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
