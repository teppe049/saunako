import type { Facility } from './types';

/**
 * ブラウザ側で施設データを使うためのローダー。/facilities-data.json（ビルド時生成）を1回だけ取得して使い回す。
 * 閉店施設はファイルの時点で除いてある。
 */

const DATA_URL = '/facilities-data.json';

// お気に入り・閲覧履歴として受け付ける上限（不正に長い URL パラメータを弾く）
const MAX_IDS = 100;

let cache: Promise<Facility[]> | null = null;

export function loadFacilities(): Promise<Facility[]> {
  if (!cache) {
    cache = fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`${DATA_URL}: ${res.status}`);
        return res.json() as Promise<Facility[]>;
      })
      .catch((err) => {
        // 失敗を覚えたままにすると、次の画面でも取得し直せなくなる
        cache = null;
        throw err;
      });
  }
  return cache;
}

/** ID の並び順のまま施設を返す。閉店・存在しない ID は除く。取得に失敗したら空（呼び出し側は「何も出さない」） */
export async function getFacilitiesByIds(ids: number[]): Promise<Facility[]> {
  if (!Array.isArray(ids) || ids.length > MAX_IDS) return [];
  const safeIds = ids.filter((id) => Number.isInteger(id) && id > 0);
  if (safeIds.length === 0) return [];
  try {
    const byId = new Map((await loadFacilities()).map((f) => [f.id, f] as const));
    return safeIds.map((id) => byId.get(id)).filter((f): f is Facility => !!f);
  } catch {
    return [];
  }
}
