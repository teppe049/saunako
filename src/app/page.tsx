import Link from 'next/link';
import Header from '@/components/Header';
import FacilityCard from '@/components/FacilityCard';
import { getPopularFacilities } from '@/lib/facilities';
import { PREFECTURES } from '@/lib/types';

export default function Home() {
  const popularFacilities = getPopularFacilities(6);

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      {/* Hero Section */}
      <section className="bg-surface py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-text-primary mb-4">
            あなたの「整い」を、私が見つける
          </h1>
          <p className="text-text-secondary mb-8">
            プライベートサウナ専門の比較・予約サービス
          </p>

          {/* Saunako Comment */}
          <div className="saunako-comment inline-block mb-8">
            <span className="text-saunako">●</span>
            <span className="ml-2 text-text-secondary">
              今日はどんなサウナをお探し？下の条件を選んで、ぴったりの施設を見つけよう！
            </span>
          </div>

          {/* Search Form */}
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">日付</label>
                <input
                  type="date"
                  className="w-full border border-border rounded-lg px-3 py-2"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">エリア</label>
                <select className="w-full border border-border rounded-lg px-3 py-2">
                  <option value="">選択してください</option>
                  {PREFECTURES.map((pref) => (
                    <option key={pref.code} value={pref.code}>
                      {pref.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">人数</label>
                <select className="w-full border border-border rounded-lg px-3 py-2">
                  <option value="2">2名</option>
                  <option value="1">1名</option>
                  <option value="3">3名</option>
                  <option value="4">4名以上</option>
                </select>
              </div>
            </div>
            <button className="btn-primary w-full">この条件で検索する</button>
          </div>
        </div>
      </section>

      {/* Popular Facilities */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">人気の施設</h2>
            <Link href="/area/tokyo" className="text-primary text-sm hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
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
