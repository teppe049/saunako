'use client';

import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { subscribe, getSnapshot, getServerSnapshot } from '@/lib/pickStore';
import PickSendSheet from '@/components/PickSendSheet';

interface PickTrayProps {
  /**
   * 固定位置のクラス。検索ページはボトムナビの上（既定）、
   * 施設ページはボトムナビが無い代わりに固定予約CTAバー（高さ80px）があるのでその上に載せる
   */
  offsetClass?: string;
}

/**
 * 行きたい候補が1件以上あるとき画面下部に固定表示されるバー。
 * サムネの重ね表示＋件数＋「送る」だけの1行構成にして、予約CTAと共存できる高さ(56px)に収める。
 */
export default function PickTray({ offsetClass = 'bottom-14 md:bottom-0' }: PickTrayProps) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (items.length === 0) return null;

  const names = items.map((i) => i.name).join('、');

  return (
    <>
      {/* fixed バーで隠れる分の余白（BottomNav と同じ手法） */}
      <div className="h-14" aria-hidden="true" />
      <div className={`fixed ${offsetClass} inset-x-0 z-40 bg-white border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.08)]`}>
        <div className="max-w-[1440px] mx-auto px-3 md:px-6 h-14 flex items-center gap-3">
          <div className="flex items-center flex-shrink-0">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`relative w-9 h-9 rounded-lg overflow-hidden bg-gray-200 border-2 border-white shadow-[0_0_0_1px_#E5E7EB] ${idx > 0 ? '-ml-2.5' : ''}`}
              >
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="36px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-text-tertiary px-0.5 text-center leading-tight">
                    {item.name.slice(0, 4)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-[13px] font-semibold text-text-primary">行きたい候補 {items.length}件</span>
            <span className="text-[11px] text-text-tertiary truncate">{names}</span>
          </div>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex-shrink-0 h-11 px-4 md:px-5 rounded-full bg-primary text-white text-[13px] md:text-sm font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            data-track-click="pick_send_open"
            data-track-count={items.length}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            送る
          </button>
        </div>
      </div>

      {sheetOpen && <PickSendSheet onClose={() => setSheetOpen(false)} />}
    </>
  );
}
