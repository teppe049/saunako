/**
 * STORES予約（旧Coubic）の空き枠取得
 *
 * 非公式・認証不要のAPIを使う（2026-07-17 / 2026-09-02 実測）。
 * 予約ページIDは `scripts/coubic-discover.mjs` が生成する data/coubic.json に静的保持し、
 * コース一覧と空き時刻はリクエスト時にサーバー側で取得する（CORSヘッダーが無くブラウザ直叩き不可）。
 * 取得に失敗した場合は null を返し、表示側は何も出さない（graceful degradation）。
 */
import coubicJson from '../../data/coubic.json';

interface CoubicCourse {
  id: string;
  name: string;
}

interface CoubicBookingPage {
  id: string;
  name: string;
  lowestPrice: number | null;
  /** 空き判定に使うコース（discover 時に採取済み。course_scheme 非対応ページは登録されない） */
  courses: CoubicCourse[];
}

interface CoubicMerchant {
  merchant: string;
  host: string;
  bookingPages: CoubicBookingPage[];
}

const COUBIC: Record<string, CoubicMerchant> = coubicJson;

// 非公式APIへの呼び出し数を抑える上限（予約ページ4 × コース2 × 2日 = 最大16コール）
const MAX_BOOKING_PAGES = 4;
const MAX_COURSES_PER_PAGE = 2;
// 空き状況のキャッシュ秒数。予約は分単位で埋まるが、目安表示なので10分で十分
export const AVAILABILITY_REVALIDATE_SEC = 600;
const FETCH_TIMEOUT_MS = 8000;

export interface DayAvailability {
  /** YYYY-MM-DD（JST） */
  date: string;
  /** 予約可能な開始時刻の数（コース横断で重複排除） */
  slotCount: number;
  /** 最も早い開始時刻 HH:mm（空きなしなら null） */
  earliest: string | null;
}

export interface FacilityAvailability {
  facilityId: number;
  fetchedAt: string;
  today: DayAvailability;
  tomorrow: DayAvailability;
}

export function hasCoubic(facilityId: number): boolean {
  return facilityId in COUBIC;
}

/** JSTの日付を YYYY-MM-DD で返す */
export function jstDate(offsetDays = 0, now: Date = new Date()): string {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: AVAILABILITY_REVALIDATE_SEC },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

interface TimesResponse {
  times: { start_at: string }[];
}

function resourceBase(m: CoubicMerchant, pageId: string): string {
  return `https://${m.host}/reserve/api/reservation_flow/merchants/${m.merchant}/course_scheme/resources/${pageId}`;
}

function summarize(date: string, startAts: Set<string>, now: Date): DayAvailability {
  const future = [...startAts].filter((s) => new Date(s).getTime() > now.getTime()).sort();
  const earliest = future.length > 0 ? future[0].slice(11, 16) : null;
  return { date, slotCount: future.length, earliest };
}

/**
 * 施設の本日・明日の空き枠を集計する。Coubic未対応または取得失敗時は null。
 */
export async function getFacilityAvailability(facilityId: number, now: Date = new Date()): Promise<FacilityAvailability | null> {
  const m = COUBIC[String(facilityId)];
  if (!m) return null;

  const today = jstDate(0, now);
  const tomorrow = jstDate(1, now);
  const pages = m.bookingPages.slice(0, MAX_BOOKING_PAGES);

  const courses = pages.flatMap((p) =>
    p.courses.slice(0, MAX_COURSES_PER_PAGE).map((c) => ({ pageId: p.id, courseId: c.id }))
  );
  if (courses.length === 0) return null;

  const todaySet = new Set<string>();
  const tomorrowSet = new Set<string>();
  let anySuccess = false;

  await Promise.all(
    courses.flatMap((c) =>
      [
        { date: today, set: todaySet },
        { date: tomorrow, set: tomorrowSet },
      ].map(async ({ date, set }) => {
        const json = await fetchJson<TimesResponse>(
          `${resourceBase(m, c.pageId)}/courses/${c.courseId}/availability/calendar_dates/${date}/times`
        );
        if (!json) return;
        anySuccess = true;
        for (const t of json.times ?? []) set.add(t.start_at);
      })
    )
  );

  if (!anySuccess) return null;

  return {
    facilityId,
    fetchedAt: now.toISOString(),
    today: summarize(today, todaySet, now),
    tomorrow: summarize(tomorrow, tomorrowSet, now),
  };
}
