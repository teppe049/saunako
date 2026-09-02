'use client';

import { useState } from 'react';
import type { AskAiTarget } from '@/lib/askAi';

interface Props {
  target: AskAiTarget;
  prompt: string;
  pageType: string;
  facilityId?: number;
}

// 「コピーしました」表示を消すまでの時間（新規タブに切り替わった後に残らない程度）
const COPIED_FEEDBACK_MS = 2500;

/**
 * AIサービスへ質問を渡すボタン。
 * URLプリフィル非対応（Gemini/Claude）のサービスは、クリック時にプロンプトをクリップボードへコピーしてから遷移する。
 * クリップボード書き込みは遷移をブロックしないよう待たない（ポップアップブロッカー回避のため <a> の既定遷移を使う）。
 */
export default function AskAiButton({ target, prompt, pageType, facilityId }: Props) {
  const [copied, setCopied] = useState(false);

  function handleClick() {
    if (!target.needsClipboard) return;
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(prompt).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
      },
      () => {}
    );
  }

  return (
    <a
      href={target.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:border-primary hover:text-primary"
      data-track-click="ask_ai"
      data-track-service={target.service}
      data-track-page-type={pageType}
      data-track-facility-id={facilityId}
      title={target.needsClipboard ? '質問文をコピーして開きます。貼り付けて送信してください' : undefined}
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${SERVICE_DOT[target.service]}`} />
      {copied ? '質問文をコピーしました' : target.label}
    </a>
  );
}

// 各サービスのブランド色（識別用のドット）
const SERVICE_DOT: Record<AskAiTarget['service'], string> = {
  chatgpt: 'bg-emerald-500',
  gemini: 'bg-violet-500',
  claude: 'bg-orange-500',
  perplexity: 'bg-teal-500',
};
