'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Banknote, MapPin, User, Search } from 'lucide-react';
import { PREFECTURES } from '@/lib/types';

const PRICE_MAX = 30000;
const PRICE_STEP = 1000;

export default function HeroSearchForm() {
  const router = useRouter();
  const [rentalType, setRentalType] = useState('couple');
  const [priceMax, setPriceMax] = useState(PRICE_MAX);
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [guests, setGuests] = useState('2');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedPrefecture) params.set('prefecture', selectedPrefecture);
    if (guests) params.set('capacity', guests);
    if (rentalType === 'couple') params.set('coupleOk', 'true');
    if (priceMax < PRICE_MAX) params.set('priceMax', String(priceMax));
    router.push(`/search?${params.toString()}`);
  };

  const priceLabel = priceMax >= PRICE_MAX
    ? '上限なし'
    : `¥${priceMax.toLocaleString()}以下`;

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-lg px-4 py-5 md:px-10 md:py-8 max-w-3xl mx-auto">
      <div className="grid grid-cols-3 md:grid-cols-2 gap-2.5 md:gap-4">
        {/* Rental Type - full width on mobile */}
        <div className="col-span-3 md:col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
            <Users size={12} />
            貸切条件
          </label>
          <select
            value={rentalType}
            onChange={(e) => setRentalType(e.target.value)}
            className="h-11 md:h-12 bg-[#F8F9FA] border border-border rounded-lg px-4 text-text-primary text-sm"
          >
            <option value="couple">男女で利用可能</option>
            <option value="solo">一人利用</option>
            <option value="group">グループ利用</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="col-span-3 md:col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
            <Banknote size={12} />
            予算
            <span className="ml-auto text-saunako font-bold text-sm">{priceLabel}</span>
          </label>
          <div className="h-11 md:h-12 bg-[#F8F9FA] border border-border rounded-lg px-4 flex items-center gap-3">
            <span className="text-text-tertiary text-xs flex-shrink-0">¥0</span>
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full h-2 accent-saunako cursor-pointer"
            />
            <span className="text-text-tertiary text-xs flex-shrink-0">¥3万</span>
          </div>
        </div>

        {/* Area */}
        <div className="col-span-1 md:col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
            <MapPin size={12} />
            エリア
          </label>
          <select
            value={selectedPrefecture}
            onChange={(e) => setSelectedPrefecture(e.target.value)}
            className="h-11 md:h-12 bg-[#F8F9FA] border border-border rounded-lg px-2 md:px-4 text-text-primary text-sm"
          >
            <option value="">エリアを選択</option>
            {PREFECTURES.map((pref) => (
              <option key={pref.code} value={pref.code}>
                {pref.label}
              </option>
            ))}
          </select>
        </div>

        {/* Guests */}
        <div className="col-span-1 md:col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
            <User size={12} />
            人数
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="h-11 md:h-12 bg-[#F8F9FA] border border-border rounded-lg px-2 md:px-4 text-text-primary text-sm"
          >
            <option value="1">1人</option>
            <option value="2">2人</option>
            <option value="3">3人</option>
            <option value="4">4人</option>
            <option value="5">5人以上</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full mt-3 md:mt-4 h-12 md:h-[52px] bg-saunako text-white rounded-[10px] font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
      >
        <Search size={18} />
        この条件で検索する
      </button>
    </div>
  );
}
