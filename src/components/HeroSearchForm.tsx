'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Banknote, MapPin, User, Search } from 'lucide-react';
import { PREFECTURES } from '@/lib/types';

const PRICE_MIN = 0;
const PRICE_MAX = 30000;
const PRICE_STEP = 1000;

function formatPrice(v: number) {
  if (v >= PRICE_MAX) return '¥30,000';
  if (v === 0) return '¥0';
  return `¥${v.toLocaleString()}`;
}

export default function HeroSearchForm() {
  const router = useRouter();
  const [rentalType, setRentalType] = useState('couple');
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [guests, setGuests] = useState('2');

  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPriceRange(([, max]) => [Math.min(val, max - PRICE_STEP), max]);
  }, []);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPriceRange(([min]) => [min, Math.max(val, min + PRICE_STEP)]);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedPrefecture) params.set('prefecture', selectedPrefecture);
    if (guests) params.set('capacity', guests);
    if (rentalType === 'couple') params.set('coupleOk', 'true');
    if (priceRange[0] > PRICE_MIN) params.set('priceMin', String(priceRange[0]));
    if (priceRange[1] < PRICE_MAX) params.set('priceMax', String(priceRange[1]));
    router.push(`/search?${params.toString()}`);
  };

  const priceLabel = priceRange[0] === PRICE_MIN && priceRange[1] === PRICE_MAX
    ? '指定なし'
    : `${formatPrice(priceRange[0])}〜${priceRange[1] >= PRICE_MAX ? '上限なし' : formatPrice(priceRange[1])}`;

  // Calculate track fill percentage
  const minPercent = ((priceRange[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPercent = ((priceRange[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

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

        {/* Price Range - dual thumb */}
        <div className="col-span-3 md:col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
            <Banknote size={12} />
            予算
            <span className="ml-auto text-saunako font-bold text-sm">{priceLabel}</span>
          </label>
          <div className="h-11 md:h-12 bg-[#F8F9FA] border border-border rounded-lg px-4 flex items-center gap-3">
            <span className="text-text-tertiary text-xs flex-shrink-0">¥0</span>
            <div className="relative w-full h-6 flex items-center">
              {/* Track background */}
              <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
              {/* Active track */}
              <div
                className="absolute h-1.5 bg-saunako rounded-full"
                style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
              />
              {/* Min thumb */}
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={priceRange[0]}
                onChange={handleMinChange}
                className="dual-range-thumb absolute w-full"
              />
              {/* Max thumb */}
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={priceRange[1]}
                onChange={handleMaxChange}
                className="dual-range-thumb absolute w-full"
              />
            </div>
            <span className="text-text-tertiary text-xs flex-shrink-0">¥30,000</span>
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
