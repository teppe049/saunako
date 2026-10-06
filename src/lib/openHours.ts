import type { Facility } from './types';

/**
 * 営業時間・定休日の自由記述（facilities.json の businessHours / holidays）を解釈し、
 * 「今から行けるか」を JST で判定する。
 *
 * 方針: 読み取れない書式は推測せず unknown を返す（「営業中」と誤って断言しない）。
 * 祝日カレンダーは持たないため「土日祝」は土日として扱う。
 */

const DAY_CHARS = '日月火水木金土';
const MINUTES_PER_DAY = 24 * 60;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 「今から行ける」に含める次の枠までの猶予（分）。
 * 移動時間を考えると2時間先までが「今から」の感覚に収まるため。
 */
export const NEXT_SLOT_WINDOW_MIN = 120;

/** 閉店間際に入っても最短プランを使い切れないため、残り時間がこれ未満なら受付終了とみなす */
const DEFAULT_MIN_STAY_MIN = 60;

const LAST_ENTRY_RE = /(?:最終(?:受付|入場|入室|入館|予約)?|受付終了)\s*(\d{1,2}):(\d{2})/;
const LAST_ENTRY_RE_G = new RegExp(LAST_ENTRY_RE.source, 'g');

export interface OpenRange {
  /** その日の0:00からの分。close は翌日にまたがると1440を超える */
  open: number;
  close: number;
  /** 最終受付（分）。記載がある場合のみ */
  lastEntry?: number;
}

/** 曜日（0=日）ごとの営業時間。'unknown' は記載から読み取れない曜日 */
export type WeeklyHours = (OpenRange | 'unknown')[];

export interface HolidayInfo {
  /** 定休曜日（0=日） */
  closedDays: Set<number>;
  /** 不定休・要確認など、データだけでは休業日が分からない */
  irregular: boolean;
}

/** 判定に使う項目だけ（クライアントへ施設データ全体を渡さずに済むように） */
export type OpenHoursInput = Pick<Facility, 'businessHours' | 'holidays' | 'timeSlots' | 'plans'>;

export type OpenStatus =
  | { kind: 'nextSlot'; time: string; minutesUntil: number }
  | { kind: 'open'; until: string | null; untilIsLastEntry: boolean; irregular: boolean }
  | { kind: 'opensLater'; time: string }
  | { kind: 'closed'; reason: 'holiday' | 'ended' }
  | { kind: 'unknown' };

function normalize(s: string): string {
  return s
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/：/g, ':')
    .replace(/／/g, '/')
    .replace(/[~～\-ー−–―]/g, '〜')
    .trim();
}

function toMinutes(h: string, m: string): number {
  return Number(h) * 60 + Number(m);
}

/** "月〜木" "金・土" "平日" "土日祝" などから曜日集合を取り出す。曜日指定が無ければ null */
function parseDaySpec(prefix: string): Set<number> | null {
  const days = new Set<number>();
  if (prefix.includes('平日')) [1, 2, 3, 4, 5].forEach((d) => days.add(d));
  // 曜日の字を含むが曜日ではない語（日帰り・毎月・祝日・6月 など）を先に除く
  const rest = prefix
    .replace(/平日|日帰り|毎日|毎月|毎週|祝前日|祝日|\d+月|月額|月次/g, '')
    .replace(/曜日?/g, '');
  const rangeRe = new RegExp(`([${DAY_CHARS}])〜([${DAY_CHARS}])`, 'g');
  let consumed = rest;
  for (const m of rest.matchAll(rangeRe)) {
    const from = DAY_CHARS.indexOf(m[1]);
    const to = DAY_CHARS.indexOf(m[2]);
    for (let d = from; ; d = (d + 1) % 7) {
      days.add(d);
      if (d === to) break;
    }
    consumed = consumed.replace(m[0], '');
  }
  for (const c of consumed) {
    const d = DAY_CHARS.indexOf(c);
    if (d >= 0) days.add(d);
  }
  return days.size > 0 ? days : null;
}

/** 2つの時間帯を、両方を覆う1つの時間帯にまとめる（「午前の部/午後の部」など） */
function union(a: OpenRange, b: OpenRange): OpenRange {
  return { open: Math.min(a.open, b.open), close: Math.max(a.close, b.close) };
}

/** 区間内の時間帯をすべて拾って1つにまとめる（「①9:00〜12:00 ②13:00〜15:00」） */
function parseRange(segment: string): OpenRange | null {
  if (segment.includes('24時間')) return { open: 0, close: MINUTES_PER_DAY };
  let result: OpenRange | null = null;
  for (const m of segment.matchAll(/(\d{1,2}):(\d{2})\s*〜\s*(翌)?\s*(\d{1,2}):(\d{2})/g)) {
    const open = toMinutes(m[1], m[2]);
    let close = toMinutes(m[4], m[5]);
    if (m[3] || close <= open) close += MINUTES_PER_DAY;
    result = result ? union(result, { open, close }) : { open, close };
  }
  return result;
}

/**
 * 営業時間の文字列を曜日別の時間帯に変換する。1曜日も読み取れなければ null。
 */
export function parseBusinessHours(raw: string | null | undefined): WeeklyHours | null {
  if (!raw) return null;
  const s = normalize(raw);
  if (/チェックイン|チェックアウト/.test(s)) return null;

  // 括弧内は注記（部制・曜日別の延長など）。読み違えるより落とすが、最終受付だけは「@H:MM」として区間に残す
  const body = s
    .replace(/（[^）]*）|\([^)]*\)/g, (p) => {
      const m = p.match(LAST_ENTRY_RE);
      return m ? ` @${m[1]}:${m[2]} ` : ' ';
    })
    .replace(LAST_ENTRY_RE_G, (_, h, m) => ` @${h}:${m} `);

  const week: WeeklyHours = Array(7).fill('unknown');
  const explicit = new Set<number>();
  // 曜日指定のない区間（「午前の部/午後の部」「サウナ/カフェ」）は全部を覆う1つの時間帯にまとめる
  let undated: OpenRange | null = null;

  for (const segment of body.split(/[/、]/)) {
    const range = parseRange(segment.replace(/@\d{1,2}:\d{2}/g, ''));
    if (!range) continue;
    const le = segment.match(/@(\d{1,2}):(\d{2})/);
    if (le) {
      let v = toMinutes(le[1], le[2]);
      if (v < range.open) v += MINUTES_PER_DAY;
      if (v > range.open && v < range.close) range.lastEntry = v;
    }
    const firstTime = segment.search(/\d{1,2}:\d{2}|24時間/);
    const days = parseDaySpec(firstTime > 0 ? segment.slice(0, firstTime) : '');
    if (days) {
      days.forEach((d) => {
        week[d] = week[d] !== 'unknown' && explicit.has(d) ? union(week[d] as OpenRange, range) : range;
        explicit.add(d);
      });
    } else {
      undated = undated ? union(undated, range) : range;
    }
  }
  if (undated) {
    for (let d = 0; d < 7; d++) if (!explicit.has(d)) week[d] = undated;
  }
  if (explicit.size === 0 && !undated) return null;
  return week;
}

export function parseHolidays(raw: string | null | undefined): HolidayInfo {
  const s = normalize(raw ?? '').replace(/（[^）]*）|\([^)]*\)/g, '').trim();
  if (!s || s === 'null') return { closedDays: new Set(), irregular: true };
  if (/無休|通年営業|^(なし|無し)$|定休日?なし/.test(s)) return { closedDays: new Set(), irregular: /不定休/.test(s) };
  // 「水曜9:00-12:00清掃」のような時間帯つきの休みは日単位で判定できない
  if (/\d{1,2}:\d{2}/.test(s)) return { closedDays: new Set(), irregular: true };

  // 「第1・3・5日曜」「偶数月の第2火〜翌水曜」など月単位の休みは曜日として扱わない
  const weekly = s.replace(/(偶数月|奇数月)?の?第[\d・]+[日月火水木金土]?(曜日?)?(〜翌?[日月火水木金土]曜?日?)?/g, '');
  const irregular = /不定休|要確認|不明|臨時|第\d|隔週|週替わり/.test(s);
  const looksLikeDays = /曜|定休|休み|^[日月火水木金土祝・、,〜\s]+$/.test(weekly);
  const closedDays = (looksLikeDays && parseDaySpec(weekly)) || new Set<number>();

  if (closedDays.size === 0 && !irregular) {
    // 「年末年始」「祝日」など日次判定に影響しない記述だけなら休みなし扱い
    if (/^[・、,\s]*(祝日?|年末年始|お盆)([・、,\s]*(祝日?|年末年始|お盆))*$/.test(s)) return { closedDays, irregular: false };
    return { closedDays, irregular: true };
  }
  return { closedDays, irregular };
}

function jstParts(now: Date): { day: number; minutes: number } {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  return { day: jst.getUTCDay(), minutes: jst.getUTCHours() * 60 + jst.getUTCMinutes() };
}

/** 分を "H:MM" に。ちょうど1440は「24:00」、それより後は「翌H:MM」 */
export function formatMinutes(min: number): string {
  if (min === MINUTES_PER_DAY) return '24:00';
  const nextDay = min > MINUTES_PER_DAY;
  const m = nextDay ? min - MINUTES_PER_DAY : min;
  const text = `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  return nextDay ? `翌${text}` : text;
}

export function slotMinutes(facility: Pick<Facility, 'timeSlots'>): number[] {
  if (!Array.isArray(facility.timeSlots)) return [];
  const all = facility.timeSlots
    .flatMap((g) => g?.startTimes ?? [])
    .map((t) => {
      const m = t.match(/^(\d{1,2}):(\d{2})$/);
      return m ? toMinutes(m[1], m[2]) : null;
    })
    .filter((v): v is number => v !== null);
  return [...new Set(all)].sort((a, b) => a - b);
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export interface DaySlots {
  /** 「今日 10/6(火)」など */
  label: string;
  /** 定休日（データ上の定休曜日） */
  holiday: boolean;
  groups: {
    label: string;
    note?: string;
    times: { time: string; state: 'past' | 'next' | 'upcoming' }[];
  }[];
}

/**
 * 時間枠のある施設の「今日・明日・明後日」の枠。今日は過ぎた枠と次の枠に印をつける。
 * 枠は掲載データのもの（曜日による違いは営業時間の範囲外を落とす程度にしか反映できない）。
 */
export function getSlotsByDay(facility: OpenHoursInput, now: Date = new Date(), days = 3): DaySlots[] {
  const week = parseBusinessHours(facility.businessHours);
  const holidays = parseHolidays(facility.holidays);
  const { minutes } = jstParts(now);
  const groups = (facility.timeSlots ?? []).filter((g) => g?.startTimes?.length);
  const result: DaySlots[] = [];

  for (let offset = 0; offset < days; offset++) {
    const date = new Date(now.getTime() + JST_OFFSET_MS + offset * MINUTES_PER_DAY * 60 * 1000);
    const day = date.getUTCDay();
    const prefix = offset === 0 ? '今日 ' : offset === 1 ? '明日 ' : '';
    const label = `${prefix}${date.getUTCMonth() + 1}/${date.getUTCDate()}(${WEEKDAY_LABELS[day]})`;
    const hours = week?.[day];
    const inHours = (t: number) => !hours || hours === 'unknown' || (t >= hours.open && t < hours.close);

    const dayGroups = groups.map((g) => ({
      label: g.label,
      note: g.note,
      times: slotMinutes({ timeSlots: [g] })
        .filter(inHours)
        .map((t): { t: number; state: 'past' | 'next' | 'upcoming' } => ({
          t,
          state: offset === 0 && t < minutes ? 'past' : 'upcoming',
        })),
    }));

    // 次の枠はグループをまたいで一番早いもの
    if (offset === 0) {
      const upcoming = dayGroups.flatMap((g) => g.times).filter((x) => x.state === 'upcoming').sort((a, b) => a.t - b.t)[0];
      if (upcoming) upcoming.state = 'next';
    }

    result.push({
      label,
      holiday: holidays.closedDays.has(day),
      groups: dayGroups
        .filter((g) => g.times.length > 0)
        .map((g) => ({ label: g.label, note: g.note, times: g.times.map(({ t, state }) => ({ time: formatMinutes(t), state })) })),
    });
  }
  return result;
}

function minStay(facility: OpenHoursInput): number {
  const durations = (facility.plans ?? []).map((p) => p.duration).filter((d) => d > 0);
  return durations.length > 0 ? Math.min(...durations) : DEFAULT_MIN_STAY_MIN;
}

/**
 * 施設の「今」の状態を JST で判定する。now を注入できるのでテスト・SSR どちらでも使える。
 */
export function getOpenStatus(facility: OpenHoursInput, now: Date = new Date()): OpenStatus {
  const week = parseBusinessHours(facility.businessHours);
  const holidays = parseHolidays(facility.holidays);
  const { day, minutes } = jstParts(now);
  const yesterday = (day + 6) % 7;

  // 前日の深夜営業の続き（例: 10:00〜翌2:00 の 1:00）
  const prev = week?.[yesterday];
  if (prev && prev !== 'unknown' && !holidays.closedDays.has(yesterday) && prev.close > MINUTES_PER_DAY) {
    const spill = minutes + MINUTES_PER_DAY;
    const end = prev.lastEntry ?? prev.close;
    if (spill >= prev.open && spill < end) {
      return { kind: 'open', until: formatMinutes(end - MINUTES_PER_DAY), untilIsLastEntry: prev.lastEntry !== undefined, irregular: holidays.irregular };
    }
  }

  if (holidays.closedDays.has(day)) return { kind: 'closed', reason: 'holiday' };

  const today = week?.[day];
  const slots = slotMinutes(facility);

  if (slots.length > 0) {
    const inHours = (t: number) => !today || today === 'unknown' || (t >= today.open && t < today.close);
    const next = slots.find((t) => t >= minutes && inHours(t));
    if (next !== undefined) return { kind: 'nextSlot', time: formatMinutes(next), minutesUntil: next - minutes };
    return today === 'unknown' || !week ? { kind: 'unknown' } : { kind: 'closed', reason: 'ended' };
  }

  if (!today || today === 'unknown') return { kind: 'unknown' };

  if (today.open === 0 && today.close >= MINUTES_PER_DAY) {
    return { kind: 'open', until: null, untilIsLastEntry: false, irregular: holidays.irregular };
  }
  if (minutes < today.open) return { kind: 'opensLater', time: formatMinutes(today.open) };

  if (today.lastEntry !== undefined) {
    if (minutes < today.lastEntry) {
      return { kind: 'open', until: formatMinutes(today.lastEntry), untilIsLastEntry: true, irregular: holidays.irregular };
    }
    return { kind: 'closed', reason: 'ended' };
  }
  if (today.close - minutes >= minStay(facility)) {
    return { kind: 'open', until: formatMinutes(today.close), untilIsLastEntry: false, irregular: holidays.irregular };
  }
  return { kind: 'closed', reason: 'ended' };
}

/** 「今から行ける」フィルタに含めるか（営業中、または次の枠が NEXT_SLOT_WINDOW_MIN 以内） */
export function isAvailableNow(status: OpenStatus): boolean {
  return status.kind === 'open' || (status.kind === 'nextSlot' && status.minutesUntil <= NEXT_SLOT_WINDOW_MIN);
}

/**
 * 今日（JST）の指定時刻に入れそうか。「何時から」セレクト用。
 * 判定できない施設は除外しない（従来どおり）。
 */
export function isOpenAtHour(facility: OpenHoursInput, hour: number, now: Date = new Date()): boolean {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  jst.setUTCHours(hour, 0, 0, 0);
  const at = new Date(jst.getTime() - JST_OFFSET_MS);
  const status = getOpenStatus(facility, at);
  if (status.kind === 'unknown') return true;
  return status.kind === 'open' || (status.kind === 'nextSlot' && status.minutesUntil < 60);
}

/** 状態表示の文言。unknown は表示しないので null */
export function describeOpenStatus(status: OpenStatus): { text: string; tone: 'slot' | 'open' | 'muted' } | null {
  switch (status.kind) {
    case 'nextSlot': {
      const h = Math.floor(status.minutesUntil / 60);
      const m = status.minutesUntil % 60;
      const wait = status.minutesUntil === 0 ? 'まもなく' : h > 0 ? `${h}時間${m > 0 ? `${m}分` : ''}後` : `${m}分後`;
      return { text: `次の枠 ${status.time}〜（${wait}）`, tone: 'slot' };
    }
    case 'open': {
      const head = status.irregular ? '営業時間内' : '営業中';
      const tail = status.until === null ? '24時間' : status.untilIsLastEntry ? `受付${status.until}まで` : `${status.until}まで`;
      return { text: `${head}・${tail}`, tone: 'open' };
    }
    case 'opensLater':
      return { text: `本日${status.time}から`, tone: 'muted' };
    case 'closed':
      return { text: status.reason === 'holiday' ? '本日は定休日' : '本日の受付は終了', tone: 'muted' };
    default:
      return null;
  }
}
