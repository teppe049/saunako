'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Search, X, LocateFixed } from 'lucide-react';
import {
  AREA_OPTIONS, LOCATION_OPTIONS,
  type SearchOption,
} from '@/lib/search-options';

interface HeroLocationInputProps {
  selected: SearchOption | null;
  onSelect: (option: SearchOption | null) => void;
}

export default function HeroLocationInput({ selected, onSelect }: HeroLocationInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const comboRef = useRef<HTMLDivElement>(null);
  const listboxId = 'hero-area-listbox';

  const filtered = useMemo(() => {
    if (!query) return [];
    const queryLower = query.toLowerCase();

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

    const locationResults: SearchOption[] = LOCATION_OPTIONS.filter(
      (o) => o.label.includes(query) || o.label.toLowerCase().includes(queryLower)
    )
      .sort((a, b) => {
        const aPrefix = a.label.startsWith(query) ? 2 : a.label.includes(query) ? 1 : 0;
        const bPrefix = b.label.startsWith(query) ? 2 : b.label.includes(query) ? 1 : 0;
        if (aPrefix !== bPrefix) return bPrefix - aPrefix;
        return a.label.length - b.label.length;
      })
      .slice(0, 5)
      .map((o) => ({ type: 'location' as const, data: o }));

    return [...areaResults, ...locationResults].slice(0, 10);
  }, [query]);

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
    if (selected) onSelect(null);
    setIsOpen(val.length > 0);
    setActiveIndex(-1);
    if (geoStatus === 'error') setGeoStatus('idle');
  };

  const handleSelect = (option: SearchOption) => {
    onSelect(option);
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
    onSelect(null);
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
        onSelect({
          type: 'location',
          data: { label: '現在地', lat: latitude, lng: longitude },
        });
        setQuery('現在地');
      },
      () => {
        setGeoStatus('error');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-text-tertiary flex items-center gap-1.5">
        <MapPin size={12} />
        場所から探す
      </span>

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
  );
}
