import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getFacilityBySlug, getAllSlugs, getFacilitiesByPrefecture } from '@/lib/facilities';
import FacilityCard from '@/components/FacilityCard';
import FacilityDetailMap from '@/components/FacilityDetailMap';

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

  const nearbyFacilities = getFacilitiesByPrefecture(facility.prefecture)
    .filter((f) => f.id !== facility.id)
    .slice(0, 3);

  // 仮の予約時間枠
  const timeSlots = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/area/${facility.prefecture}`} className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-primary">●</span>
            <span className="font-bold">サウナ子</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Content - 3 columns */}
          <div className="lg:col-span-3">
            {/* Main Image */}
            <div className="relative h-72 sm:h-96 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-text-tertiary">No Image</span>
            </div>

            {/* Thumbnail row */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary"
                >
                  <span className="text-text-tertiary text-xs">{i}</span>
                </div>
              ))}
            </div>

            {/* Facility Info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary mb-2">{facility.name}</h1>
              <p className="text-text-secondary mb-3">
                {facility.nearestStation}駅から徒歩{facility.walkMinutes}分
              </p>
              <div className="flex flex-wrap gap-2">
                {facility.features.waterBath && <span className="tag tag-primary">水風呂あり</span>}
                {facility.features.selfLoyly && <span className="tag tag-primary">ロウリュサービス</span>}
                {facility.features.outdoorAir && <span className="tag tag-primary">外気浴</span>}
                {facility.features.coupleOk && <span className="tag tag-available">男女OK</span>}
              </div>
            </div>

            {/* Divider */}
            <hr className="border-border my-6" />

            {/* Equipment Section */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">設備・サービス</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔥</span>
                  <div>
                    <p className="text-text-primary font-medium">フィンランド式サウナ</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">💧</span>
                  <div>
                    <p className="text-text-primary font-medium">水風呂</p>
                    {facility.features.waterBathTemp && (
                      <p className="text-sm text-text-secondary">{facility.features.waterBathTemp}℃</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌿</span>
                  <div>
                    <p className="text-text-primary font-medium">
                      {facility.features.outdoorAir ? '外気浴スペース' : '休憩スペース'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">💨</span>
                  <div>
                    <p className="text-text-primary font-medium">
                      {facility.features.selfLoyly ? 'ロウリュサービス' : 'ロウリュなし'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚿</span>
                  <div>
                    <p className="text-text-primary font-medium">シャワー室</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🪑</span>
                  <div>
                    <p className="text-text-primary font-medium">リクライニングチェア</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Divider */}
            <hr className="border-border my-6" />

            {/* Facility Description */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">施設紹介</h2>
              <p className="text-text-secondary leading-relaxed">
                {facility.name}は、{facility.prefectureLabel}{facility.city}に位置する
                プライベートサウナ施設です。{facility.nearestStation}駅から徒歩{facility.walkMinutes}分と
                アクセスも良好。最大{facility.capacity}名まで利用可能で、
                {facility.features.coupleOk ? 'カップルや友人同士での利用にもおすすめです。' : 'ゆったりとしたプライベート空間でサウナを楽しめます。'}
              </p>
            </section>

            {/* Divider */}
            <hr className="border-border my-6" />

            {/* Notes */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">ご利用にあたっての注意事項</h2>
              <ul className="space-y-2 text-text-secondary">
                <li>・完全予約制（当日予約可）</li>
                <li>・キャンセル：ご利用の前日18時まで無料</li>
                <li>・飲食物の持ち込み可能</li>
                <li>・最大収容人数：{facility.capacity}名</li>
                <li>・キャンセル料発生時期まで無料</li>
              </ul>
            </section>

            {/* Divider */}
            <hr className="border-border my-6" />

            {/* Saunako Recommendation */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary text-xl">●</span>
                <h2 className="text-lg font-bold text-text-primary">サウナ子のおすすめポイント</h2>
              </div>
              <div className="saunako-comment">
                {facility.saunakoCommentLong ? (
                  <p className="text-text-secondary">{facility.saunakoCommentLong}</p>
                ) : (
                  <p className="text-text-secondary">
                    ここは本当におすすめできる場所！今回はいろんなところを見比べて、カップルでいらっしゃいながら、まだまだ開拓中のお二人でも安心して楽しめる、コスパの良い施設を選びました。
                  </p>
                )}
              </div>
            </section>

            {/* Divider */}
            <hr className="border-border my-6" />

            {/* Access */}
            <section className="mb-8">
              <h2 className="text-lg font-bold text-text-primary mb-4">アクセス</h2>
              {facility.lat && facility.lng ? (
                <div className="h-64 mb-4">
                  <FacilityDetailMap
                    lat={facility.lat}
                    lng={facility.lng}
                    name={facility.name}
                  />
                </div>
              ) : (
                <div className="h-64 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-text-tertiary">地図情報なし</span>
                </div>
              )}
              <dl className="space-y-2">
                <div className="flex">
                  <dt className="w-20 text-text-secondary flex-shrink-0">住所</dt>
                  <dd className="text-text-primary">{facility.address}</dd>
                </div>
                <div className="flex">
                  <dt className="w-20 text-text-secondary flex-shrink-0">アクセス</dt>
                  <dd className="text-text-primary">{facility.nearestStation}駅から徒歩{facility.walkMinutes}分</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Right Sidebar - 2 columns */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-6">
              <h3 className="font-bold text-text-primary mb-4">予約</h3>

              {/* Date */}
              <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-1">日付</label>
                <input
                  type="date"
                  className="w-full border border-border rounded-lg px-3 py-2"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time */}
              <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-2">時間</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      className="py-2 px-3 border border-border rounded-lg text-sm hover:border-primary hover:text-primary transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* People */}
              <div className="mb-6">
                <label className="block text-sm text-text-secondary mb-1">人数</label>
                <select className="w-full border border-border rounded-lg px-3 py-2">
                  {Array.from({ length: facility.capacity }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}名</option>
                  ))}
                </select>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-border pt-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-text-secondary">基本料金（{facility.duration}分）</span>
                  <span className="text-text-primary">¥{facility.priceMin.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-text-secondary">オプション料金</span>
                  <span className="text-text-primary">¥0</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-text-primary">合計</span>
                  <span className="text-primary">¥{facility.priceMin.toLocaleString()}</span>
                </div>
                <p className="text-xs text-text-tertiary mt-1">消費税込み</p>
              </div>

              {/* CTA */}
              <a
                href={facility.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary block text-center w-full"
              >
                この内容で予約する
              </a>

              {/* Phone */}
              {facility.phone && (
                <a
                  href={`tel:${facility.phone}`}
                  className="mt-3 block text-center py-3 border border-border rounded-lg text-text-secondary hover:bg-gray-50 text-sm"
                >
                  電話で問い合わせる: {facility.phone}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Nearby Facilities */}
        {nearbyFacilities.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-primary">●</span>
              <h2 className="text-lg font-bold text-text-primary">このあたりなら、こっちもチェックしてみて</h2>
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
