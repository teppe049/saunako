'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { subscribe, getSnapshot, getServerSnapshot, removePick, MAX_PICK } from '@/lib/pickStore';
import { buildPickPath, MAX_PICK_MESSAGE } from '@/lib/pick';

// 共有URLは本番ドメインで固定する（ローカル・プレビューのURLを相手に送っても開けないため）
const SITE_URL = 'https://www.saunako.jp';

interface PickSendSheetProps {
  onClose: () => void;
}

/**
 * 候補を1URLにして送るボトムシート。
 * ひとことは URL の ?m= に載せるだけ（BEなし）。受け取った側は /pick/[ids] で見る。
 */
export default function PickSendSheet({ onClose }: PickSendSheetProps) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // 候補が全部消えたら閉じる
  useEffect(() => {
    if (items.length === 0) onClose();
  }, [items.length, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (items.length === 0) return null;

  const trimmed = message.trim();
  const path = buildPickPath(items.map((i) => i.id));
  const shareUrl = `${SITE_URL}${path}${trimmed ? `?m=${encodeURIComponent(trimmed)}` : ''}`;
  const shareTitle = `どれがいい？ 個室サウナ ${items.length}件`;

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: trimmed || 'ここ行きたいんだよね。どれがいい？', url: shareUrl });
        return;
      }
      await copy();
    } catch {
      // user cancelled or clipboard unavailable
    }
  };

  const handleCopy = async () => {
    try {
      await copy();
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="候補を送る">
      <button type="button" className="absolute inset-0 bg-text-primary/45" aria-label="閉じる" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl px-4 pt-2 pb-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-h-[88vh] overflow-y-auto md:max-w-md md:mx-auto md:rounded-2xl md:bottom-8 flex flex-col gap-3.5">
        <div className="w-9 h-1 rounded-full bg-border self-center md:hidden" />

        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-text-primary">この{items.length}件を送る</h2>
          <span className="text-xs text-text-tertiary">最大{MAX_PICK}件</span>
        </div>

        <ul className="flex flex-col gap-2">
          {items.map((item, idx) => (
            <li key={item.id} className="flex items-center gap-2.5 p-2 border border-border rounded-xl bg-white">
              <span className="w-[22px] h-[22px] rounded-full bg-text-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {item.image && <Image src={item.image} alt="" fill sizes="44px" className="object-cover" />}
              </div>
              <span className="flex-1 min-w-0 text-sm font-semibold text-text-primary truncate">{item.name}</span>
              <button
                type="button"
                onClick={() => removePick(item.id)}
                className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:text-text-primary"
                aria-label={`${item.name}を候補から外す`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-text-secondary">ひとこと添える（任意）</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_PICK_MESSAGE}
            rows={2}
            placeholder="土曜の午後あたりで。水風呂あるとこがいいな〜"
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-bg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
          />
        </label>

        <div className="flex items-center gap-2.5 p-2.5 border border-border rounded-xl bg-bg">
          <div className="flex flex-shrink-0">
            {items.slice(0, 3).map((item, idx) => (
              <div
                key={item.id}
                className={`relative w-10 h-10 overflow-hidden bg-gray-200 ${idx === 0 ? 'rounded-l-md' : ''} ${idx === Math.min(items.length, 3) - 1 ? 'rounded-r-md' : ''}`}
              >
                {item.image && <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />}
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-[13px] font-semibold text-text-primary truncate">{shareTitle}</span>
            <span className="text-[11px] text-text-tertiary truncate">saunako.jp{path}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="h-12 rounded-lg bg-primary text-white text-[15px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            data-track-click="pick_share"
            data-track-count={items.length}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            メッセージで送る
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="h-11 rounded-lg bg-gray-100 text-text-secondary text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
            data-track-click="pick_copy"
            data-track-count={items.length}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                コピーしました
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth={2} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                リンクをコピー
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
