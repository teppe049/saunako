'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banknote, Search, Clock } from 'lucide-react';
import {
  PRICE_MIN, PRICE_MAX, PRICE_STEP,
  formatPrice,
  type SearchOption,
} from '@/lib/search-options';
import HeroLocationInput from '@/components/HeroLocationInput';

type Who = 'solo' | 'couple' | 'group';

export default function HeroSearchForm() {
  const router = useRouter();
  const [who, setWho] = useState<Who>('couple');
  const [groupSize, setGroupSize] = useState('2');
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [selected, setSelected] = useState<SearchOption | null>(null);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPriceRange(([, max]) => [Math.min(val, max - PRICE_STEP), max]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setPriceRange(([min]) => [min, Math.max(val, min + PRICE_STEP)]);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selected) {
      switch (selected.type) {
        case 'area':
          params.set('prefecture', selected.data.prefecture);
          if (selected.data.area) params.set('area', selected.data.area);
          break;
        case 'station':
        case 'location':
          params.set('lat', String(selected.data.lat));
          params.set('lng', String(selected.data.lng));
          params.set('locationName', selected.data.label);
          break;
        // facility: HeroLocationInput で直接遷移するためここには来ない
      }
    }
    // 「誰と」→ フィルタパラメータ変換
    if (who === 'solo') {
      params.set('capacity', '1');
    } else if (who === 'couple') {
      params.set('capacity', '2');
      params.set('coupleOk', 'true');
    } else {
      params.set('capacity', groupSize);
    }
    if (startTime) params.set('openAt', startTime);
    if (duration) params.set('duration', duration);
    if (priceRange[0] > PRICE_MIN) params.set('priceMin', String(priceRange[0]));
    if (priceRange[1] < PRICE_MAX) params.set('priceMax', String(priceRange[1]));
    router.push(`/search?${params.toString()}`);
  };

  const priceLabel = priceRange[0] === PRICE_MIN && priceRange[1] === PRICE_MAX
    ? '指定なし'
    : `${formatPrice(priceRange[0])}〜${priceRange[1] >= PRICE_MAX ? '上限なし' : formatPrice(priceRange[1])}`;

  const minPercent = ((priceRange[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPercent = ((priceRange[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const whoOptions: { key: Who; label: string }[] = [
    { key: 'solo', label: 'ひとりで' },
    { key: 'couple', label: 'カップルで' },
    { key: 'group', label: '友達・グループと' },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-lg px-4 py-5 md:px-10 md:py-8 max-w-3xl mx-auto">
      {/* Section 1: 誰と？ */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-text-tertiary">
          誰と行く？
        </span>
        <div className="grid grid-cols-3 gap-2">
          {whoOptions.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={who === key}
              onClick={() => setWho(key)}
              className={`h-11 md:h-12 rounded-lg text-sm font-medium transition-colors border ${
                who === key
                  ? 'bg-primary text-white border-primary'
                  : 'bg-[#F8F9FA] text-text-primary border-border hover:border-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {who === 'group' && (
          <select
            aria-label="人数"
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
            className="h-11 md:h-12 bg-[#F8F9FA] border border-border rounded-lg px-4 text-text-primary text-sm"
          >
            <option value="2">2人</option>
            <option value="3">3人</option>
            <option value="4">4人</option>
            <option value="5">5人以上</option>
          </select>
        )}
      </div>

      {/* Divider */}
      <div className="border-b border-border/50 my-4" />

      {/* Section 2: どこで？ */}
      <HeroLocationInput selected={selected} onSelect={setSelected} />

      {/* Divider */}
      <div className="border-b border-border/50 my-4" />

      {/* Section 3: いつ？ */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
          <Clock size={12} />
          いつ？
        </span>
        <div className="grid grid-cols-2 gap-2.5 md:gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hero-start-time" className="text-xs font-semibold text-text-tertiary">
              何時から
            </label>
            <select
              id="hero-start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="h-11 md:h-12 bg-[#F8F9FA] border border-border rounded-lg px-2 md:px-4 text-text-primary text-sm"
            >
              <option value="">指定なし</option>
              {Array.from({ length: 14 }, (_, i) => i + 10).map((h) => (
                <option key={h} value={String(h)}>{h}:00</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hero-duration" className="text-xs font-semibold text-text-tertiary">
              何分利用
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
        </div>
        {startTime && (
          <p className="text-[11px] text-text-tertiary">※営業時間内の施設を表示します（空室は各施設サイトで確認）</p>
        )}
      </div>

      {/* Divider */}
      <div className="border-b border-border/50 my-4" />

      {/* Section 4: いくら？ */}
      <div className="flex flex-col gap-2">
        <label htmlFor="hero-price-min" className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
          <Banknote size={12} />
          いくら？
          <span className="ml-auto text-saunako font-bold text-sm">{priceLabel}</span>
        </label>
        <div className="h-11 md:h-12 bg-[#F8F9FA] border border-border rounded-lg px-4 flex items-center gap-3">
          <span className="text-text-tertiary text-xs flex-shrink-0">¥0</span>
          <div className="relative w-full h-6 flex items-center">
            <div className="absolute w-full h-1.5 bg-gray-200 rounded-full" />
            <div
              className="absolute h-1.5 bg-saunako rounded-full"
              style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
            />
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

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full mt-4 md:mt-5 h-12 md:h-[52px] bg-saunako text-white rounded-[10px] font-semibold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
      >
        <Search size={18} />
        この条件で検索する
      </button>
    </div>
  );
}
