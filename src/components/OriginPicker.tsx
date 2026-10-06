'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, MapPin, Search, X } from 'lucide-react';
import type { Origin } from '@/lib/originStore';
import type { StationOption } from '@/lib/search-options';

interface OriginPickerProps {
  value: Origin | null;
  onChange: (origin: Origin | null) => void;
  /** この都道府県の駅を先に並べる */
  prefecture?: string;
  /** 計測用（area / search） */
  pageType: string;
  /** ヘッダー内など狭い場所では短く出す */
  compact?: boolean;
}

/** 候補が多すぎると選びにくいので、検索語がないときに出す駅の上限 */
const DEFAULT_STATION_LIMIT = 30;

/**
 * 「どこから」チップと、駅・現在地を選ぶシート。
 * 駅データ（suggest-data.json）は初回に開いたときだけ読み込む（一覧ページの初期JSを増やさない）。
 */
export default function OriginPicker({ value, onChange, prefecture, pageType, compact = false }: OriginPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState<StationOption[] | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (!stations) {
      import('@/lib/search-options').then((m) => setStations(m.STATION_OPTIONS));
    }
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, stations]);

  const candidates = useMemo(() => {
    if (!stations) return [];
    const q = query.trim().replace(/駅$/, '');
    const list = q ? stations.filter((s) => s.label.includes(q)) : stations;
    return [...list]
      .sort((a, b) => {
        const pa = a.prefecture === prefecture ? 0 : 1;
        const pb = b.prefecture === prefecture ? 0 : 1;
        return pa - pb || b.facilityCount - a.facilityCount;
      })
      .slice(0, q ? 50 : DEFAULT_STATION_LIMIT);
  }, [stations, query, prefecture]);

  const choose = (origin: Origin | null) => {
    onChange(origin);
    setOpen(false);
    setQuery('');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoStatus('idle');
        choose({ label: '現在地', lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setGeoStatus('error'),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const chipLabel = value ? `${value.label}から` : 'どこから？';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        data-track-click="origin_open"
        data-track-page-type={pageType}
        className={`inline-flex items-center gap-1 rounded-full border font-bold transition-colors flex-shrink-0 ${
          compact ? 'px-2 py-1.5 text-xs md:px-2.5 md:text-[13px]' : 'tag'
        } ${value ? 'bg-primary-light text-primary-strong border-primary-light' : 'bg-white text-text-primary border-border hover:border-primary'}`}
      >
        <MapPin size={14} aria-hidden="true" className={compact ? 'hidden md:block' : ''} />
        <span className={compact ? 'max-w-24 md:max-w-40 truncate' : ''}>{chipLabel}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="どこから行く？"
            onClick={(e) => e.stopPropagation()}
            className="w-full md:max-w-md max-h-[85vh] flex flex-col bg-bg rounded-t-2xl md:rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
              <p className="font-bold text-text-primary">どこから行く？</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="閉じる" className="w-10 h-10 -mr-2 flex items-center justify-center text-text-secondary">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={geoStatus === 'loading'}
                data-track-click="origin_select"
                data-track-kind="geolocation"
                data-track-page-type={pageType}
                className="h-12 flex items-center gap-2 px-4 rounded-xl bg-surface border border-border font-bold text-text-primary disabled:opacity-60"
              >
                <LocateFixed size={18} className="text-primary-strong" aria-hidden="true" />
                {geoStatus === 'loading' ? '現在地を取得中…' : '現在地から探す'}
              </button>
              {geoStatus === 'error' && (
                <p className="text-xs text-primary-strong -mt-2">現在地を取得できなかったよ。駅から選んでね</p>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="origin-query" className="text-xs font-bold text-text-secondary">駅名で探す</label>
                <div className="h-12 flex items-center gap-2 px-3 rounded-xl bg-surface border border-border">
                  <Search size={16} className="text-text-tertiary" aria-hidden="true" />
                  <input
                    id="origin-query"
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="例：池袋、梅田、天神"
                    className="flex-1 bg-transparent outline-none text-base text-text-primary"
                  />
                </div>
              </div>

              <ul className="bg-surface border border-border rounded-xl divide-y divide-border">
                {!stations && <li className="px-4 py-3 text-sm text-text-tertiary">読み込み中…</li>}
                {stations && candidates.length === 0 && (
                  <li className="px-4 py-3 text-sm text-text-tertiary">見つからなかったよ。近くの大きな駅で試してみてね</li>
                )}
                {candidates.map((s) => (
                  <li key={`${s.prefecture}-${s.label}`}>
                    <button
                      type="button"
                      onClick={() => choose({ label: s.label, lat: s.lat, lng: s.lng })}
                      data-track-click="origin_select"
                      data-track-kind="station"
                      data-track-page-type={pageType}
                      className="w-full min-h-12 flex items-center justify-between px-4 py-2 text-left text-text-primary hover:bg-saunako-bg"
                    >
                      <span>{s.label}</span>
                      <span className="text-xs text-text-tertiary">近くに{s.facilityCount}件</span>
                    </button>
                  </li>
                ))}
              </ul>

              {value && (
                <button
                  type="button"
                  onClick={() => choose(null)}
                  data-track-click="origin_clear"
                  data-track-page-type={pageType}
                  className="h-11 rounded-xl border border-border bg-surface text-sm text-text-secondary"
                >
                  「{value.label}から」をやめる
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
