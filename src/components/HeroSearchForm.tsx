'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Banknote, MapPin, User, Search, Clock, X, LocateFixed } from 'lucide-react';
import {
  PRICE_MIN, PRICE_MAX, PRICE_STEP,
  AREA_OPTIONS, LOCATION_OPTIONS,
  formatPrice,
  type SearchOption,
} from '@/lib/search-options';

export default function HeroSearchForm() {
  const router = useRouter();
  const [coupleOk, setCoupleOk] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [guests, setGuests] = useState('2');
  const [duration, setDuration] = useState('');

  // Combobox state
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SearchOption | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const comboRef = useRef<HTMLDivElement>(null);
  const listboxId = 'hero-area-listbox';

  // Geolocation state
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const filtered = useMemo(() => {
    if (!query) return [];

    const queryLower = query.toLowerCase();

    // Search area options
    const areaResults: SearchOption[] = AREA_OPTIONS.filter(
      (o) =>
        o.label.includes(query) ||
        o.subtitle.includes(query) ||
        o.reading.includes(query) ||
        o.cities.includes(query)
    )
      .sort((a, b) => {
        const aPrefix = a.label.startsWith(query) || a.reading.startsWith(query) ? 1 : 0;
        const bPrefix = b.label.startsWith(query) || b.reading.startsWith(query) ? 1 : 0;
        if (aPrefix !== bPrefix) return bPrefix - aPrefix;
        return b.weight - a.weight;
      })
      .slice(0, 5)
      .map((o) => ({ type: 'area' as const, data: o }));

    // Search location options (station/place names)
    const locationResults: SearchOption[] = LOCATION_OPTIONS.filter(
      (o) => o.label.includes(query) || o.label.toLowerCase().includes(queryLower)
    )
      .sort((a, b) => {
        // Prefer exact prefix match
        const aPrefix = a.label.startsWith(query) ? 2 : a.label.includes(query) ? 1 : 0;
        const bPrefix = b.label.startsWith(query) ? 2 : b.label.includes(query) ? 1 : 0;
        if (aPrefix !== bPrefix) return bPrefix - aPrefix;
        // Shorter labels first (more specific)
        return a.label.length - b.label.length;
      })
      .slice(0, 5)
      .map((o) => ({ type: 'location' as const, data: o }));

    // Merge: area options first, then location options, max 10
    return [...areaResults, ...locationResults].slice(0, 10);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (selected) setSelected(null);
    setIsOpen(val.length > 0);
    setActiveIndex(-1);
    // Clear geolocation error when user types
    if (geoStatus === 'error') setGeoStatus('idle');
  };

  const handleSelect = (option: SearchOption) => {
    setSelected(option);
    if (option.type === 'area') {
      const areaData = option.data;
      setQuery(areaData.subtitle ? `${areaData.label}（${areaData.subtitle}）` : areaData.label);
    } else {
      setQuery(option.data.label);
    }
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    setSelected(null);
    setIsOpen(false);
    setActiveIndex(-1);
    setGeoStatus('idle');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filtered.length === 0) {
      if (e.key === 'ArrowDown' && query && filtered.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          handleSelect(filtered[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeoStatus('idle');
        const params = new URLSearchParams();
        params.set('lat', String(latitude));
        params.set('lng', String(longitude));
        params.set('locationName', '現在地');
        // Add filter conditions
        if (guests) params.set('capacity', guests);
        if (coupleOk) params.set('coupleOk', 'true');
        if (duration) params.set('duration', duration);
        if (priceRange[0] > PRICE_MIN) params.set('priceMin', String(priceRange[0]));
        if (priceRange[1] < PRICE_MAX) params.set('priceMax', String(priceRange[1]));
        router.push(`/search?${params.toString()}`);
      },
      () => {
        setGeoStatus('error');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

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
    if (selected) {
      if (selected.type === 'area') {
        params.set('prefecture', selected.data.prefecture);
        if (selected.data.area) params.set('area', selected.data.area);
      } else {
        params.set('lat', String(selected.data.lat));
        params.set('lng', String(selected.data.lng));
        params.set('locationName', selected.data.label);
      }
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
      {/* Section: 場所から探す */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
          <MapPin size={12} />
          場所から探す
        </span>

        {/* Location combobox */}
        <div ref={comboRef}>
          <div className="relative">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-text-tertiary pointer-events-none" />
              <input
                id="hero-area"
                type="text"
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-activedescendant={activeIndex >= 0 ? `hero-area-option-${activeIndex}` : undefined}
                autoComplete="off"
                placeholder="駅名・地名で検索（例: 新橋、渋谷、大阪）"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (query && !selected) setIsOpen(true); }}
                className="h-11 md:h-12 w-full bg-[#F8F9FA] border border-border rounded-lg pl-9 pr-9 text-text-primary text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2.5 text-text-tertiary hover:text-text-primary p-0.5"
                  aria-label="クリア"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {isOpen && filtered.length > 0 && (
              <ul
                id={listboxId}
                role="listbox"
                className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {filtered.map((option, i) => (
                  <li
                    key={
                      option.type === 'area'
                        ? `area-${option.data.prefecture}-${option.data.area ?? 'all'}`
                        : `loc-${option.data.label}`
                    }
                    id={`hero-area-option-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer ${
                      i === activeIndex ? 'bg-primary/10 text-primary' : 'text-text-primary hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {option.type === 'location' && (
                        <MapPin size={12} className="text-text-tertiary flex-shrink-0" />
                      )}
                      {option.type === 'area' ? option.data.label : option.data.label}
                    </span>
                    <span className="text-xs text-text-tertiary ml-2">
                      {option.type === 'area'
                        ? option.data.subtitle || 'エリア'
                        : '駅・地名'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Current location button */}
        <button
          type="button"
          onClick={handleGeolocation}
          disabled={geoStatus === 'loading'}
          className={`flex items-center justify-center gap-1.5 h-10 rounded-lg border text-sm font-medium transition-colors ${
            geoStatus === 'loading'
              ? 'border-border text-text-tertiary cursor-wait'
              : 'border-border text-text-primary hover:border-primary hover:text-primary cursor-pointer'
          }`}
        >
          <LocateFixed size={14} />
          {geoStatus === 'loading' ? '位置情報を取得中...' : '現在地から探す'}
        </button>

        {geoStatus === 'error' && (
          <p className="text-xs text-red-500">位置情報を取得できませんでした</p>
        )}
      </div>

      {/* Divider */}
      <div className="border-b border-border/50 my-4" />

      {/* Section: 条件から探す */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-text-tertiary">
          条件から探す
        </span>

        <div className="grid grid-cols-3 md:grid-cols-2 gap-2.5 md:gap-4">
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
