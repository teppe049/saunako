import type { Facility } from '@/lib/types';
import { getPerPersonPrice } from '@/lib/facility-utils';

/**
 * 「行きたい候補を送る」機能（/pick）の純ロジック。
 *
 * URL は /pick/85-18-84 の形。カンマは一部メッセージアプリで %2C にエンコードされ
 * 見た目が崩れるため、区切りはハイフンにする（旧 /compare?ids=85,18 からの移行用にカンマも受ける）。
 */

// 受け取った側が1画面で選び切れる上限（決め手比較の列数でもある）
export const MAX_PICK = 4;

// ひとことは URL に載せるので短く。メッセージアプリのプレビューに収まる長さ
export const MAX_PICK_MESSAGE = 80;

export function parsePickIds(segment: string | undefined | null): number[] {
  if (!segment) return [];
  const ids = segment
    .split(/[-,]/)
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(ids)].slice(0, MAX_PICK);
}

export function buildPickPath(ids: number[]): string {
  return `/pick/${ids.join('-')}`;
}

/** URL 由来の自由入力。改行・制御文字を落として長さを丸める。空なら null */
export function sanitizePickMessage(raw: string | string[] | undefined | null): string | null {
  const s = (Array.isArray(raw) ? raw[0] : raw) ?? '';
  const cleaned = s.replace(/[\x00-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  return [...cleaned].slice(0, MAX_PICK_MESSAGE).join('');
}

export interface PickBadges {
  /** 1人あたり最安の施設ID（同額タイなら null） */
  cheapestId: number | null;
  /** 全候補が同じ最寄駅のときだけ、徒歩最短の施設ID */
  nearestId: number | null;
  /** nearestId が決まったときの駅名（「新宿駅」のように駅付き） */
  nearestStation: string | null;
}

function stationLabel(f: Facility): string | null {
  if (!f.nearestStation || (f.walkMinutes ?? 0) <= 0) return null;
  return f.nearestStation.includes('駅') ? f.nearestStation : `${f.nearestStation}駅`;
}

export function getPickBadges(facilities: Facility[]): PickBadges {
  const result: PickBadges = { cheapestId: null, nearestId: null, nearestStation: null };
  if (facilities.length < 2) return result;

  const priced = facilities
    .map((f) => ({ id: f.id, price: getPerPersonPrice(f) }))
    .filter((x): x is { id: number; price: number } => x.price !== null && x.price > 0);
  if (priced.length >= 2) {
    const min = Math.min(...priced.map((x) => x.price));
    const winners = priced.filter((x) => x.price === min);
    if (winners.length === 1) result.cheapestId = winners[0].id;
  }

  const stations = facilities.map(stationLabel);
  const first = stations[0];
  if (first && stations.every((s) => s === first)) {
    const min = Math.min(...facilities.map((f) => f.walkMinutes as number));
    const winners = facilities.filter((f) => f.walkMinutes === min);
    if (winners.length === 1) {
      result.nearestId = winners[0].id;
      result.nearestStation = first;
    }
  }

  return result;
}

/** 候補が全て同じエリアならそのラベル、違えば都道府県ラベルを返す（見出し・戻り導線用） */
export function getPickAreaLabel(facilities: Facility[]): { prefecture: string; prefectureLabel: string; area: string | null } | null {
  if (facilities.length === 0) return null;
  const [first] = facilities;
  const samePref = facilities.every((f) => f.prefecture === first.prefecture);
  if (!samePref) return null;
  const sameArea = first.area && facilities.every((f) => f.area === first.area);
  return { prefecture: first.prefecture, prefectureLabel: first.prefectureLabel, area: sameArea ? first.area : null };
}
