/**
 * IndexNow - Bing/Yandex へのインデックス通知スクリプト
 *
 * 使い方:
 *   node scripts/indexnow.mjs              # サイトマップ全URLを通知
 *   node scripts/indexnow.mjs /articles/new-post  # 特定URLのみ通知
 */

const SITE_URL = 'https://saunako.jp';
const API_KEY = '4ea9e7ee1a314dfea2b69dbd063b5875';

async function submitToIndexNow(urlList) {
  const body = {
    host: 'saunako.jp',
    key: API_KEY,
    keyLocation: `${SITE_URL}/${API_KEY}.txt`,
    urlList: urlList.map((path) => `${SITE_URL}${path}`),
  };

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  if (res.ok || res.status === 202) {
    console.log(`IndexNow: ${urlList.length}件のURLを送信しました (status: ${res.status})`);
  } else {
    const text = await res.text();
    console.error(`IndexNow エラー: ${res.status} ${text}`);
  }
}

// 引数でURLを指定した場合はそれだけ送信
const args = process.argv.slice(2);
if (args.length > 0) {
  await submitToIndexNow(args);
} else {
  // サイトマップから全URL取得
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(SITE_URL, ''));

  console.log(`サイトマップから${urls.length}件のURLを検出`);

  // IndexNow は1回のリクエストで最大10,000件
  await submitToIndexNow(urls);
}
