import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getFacilityBySlug, getAllSlugs } from '@/lib/facilities';
import FacilityDetailMapWrapper from '@/components/FacilityDetailMapWrapper';

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
    description: `${facility.name}の料金・設備・アクセス情報。${facility.nearestStation && facility.walkMinutes > 0 ? `${facility.nearestStation}${facility.nearestStation.endsWith('駅') ? '' : '駅'}から徒歩${facility.walkMinutes}分。` : ''}${facility.priceMin > 0 ? `${facility.priceMin.toLocaleString()}円〜` : '料金要問合せ'}`,
  };
}

export default async function FacilityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const facility = getFacilityBySlug(slug);

  if (!facility) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* 専用ヘッダー */}
      <header className="bg-surface shadow h-14 px-4 md:h-16 md:px-8">
        <div className="flex items-center justify-between h-full">
          {/* 左: 戻るボタン + ロゴ */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href={`/area/${facility.prefecture}`}
              className="flex items-center gap-1 text-text-secondary hover:text-text-primary rounded-lg p-2 md:px-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium hidden md:inline">戻る</span>
            </Link>
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

          {/* 右: 共有 + ブックマーク + ユーザーアイコン(PC only) */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm rounded-lg px-2 py-1.5 md:px-3 md:py-2"
              style={{ background: '#F0F0F0' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden md:inline">共有</span>
            </button>
            <button
              className="flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm rounded-lg px-2 py-1.5 md:px-3 md:py-2"
              style={{ background: '#F0F0F0' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="hidden md:inline">保存</span>
            </button>
            {/* ユーザーアイコン: PC only */}
            <div className="hidden md:block w-9 h-9 rounded-full bg-gray-300" />
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
              <div>
                {/* メイン画像: モバイル全幅240px角丸なし、PC padding内rounded */}
                <div className="relative h-60 md:h-96 bg-gray-200 rounded-none md:rounded-xl md:mt-0 flex items-center justify-center overflow-hidden">
                  {facility.images.length > 0 ? (
                    <img src={facility.images[0]} alt={facility.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-text-tertiary">No Image</span>
                  )}
                </div>
                {/* サムネイル: 画像がない場合は非表示 */}
                {facility.images.length > 1 && (
                  <div className="flex gap-1 md:gap-2 overflow-x-auto py-1 px-0 md:pb-2 md:pt-2">
                    {facility.images.map((img, i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 w-[60px] h-[60px] md:w-16 md:h-16 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                      >
                        <img src={img} alt={`${facility.name} ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                        {facility.nearestStation}{facility.nearestStation.endsWith('駅') ? '' : '駅'}から徒歩{facility.walkMinutes}分
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

              {/* c. Equipment Section */}
              <div className="bg-surface md:shadow md:rounded-xl md:mt-6 px-4 py-5 md:p-6">
                <div className="flex flex-col gap-4 md:gap-5">
                  <h2 className="text-text-primary text-base md:text-lg font-semibold">
                    設備・サービス
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🔥</span>
                      <p className="text-text-primary font-medium">フィンランド式サウナ</p>
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
                      <p className="text-text-primary font-medium">
                        {facility.features.outdoorAir ? '外気浴スペース' : '休憩スペース'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💨</span>
                      <p className="text-text-primary font-medium">
                        {facility.features.selfLoyly ? 'ロウリュサービス' : 'ロウリュなし'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🚿</span>
                      <p className="text-text-primary font-medium">シャワー室</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🪑</span>
                      <p className="text-text-primary font-medium">リクライニングチェア</p>
                    </div>
                  </div>
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
                    {facility.name}は、{facility.prefectureLabel}{facility.city}に位置する
                    プライベートサウナ施設です。{facility.nearestStation && facility.walkMinutes > 0 ? `${facility.nearestStation}${facility.nearestStation.endsWith('駅') ? '' : '駅'}から徒歩${facility.walkMinutes}分とアクセスも良好。` : ''}最大{facility.capacity}名まで利用可能で、
                    {facility.features.coupleOk ? 'カップルや友人同士での利用にもおすすめです。' : 'ゆったりとしたプライベート空間でサウナを楽しめます。'}
                  </p>
                </div>
              </div>

              {/* セクション区切り (モバイルのみ) */}
              <div className="h-2 bg-bg md:hidden" />

              {/* e. Notes Section */}
              <div
                className="md:mt-6 px-4 py-4 md:rounded-lg"
                style={{
                  background: '#FFF8F0',
                  border: 'none',
                }}
              >
                <div className="hidden md:block" style={{ border: '1px solid #FFE0CC', borderRadius: 8, padding: 16 }}>
                  {/* PC: カードスタイル */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      <h2 className="text-text-primary font-semibold">ご利用にあたっての注意事項</h2>
                    </div>
                    <ul className="space-y-2 text-text-secondary text-sm">
                      <li>・完全予約制（当日予約可）</li>
                      <li>・キャンセル：ご利用の前日18時まで無料</li>
                      <li>・飲食物の持ち込み可能</li>
                      <li>・最大収容人数：{facility.capacity}名</li>
                      <li>・キャンセル料発生時期まで無料</li>
                    </ul>
                  </div>
                </div>
                <div className="md:hidden">
                  {/* モバイル: 全幅フラット */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      <h2 className="text-text-primary font-semibold text-sm">ご利用にあたっての注意事項</h2>
                    </div>
                    <ul className="space-y-1.5 text-text-secondary text-xs leading-[1.5]">
                      <li>・完全予約制（当日予約可）</li>
                      <li>・キャンセル：ご利用の前日18時まで無料</li>
                      <li>・飲食物の持ち込み可能</li>
                      <li>・最大収容人数：{facility.capacity}名</li>
                      <li>・キャンセル料発生時期まで無料</li>
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
                  <h3 className="font-bold text-text-primary text-lg">予約・料金</h3>

                  {/* 料金情報 */}
                  {facility.priceMin > 0 ? (
                    <div className="flex items-baseline gap-1">
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
                  <a
                    href={facility.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full text-white font-semibold rounded-[10px] h-12 leading-[48px] md:h-[52px] md:leading-[52px]"
                    style={{
                      background: 'var(--saunako)',
                    }}
                  >
                    公式サイトで予約する →
                  </a>
                  <p className="text-xs text-text-tertiary text-center">
                    予約は施設の公式サイトで受け付けています
                  </p>
                </div>
              </div>

              {/* セクション区切り (モバイルのみ) */}
              <div className="h-2 bg-bg md:hidden" />

              {/* b. Saunako Comment */}
              <div className="bg-saunako-bg border-y border-saunako-border md:border md:rounded-xl md:mt-6 px-4 py-5 md:p-5">
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/saunako-avatar.png"
                      alt="サウナ子"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                    />
                    <h3 className="font-bold text-text-primary">サウナ子のおすすめポイント</h3>
                  </div>
                  <p className="text-text-secondary text-[13px] md:text-sm leading-[1.6] md:leading-[1.7]">
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

              {/* c. Access Info */}
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
                          ? `${facility.nearestStation}${facility.nearestStation.endsWith('駅') ? '' : '駅'}から徒歩${facility.walkMinutes}分`
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
    </div>
  );
}
