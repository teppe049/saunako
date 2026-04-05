'use client';

import { useSearchParams } from 'next/navigation';

type FilterKey = 'outdoorAir' | 'coupleOk' | 'open24h' | 'lateNight' | 'earlyMorning';

const filterLabels: Record<FilterKey, string> = {
  outdoorAir: '外気浴',
  coupleOk: '男女OK',
  open24h: '24時間',
  lateNight: '深夜',
  earlyMorning: '早朝',
};

const CHEVRON_SVG = (
  <svg
    className="pointer-events-none absolute right-2 w-3.5 h-3.5 text-text-tertiary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface MobileFilterSheetProps {
  filters: Record<FilterKey, boolean>;
  filteredCount: number;
  hasOrigin?: boolean;
  onToggleFilter: (key: FilterKey) => void;
  onSortChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onPriceMaxChange: (value: string) => void;
  onOpenAtChange: (value: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function MobileFilterSheet({
  filters,
  filteredCount,
  hasOrigin,
  onToggleFilter,
  onSortChange,
  onDurationChange,
  onPriceMaxChange,
  onOpenAtChange,
  onClearAll,
  onClose,
}: MobileFilterSheetProps) {
  const searchParams = useSearchParams();

  return (
    <div role="dialog" aria-modal="true" aria-label="フィルター" className="md:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-[slideUp_0.25s_ease-out] max-h-[85vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h2 className="text-base font-bold text-text-primary">条件で絞り込み</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 pb-8 flex-1">
          {/* Facility Features */}
          <div className="mb-6">
            <p className="text-[13px] font-medium text-text-tertiary mb-3">設備・条件</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(filters) as FilterKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => onToggleFilter(key)}
                  className={`px-4 py-3 rounded-lg text-[13px] font-medium transition-colors border text-center ${
                    filters[key]
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-text-secondary border-border'
                  }`}
                  data-track-click="filter_sheet_toggle"
                  data-track-filter={key}
                >
                  {filterLabels[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Sort + Duration + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[13px] font-medium text-text-tertiary mb-2" id="sort-label-mobile">並び順</p>
              <div className="relative">
                <select
                  aria-labelledby="sort-label-mobile"
                  value={searchParams.get('sort') || 'price_asc'}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 border border-border rounded-lg text-[13px] text-text-primary bg-white cursor-pointer"
                >
                  <option value="price_asc">安い順</option>
                  <option value="price_desc">高い順</option>
                  {hasOrigin && <option value="distance">近い順</option>}
                </select>
                {CHEVRON_SVG}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-text-tertiary mb-2" id="duration-label-mobile">利用時間</p>
              <div className="relative">
                <select
                  aria-labelledby="duration-label-mobile"
                  value={searchParams.get('duration') || ''}
                  onChange={(e) => onDurationChange(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 border border-border rounded-lg text-[13px] text-text-primary bg-white cursor-pointer"
                >
                  <option value="">すべて</option>
                  <option value="60">60分〜</option>
                  <option value="90">90分〜</option>
                  <option value="120">120分〜</option>
                  <option value="180">180分〜</option>
                </select>
                {CHEVRON_SVG}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-text-tertiary mb-2" id="openat-label-mobile">何時から</p>
              <div className="relative">
                <select
                  aria-labelledby="openat-label-mobile"
                  value={searchParams.get('openAt') || ''}
                  onChange={(e) => onOpenAtChange(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 border border-border rounded-lg text-[13px] text-text-primary bg-white cursor-pointer"
                >
                  <option value="">指定なし</option>
                  {Array.from({ length: 16 }, (_, i) => i + 7).map((h) => (
                    <option key={h} value={String(h)}>{h}:00</option>
                  ))}
                </select>
                {CHEVRON_SVG}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-medium text-text-tertiary mb-2" id="price-label-mobile">予算</p>
              <div className="relative">
                <select
                  aria-labelledby="price-label-mobile"
                  value={searchParams.get('priceMax') || ''}
                  onChange={(e) => onPriceMaxChange(e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 border border-border rounded-lg text-[13px] text-text-primary bg-white cursor-pointer"
                >
                  <option value="">すべて</option>
                  <option value="3000">〜3,000円</option>
                  <option value="5000">〜5,000円</option>
                  <option value="10000">〜10,000円</option>
                  <option value="15000">〜15,000円</option>
                  <option value="20000">〜20,000円</option>
                </select>
                {CHEVRON_SVG}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-border bg-white">
          <button
            onClick={onClearAll}
            className="text-[13px] font-medium text-text-tertiary hover:text-text-secondary transition-colors"
          >
            クリア
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-primary text-white text-[14px] font-bold transition-opacity hover:opacity-90"
          >
            {filteredCount}件を表示
          </button>
        </div>
      </div>
    </div>
  );
}
