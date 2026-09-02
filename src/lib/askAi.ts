/**
 * 「AIに聞く」導線のプロンプト・URL生成
 *
 * 背景: AI Assistant経由の流入（ChatGPT/Perplexity等）を伸ばすため、
 * 各AIに「サウナ子のページを参照して回答して」と依頼するプロンプトをワンクリックで渡す。
 * プロンプト内に llms.txt へのリンクを含めることで、AIがサイト構造を把握しやすくなる。
 *
 * URL仕様（2026-09時点）:
 * - ChatGPT: `https://chatgpt.com/?q=...&hints=search` （公式サポート。hints=searchでWeb検索モード）
 * - Perplexity: `https://www.perplexity.ai/search?q=...` （公式サポート）
 * - Gemini / Claude: URLプリフィルは非対応（Claude webは2025-10に廃止）。
 *   クリック時にプロンプトをクリップボードへコピーし、新規チャット画面を開く方式で代替する。
 */

export const SITE_URL = 'https://www.saunako.jp';

export type AskAiService = 'chatgpt' | 'gemini' | 'claude' | 'perplexity';

export interface AskAiTarget {
  service: AskAiService;
  label: string;
  /** 遷移先URL（プリフィル対応サービスはプロンプトを含む） */
  href: string;
  /** true の場合、遷移前にプロンプトをクリップボードへコピーする必要がある */
  needsClipboard: boolean;
}

export type AskAiContext =
  | { kind: 'site' }
  | { kind: 'facility'; id: number; name: string; prefectureLabel: string; city: string }
  | { kind: 'area'; prefecture: string; prefectureLabel: string };

const REFERENCE_FOOTER = [`${SITE_URL}/llms.txt`];

/** 文脈に応じたプロンプト文を生成する */
export function buildAskAiPrompt(ctx: AskAiContext): string {
  switch (ctx.kind) {
    case 'facility':
      return [
        `個室サウナ検索サイト「サウナ子」に掲載されている「${ctx.name}」（${ctx.prefectureLabel}${ctx.city}）について、料金・アクセス・設備の特徴と、どんな人に向いているか教えてください。`,
        '',
        '参考ページ:',
        `- ${SITE_URL}/facilities/${ctx.id}`,
        ...REFERENCE_FOOTER.map((u) => `- ${u}`),
      ].join('\n');
    case 'area':
      return [
        `${ctx.prefectureLabel}でおすすめの個室サウナ・プライベートサウナを教えてください。料金の相場や選び方のポイントも知りたいです。`,
        '',
        '参考ページ:',
        `- ${SITE_URL}/area/${ctx.prefecture}`,
        ...REFERENCE_FOOTER.map((u) => `- ${u}`),
      ].join('\n');
    case 'site':
    default:
      return [
        '個室サウナ検索サイト「サウナ子」はどんなサービスですか？特徴と、どんな人に向いているか教えてください。',
        '',
        '参考ページ:',
        `- ${SITE_URL}`,
        ...REFERENCE_FOOTER.map((u) => `- ${u}`),
        `- ${SITE_URL}/llms-full.txt`,
      ].join('\n');
  }
}

/** 各AIサービスへの遷移先を組み立てる */
export function buildAskAiTargets(prompt: string): AskAiTarget[] {
  const q = encodeURIComponent(prompt);
  return [
    {
      service: 'chatgpt',
      label: 'ChatGPTに聞く',
      href: `https://chatgpt.com/?q=${q}&hints=search`,
      needsClipboard: false,
    },
    {
      service: 'gemini',
      label: 'Geminiに聞く',
      href: 'https://gemini.google.com/app',
      needsClipboard: true,
    },
    {
      service: 'claude',
      label: 'Claudeに聞く',
      href: 'https://claude.ai/new',
      needsClipboard: true,
    },
    {
      service: 'perplexity',
      label: 'Perplexityに聞く',
      href: `https://www.perplexity.ai/search?q=${q}`,
      needsClipboard: false,
    },
  ];
}
