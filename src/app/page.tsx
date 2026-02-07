import Link from 'next/link';
import Header from '@/components/Header';
import FacilityCard from '@/components/FacilityCard';
import HeroSearchForm from '@/components/HeroSearchForm';
import { getPopularFacilities, getFacilitiesByPrefecture } from '@/lib/facilities';

export default function Home() {
  // サウナ子のピックアップ施設（特徴のある施設を選定）
  const allFacilities = getPopularFacilities(30);
  const pickupFacilities = allFacilities
    .filter((f) => f.features.waterBath && f.features.selfLoyly && f.priceMin > 0)
    .slice(0, 4);

  // エリア別の施設数
  const tokyoFacilities = getFacilitiesByPrefecture('tokyo');
  const osakaFacilities = getFacilitiesByPrefecture('osaka');

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      {/* Hero Section */}
      <section className="bg-saunako-bg py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 text-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6 leading-tight">
            あなたにぴったりの個室サウナ、
            <br className="hidden sm:block" />
            見つけよう
          </h1>
          <p className="text-text-secondary mb-10 text-lg">
            プライベートサウナ専門の比較・予約サービス
          </p>

          {/* Search Form */}
          <HeroSearchForm />
        </div>
      </section>

      {/* Popular Areas Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">
            人気エリア
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tokyo Card */}
            <Link
              href="/area/tokyo"
              className="card p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
                <span className="text-2xl">🗼</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-text-primary">東京</h3>
                <p className="text-text-secondary">
                  {tokyoFacilities.length}件の施設
                </p>
              </div>
              <span className="ml-auto text-primary">→</span>
            </Link>

            {/* Osaka Card */}
            <Link
              href="/area/osaka"
              className="card p-6 hover:shadow-lg transition-shadow flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center">
                <span className="text-2xl">🏯</span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-text-primary">大阪</h3>
                <p className="text-text-secondary">
                  {osakaFacilities.length}件の施設
                </p>
              </div>
              <span className="ml-auto text-primary">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Saunako Pickup Section */}
      <section className="py-12 sm:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-primary text-2xl">●</span>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              サウナ子のおすすめ
            </h2>
          </div>
          <p className="text-text-secondary mb-8">
            水風呂とセルフロウリュが楽しめる、こだわりの施設をピックアップ
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pickupFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        </div>
      </section>

      {/* About Saunako Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="card p-8 sm:p-12 text-center bg-saunako-bg border-saunako-border">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl font-bold">子</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">
              サウナ子について
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
              サウナ子は、あなたにぴったりの個室サウナを見つけるお手伝いをします。
              <br className="hidden sm:block" />
              水風呂の温度、ロウリュの有無、外気浴スペースなど、
              <br className="hidden sm:block" />
              サウナ好きが気になるポイントを徹底比較。
              <br className="hidden sm:block" />
              「今日はどんな整いを求めていますか？」
              <br className="hidden sm:block" />
              あなたの理想のサウナ体験を一緒に探しましょう。
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-primary text-xl">●</span>
            <span className="font-bold">サウナ子</span>
          </div>
          <p className="text-text-tertiary text-sm mb-6">
            あなたの「整い」を見つける、プライベートサウナ専門の比較・予約サービス
          </p>
          <div className="border-t border-gray-700 pt-6">
            <p className="text-text-tertiary text-sm">
              © 2026 サウナ子 All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
