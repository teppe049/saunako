import { Sparkles } from 'lucide-react';
import { buildAskAiPrompt, buildAskAiTargets, type AskAiContext } from '@/lib/askAi';
import AskAiButton from './AskAiButton';

interface Props {
  context: AskAiContext;
  /** 見出し（未指定なら文脈に応じた既定文） */
  heading?: string;
  className?: string;
}

function defaultHeading(ctx: AskAiContext): string {
  switch (ctx.kind) {
    case 'facility':
      return `${ctx.name}についてAIに聞く`;
    case 'area':
      return `${ctx.prefectureLabel}の個室サウナをAIに聞く`;
    default:
      return 'サウナ子をもっと知る';
  }
}

/**
 * 「AIに聞く」セクション。
 * 普段使っているAIにサウナ子のページを参照させることで、AI検索経由の流入と引用を増やす。
 * Server Component。ボタンのみクリップボード操作のためクライアント化している。
 */
export default function AskAI({ context, heading, className = '' }: Props) {
  const prompt = buildAskAiPrompt(context);
  const targets = buildAskAiTargets(prompt);
  const facilityId = context.kind === 'facility' ? context.id : undefined;

  return (
    <section
      className={`rounded-xl border border-saunako-border bg-saunako-bg px-5 py-6 text-center md:px-8 md:py-8 ${className}`}
      aria-labelledby="ask-ai-heading"
    >
      <Sparkles className="mx-auto mb-2 h-6 w-6 text-saunako" aria-hidden="true" />
      <p className="mb-1 text-xs font-semibold tracking-widest text-saunako">ASK AI</p>
      <h2 id="ask-ai-heading" className="mb-2 text-lg font-bold text-text-primary md:text-xl">
        {heading ?? defaultHeading(context)}
      </h2>
      <p className="mx-auto mb-5 max-w-xl text-sm leading-relaxed text-text-secondary">
        普段使っているAIに、サウナ子のページを参考にして答えてもらえます。ボタンを押すだけで質問できます。
      </p>
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {targets.map((t) => (
          <AskAiButton
            key={t.service}
            target={t}
            prompt={prompt}
            pageType={context.kind}
            facilityId={facilityId}
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-text-tertiary">
        Gemini・Claudeは質問文をコピーして開きます。貼り付けて送信してください。
      </p>
    </section>
  );
}
