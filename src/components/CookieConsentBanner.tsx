'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'saunako_cookie_consent';

type ConsentState = {
  consented: boolean;
  timestamp: string;
};

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // 少し遅延させてフェードインをスムーズに
        const timer = setTimeout(() => setVisible(true), 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage が使えない環境では表示しない
    }
  }, []);

  const handleAccept = () => {
    try {
      const state: ConsentState = {
        consented: true,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage 書き込み失敗は無視
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-[fadeSlideUp_0.4s_ease-out] pb-[env(safe-area-inset-bottom,0px)]"
      role="banner"
      aria-label="Cookie同意バナー"
    >
      <div className="mx-auto max-w-4xl px-4 pb-4">
        <div className="rounded-xl border border-border bg-surface/95 px-5 py-4 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="text-sm leading-relaxed text-text-secondary">
              当サイトではCookieを使用しています。サイトの利用を続けることで、Cookieの使用に同意したものとみなします。
              <Link
                href="/privacy"
                className="ml-1 text-primary underline underline-offset-2 hover:opacity-80"
              >
                プライバシーポリシー
              </Link>
            </p>
            <button
              onClick={handleAccept}
              className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              同意する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
