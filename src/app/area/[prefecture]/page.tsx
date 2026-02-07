import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import FacilityCard from '@/components/FacilityCard';
import { getFacilitiesByPrefecture, getAllPrefectures } from '@/lib/facilities';
import { PREFECTURES } from '@/lib/types';

interface PageProps {
  params: Promise<{ prefecture: string }>;
}

export async function generateStaticParams() {
  const prefectures = getAllPrefectures();
  return prefectures.map((prefecture) => ({ prefecture }));
}

export async function generateMetadata({ params }: PageProps) {
  const { prefecture } = await params;
  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  if (!prefData) return { title: 'Not Found' };

  return {
    title: `${prefData.label}の個室サウナ一覧 | サウナ子`,
    description: `${prefData.label}の個室サウナを探すならサウナ子。料金・設備・アクセスを比較して、あなたにぴったりの施設を見つけよう。`,
  };
}

export default async function AreaPage({ params }: PageProps) {
  const { prefecture } = await params;
  const prefData = PREFECTURES.find((p) => p.code === prefecture);

  if (!prefData) {
    notFound();
  }

  const facilities = getFacilitiesByPrefecture(prefecture);

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-secondary mb-6">
          <a href="/" className="hover:text-primary">TOP</a>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{prefData.label}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {prefData.label}の個室サウナ一覧
          </h1>
          <p className="text-text-secondary">
            {facilities.length}件の施設が見つかりました
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button className="tag tag-primary">水風呂あり</button>
          <button className="tag bg-gray-100 text-text-secondary">ロウリュ可</button>
          <button className="tag bg-gray-100 text-text-secondary">外気浴あり</button>
          <button className="tag bg-gray-100 text-text-secondary">カップルOK</button>
        </div>

        {/* Facility List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
        </div>

        {facilities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary">このエリアには施設がありません</p>
          </div>
        )}
      </main>
    </div>
  );
}
