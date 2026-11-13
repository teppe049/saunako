/**
 * saunako.jp の Cloudflare Worker。
 *
 * サイト本体は Next.js の静的書き出し（out/）で、静的ファイルに一致するリクエストは Worker を通らずに返る。
 * /go/* と /pick/* は wrangler.jsonc の run_worker_first で必ずここを通す（通さないとブラウザの画面遷移が 404.html になる）。
 * Worker が動くのは、一致するファイルが無いときだけ（無料プランの CPU 10ms に収めるため、ここでは重い処理をしない）:
 *
 * - /go/{id}?dest=booking … 施設の公式・予約サイトへ UTM 付きで 302（送客の計測導線）
 * - /pick/{ids}          … 旧形式の候補共有 URL を /pick?ids={ids} へ 301
 * - saunako.jp           … www.saunako.jp へ 308（静的ファイル分はゾーンのリダイレクトルールで転送する）
 * - それ以外             … 静的アセットに渡す（無ければ 404.html）
 */

import goTargets from './generated/go-targets.json';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

type GoTarget = { w: string | null; b: string | null };
const TARGETS = goTargets as Record<string, GoTarget>;

const CANONICAL_HOST = 'www.saunako.jp';

function handleGo(url: URL, id: string): Response {
  const target = TARGETS[id];
  if (!target) return Response.redirect(new URL('/', url).toString(), 302);

  const dest = url.searchParams.get('dest') === 'booking' && target.b ? target.b : target.w;
  if (!dest || !/^https?:\/\//.test(dest)) {
    return Response.redirect(new URL(`/facilities/${id}`, url).toString(), 302);
  }
  const out = new URL(dest);
  out.searchParams.set('utm_source', 'saunako');
  out.searchParams.set('utm_medium', 'referral');
  out.searchParams.set('utm_campaign', `facility_${id}`);
  return Response.redirect(out.toString(), 302);
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === 'saunako.jp') {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 308);
    }

    const go = url.pathname.match(/^\/go\/(\d+)\/?$/);
    if (go) return handleGo(url, go[1]);

    const pick = url.pathname.match(/^\/pick\/([\d,-]+)\/?$/);
    if (pick) {
      const next = new URL('/pick', url);
      next.searchParams.set('ids', pick[1]);
      const m = url.searchParams.get('m');
      if (m) next.searchParams.set('m', m);
      return Response.redirect(next.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
