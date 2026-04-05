'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X, LocateFixed, Train, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  AREA_OPTIONS, STATION_OPTIONS, FACILITY_OPTIONS, POPULAR_SHORTCUTS,
  type SearchOption,
} from '@/lib/search-options';

interface HeroLocationInputProps {
  selected: SearchOption | null;
  onSelect: (option: SearchOption | null) => void;
}

/** カタカナ��ひらがな変換 */
function kataToHira(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60)
  );
}

export default function HeroLocationInput({ selected, onSelect }: HeroLocationInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const comboRef = useRef<HTMLDivElement>(null);
  const listboxId = 'hero-area-listbox';

  const filtered = (() => {
    if (!query) return [];
    const q = query.toLowerCase();
    const qHira = kataToHira(q);

    // 1. 施設名マッチ
    const facilityResults: SearchOption[] = FACILITY_OPTIONS.filter(
      (f) => f.name.toLowerCase().includes(q)
    )
      .slice(0, 3)
      .map((f) => ({ type: 'facility' as const, data: f }));

    // 2. エリア（都道府県+サブエリア）マッチ
    const areaResults: SearchOption[] = AREA_OPTIONS.filter(
      (o) =>
        o.label.includes(query) ||
        o.subtitle.includes(query) ||
        o.reading.includes(qHira) ||
        o.cities.includes(query)
    )
      .sort((a, b) => {
        const aPrefix = a.label.startsWith(query) || a.reading.startsWith(qHira) ? 1 : 0;
        const bPrefix = b.label.startsWith(query) || b.reading.startsWith(qHira) ? 1 : 0;
        if (aPrefix !== bPrefix) return bPrefix - aPrefix;
        return b.weight - a.weight;
      })
      .slice(0, 4)
      .map((o) => ({ type: 'area' as const, data: o }));

    // 3. 駅名マッチ
    const stationResults: SearchOption[] = STATION_OPTIONS.filter(
      (s) => s.label.includes(query) || s.label.replace('駅', '').includes(query)
    )
      .sort((a, b) => b.facilityCount - a.facilityCount)
      .slice(0, 3)
      .map((s) => ({ type: 'station' as const, data: s }));

    return [...areaResults, ...stationResults, ...facilityResults].slice(0, 8);
  })();

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
    if (option.type === 'facility') {
      // 施���名選択 → 詳細ページへ直接遷移
      router.push(`/facilities/${option.data.id}`);
      return;
    }
    onSelect(option);
    if (option.type === 'area') {
      const d = option.data;
      setQuery(d.subtitle ? `${d.label}（${d.subtitle}）` : d.label);
    } else if (option.type === 'station') {
      setQuery(option.data.label);
    } else {
      setQuery(option.data.label);
    }
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleShortcut = (shortcut: typeof POPULAR_SHORTCUTS[number]) => {
    const matched = AREA_OPTIONS.find(
      (o) => o.prefecture === shortcut.prefecture && o.area === shortcut.area
    ) ?? AREA_OPTIONS.find(
      (o) => o.prefecture === shortcut.prefecture && !o.area
    );
    if (matched) {
      const option: SearchOption = { type: 'area', data: matched };
      onSelect(option);
      setQuery(matched.subtitle ? `${matched.label}（${matched.subtitle}）` : matched.label);
      setIsOpen(false);
    }
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

  const getOptionIcon = (option: SearchOption) => {
    switch (option.type) {
      case 'area': return <MapPin size={12} className="text-text-tertiary flex-shrink-0" />;
      case 'station': return <Train size={12} className="text-text-tertiary flex-shrink-0" />;
      case 'facility': return <Building2 size={12} className="text-text-tertiary flex-shrink-0" />;
      default: return <MapPin size={12} className="text-text-tertiary flex-shrink-0" />;
    }
  };

  const getOptionLabel = (option: SearchOption) => {
    switch (option.type) {
      case 'area': return option.data.label;
      case 'station': return `${option.data.label} 周辺`;
      case 'facility': return option.data.name;
      default: return option.data.label;
    }
  };

  const getOptionSublabel = (option: SearchOption) => {
    switch (option.type) {
      case 'area': {
        const d = option.data;
        const count = d.facilityCount > 0 ? `${d.facilityCount}施設` : '';
        return d.subtitle ? `${d.subtitle} ${count}` : count;
      }
      case 'station': return `${option.data.facilityCount}施設`;
      case 'facility': return option.data.city;
      default: return '';
    }
  };

  const getOptionKey = (option: SearchOption) => {
    switch (option.type) {
      case 'area': return `area-${option.data.prefecture}-${option.data.area ?? 'all'}`;
      case 'station': return `st-${option.data.prefecture}-${option.data.label}`;
      case 'facility': return `fac-${option.data.id}`;
      default: return `loc-${option.data.label}`;
    }
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
              placeholder="エリア・駅名・施設名で検索"
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
              className="absolute z-50 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-72 overflow-y-auto"
            >
              {filtered.map((option, i) => (
                <li
                  key={getOptionKey(option)}
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
                  <span className="flex items-center gap-1.5 min-w-0">
                    {getOptionIcon(option)}
                    <span className="truncate">{getOptionLabel(option)}</span>
                  </span>
                  <span className="text-xs text-text-tertiary ml-2 flex-shrink-0">
                    {getOptionSublabel(option)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 人気エリアショートカット */}
      <div className="flex flex-wrap gap-1.5">
        {POPULAR_SHORTCUTS.map((s) => (
          <button
            key={`${s.prefecture}-${s.area ?? 'all'}`}
            type="button"
            onClick={() => handleShortcut(s)}
            className="px-2.5 py-1 text-xs rounded-full border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            {s.label}
          </button>
        ))}
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
