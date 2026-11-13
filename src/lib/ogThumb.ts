import { getCloudflareContext } from '@opennextjs/cloudflare';

/** 施設写真（/facilities/1-0.webp）に対応する OG 用 JPEG（/og-thumbs/1-0.jpg）。scripts/generate-og-thumbs.mjs が生成する */
export function ogThumbPath(image: string): string {
  const base = image.split('/').pop() ?? image;
  return `/og-thumbs/${base.replace(/\.[^.]+$/, '')}.jpg`;
}

/**
 * public/ 配下のファイルを取得する。見つからなければ null。
 *
 * Workers には public/ を読めるファイルシステムが無いので、静的アセットのバインディング（ASSETS）から取る。
 * `next dev` などバインディングが無い環境では、同じオリジンへの fetch で代わりにする。
 */
export async function fetchPublicFile(pathname: string, requestUrl: string): Promise<Response | null> {
  const url = new URL(pathname, requestUrl);
  let assets: { fetch: (input: URL) => Promise<Response> } | undefined;
  try {
    assets = (await getCloudflareContext({ async: true })).env.ASSETS;
  } catch {
    assets = undefined;
  }
  try {
    const res = assets ? await assets.fetch(url) : await fetch(url);
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

export async function readPublicAsDataUri(pathname: string, requestUrl: string, mime: string): Promise<string | null> {
  const res = await fetchPublicFile(pathname, requestUrl);
  if (!res) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${mime};base64,${buf.toString('base64')}`;
}
