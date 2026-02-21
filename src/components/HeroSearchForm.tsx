'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Banknote, MapPin, User, Search, Clock } from 'lucide-react';
import { PREFECTURES, AREA_GROUPS } from '@/lib/types';

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
  const [coupleOk, setCoupleOk] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [selectedLocation, setSelectedLocation] = useState('tokyo');
  const [guests, setGuests] = useState('2');
  const [duration, setDuration] = useState('');

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
    if (selectedLocation) {
      const [pref, area] = selectedLocation.split(':');
      if (pref) params.set('prefecture', pref);
      if (area) params.set('area', area);
    }
    if (guests) params.set('capacity', guests);
    if (coupleOk) params.set('coupleOk', 'true');
    if (duration) params.set('duration', duration);
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
        {/* Area - full width */}
        <div className="col-span-3 md:col-span-1 flex flex-col gap-1.5">
          <label htmlFor="hero-area" className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
            <MapPin size={12} />
            エリア
          </label>
          <select
            id="hero-area"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="h-11 md:h-12 bg-[#F8F9FA] border border-border rounded-lg px-4 text-text-primary text-sm"
          >
            <option value="">全国</option>
            {PREFECTURES.map((pref) => (
              <optgroup key={pref.code} label={pref.label}>
                <option value={pref.code}>{pref.label} すべて</option>
                {(AREA_GROUPS[pref.code] || []).map((group) => (
                  <option key={group.slug} value={`${pref.code}:${group.slug}`}>
                    {group.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Price Range - full width */}
        <div className="col-span-3 md:col-span-1 flex flex-col gap-1.5">
          <label htmlFor="hero-price-min" className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
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
                id="hero-price-min"
                aria-label="最低予算"
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
                aria-label="最高予算"
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

        {/* Guests */}
        <div className="col-span-1 flex flex-col gap-1.5">
          <label htmlFor="hero-guests" className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
            <User size={12} />
            人数
          </label>
          <select
            id="hero-guests"
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

        {/* Duration */}
        <div className="col-span-1 flex flex-col gap-1.5">
          <label htmlFor="hero-duration" className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
            <Clock size={12} />
            利用時間
          </label>
          <select
            id="hero-duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="h-11 md:h-12 bg-[#F8F9FA] border border-border rounded-lg px-2 md:px-4 text-text-primary text-sm"
          >
            <option value="">指定なし</option>
            <option value="60">60分</option>
            <option value="90">90分</option>
            <option value="120">120分</option>
            <option value="180">180分</option>
          </select>
        </div>

        {/* Couple OK toggle */}
        <div className="col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
            <Users size={12} />
            こだわり
          </label>
          <button
            type="button"
            onClick={() => setCoupleOk(!coupleOk)}
            className={`h-11 md:h-12 rounded-lg px-2 md:px-4 text-sm font-medium transition-colors border ${
              coupleOk
                ? 'bg-primary text-white border-primary'
                : 'bg-[#F8F9FA] text-text-primary border-border hover:border-primary'
            }`}
          >
            男女OK
          </button>
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
