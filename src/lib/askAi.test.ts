import { describe, expect, it } from 'vitest';
import { buildAskAiPrompt, buildAskAiTargets, SITE_URL } from './askAi';

describe('buildAskAiPrompt', () => {
  it('施設文脈では施設ページURLと llms.txt を含む', () => {
    const prompt = buildAskAiPrompt({
      kind: 'facility',
      id: 147,
      name: 'テストサウナ',
      prefectureLabel: '東京都',
      city: '豊島区',
    });
    expect(prompt).toContain('テストサウナ');
    expect(prompt).toContain('東京都豊島区');
    expect(prompt).toContain(`${SITE_URL}/facilities/147`);
    expect(prompt).toContain(`${SITE_URL}/llms.txt`);
  });

  it('エリア文脈ではエリアページURLを含む', () => {
    const prompt = buildAskAiPrompt({ kind: 'area', prefecture: 'tokyo', prefectureLabel: '東京都' });
    expect(prompt).toContain(`${SITE_URL}/area/tokyo`);
    expect(prompt).toContain('東京都でおすすめ');
  });

  it('サイト文脈では llms-full.txt も含む', () => {
    const prompt = buildAskAiPrompt({ kind: 'site' });
    expect(prompt).toContain(`${SITE_URL}/llms-full.txt`);
  });
});

describe('buildAskAiTargets', () => {
  const prompt = 'サウナ子 について教えて';
  const targets = buildAskAiTargets(prompt);

  it('4サービス分を返す', () => {
    expect(targets.map((t) => t.service)).toEqual(['chatgpt', 'gemini', 'claude', 'perplexity']);
  });

  it('ChatGPT / Perplexity はプロンプトをURLエンコードして埋め込む', () => {
    const encoded = encodeURIComponent(prompt);
    const chatgpt = targets.find((t) => t.service === 'chatgpt')!;
    const perplexity = targets.find((t) => t.service === 'perplexity')!;
    expect(chatgpt.href).toBe(`https://chatgpt.com/?q=${encoded}&hints=search`);
    expect(chatgpt.needsClipboard).toBe(false);
    expect(perplexity.href).toBe(`https://www.perplexity.ai/search?q=${encoded}`);
    expect(perplexity.needsClipboard).toBe(false);
  });

  it('Gemini / Claude はクリップボード経由で、URLにプロンプトを含めない', () => {
    for (const service of ['gemini', 'claude'] as const) {
      const t = targets.find((x) => x.service === service)!;
      expect(t.needsClipboard).toBe(true);
      expect(t.href).not.toContain('q=');
    }
  });
});
