import { describe, expect, it } from 'vitest';
import {
  describeOpenStatus,
  formatMinutes,
  getOpenStatus,
  getSlotsByDay,
  isAvailableNow,
  isOpenAtHour,
  parseBusinessHours,
  parseHolidays,
} from './openHours';
import type { Facility } from './types';

function facility(over: Partial<Facility>): Facility {
  return {
    id: 1,
    slug: 'f1',
    name: '施設',
    prefecture: 'tokyo',
    prefectureLabel: '東京都',
    city: '渋谷区',
    area: '渋谷',
    address: '',
    nearestStation: '渋谷駅',
    walkMinutes: 5,
    priceMin: 5000,
    duration: 60,
    capacity: 1,
    features: { waterBath: true, waterBathTemp: null, selfLoyly: true, outdoorAir: false, coupleOk: false, bluetooth: null, wifi: null },
    businessHours: '',
    holidays: 'なし',
    website: '',
    phone: '',
    bookingUrl: null,
    amenities: [],
    note: null,
    images: [],
    lat: null,
    lng: null,
    description: '',
    seoDescription: null,
    saunakoCommentShort: '',
    saunakoCommentLong: '',
    updatedAt: '2026-01-01',
    openedAt: null,
    closedAt: null,
    plans: [{ name: 'p', price: 5000, duration: 60, capacity: 1 }],
    timeSlots: null,
    slotType: 'free',
    ...over,
  } as Facility;
}

/** JST の日時を Date に（テストの可読性のため） */
function jst(iso: string): Date {
  return new Date(`${iso}+09:00`);
}

// 2026-10-06 は火曜日
const TUE_1800 = jst('2026-10-06T18:00:00');

describe('parseBusinessHours', () => {
  it('単純な時間帯を全曜日に当てる', () => {
    const w = parseBusinessHours('10:00〜22:00')!;
    expect(w).toHaveLength(7);
    expect(w[0]).toEqual({ open: 600, close: 1320 });
  });

  it('「翌」と日付またぎを扱う', () => {
    expect(parseBusinessHours('12:00-翌5:30')![1]).toEqual({ open: 720, close: 1770 });
    expect(parseBusinessHours('20:00-6:00')![1]).toEqual({ open: 1200, close: 1800 });
  });

  it('24時間営業', () => {
    expect(parseBusinessHours('24時間営業')![3]).toEqual({ open: 0, close: 1440 });
  });

  it('平日/土日祝を分ける（全角スラッシュも）', () => {
    const w = parseBusinessHours('平日9:00〜翌1:00／土日祝6:30〜翌1:00')!;
    expect(w[2]).toEqual({ open: 540, close: 1500 });
    expect(w[6]).toEqual({ open: 390, close: 1500 });
    expect(w[0]).toEqual({ open: 390, close: 1500 });
  });

  it('曜日範囲と「祝前日」', () => {
    const w = parseBusinessHours('月〜木 8:00〜24:00 / 金・土・祝前日 24時間営業 / 日 〜24:00')!;
    expect(w[1]).toEqual({ open: 480, close: 1440 });
    expect(w[5]).toEqual({ open: 0, close: 1440 });
    // 開店時刻のない日曜は読み取れない
    expect(w[0]).toBe('unknown');
  });

  it('括弧内の注記は無視し、最終受付は区間ごとに拾う', () => {
    const w = parseBusinessHours('月〜金 11:00〜18:00（最終入館15:30） / 土日祝 10:00〜21:30（最終入館19:00）')!;
    expect(w[2]).toEqual({ open: 660, close: 1080, lastEntry: 930 });
    expect(w[6]).toEqual({ open: 600, close: 1290, lastEntry: 1140 });
    expect(parseBusinessHours('10:00〜20:30（90分枠・10/13/15/17/19時開始）')![1]).toEqual({ open: 600, close: 1230 });
  });

  it('曜日指定のない複数区間は覆う範囲にまとめる', () => {
    expect(parseBusinessHours('午前の部 9:00〜11:30 / 午後の部 14:00〜16:30')![1]).toEqual({ open: 540, close: 990 });
    expect(parseBusinessHours('サウナ 9:00〜22:00 / カフェ 11:00〜18:00')![1]).toEqual({ open: 540, close: 1320 });
  });

  it('「日帰り」の「日」を日曜と読まない', () => {
    const w = parseBusinessHours('日帰りサウナ: 月〜木 12:00〜15:00（3時間）')!;
    expect(w[1]).toEqual({ open: 720, close: 900 });
    expect(w[0]).toBe('unknown');
  });

  it('読み取れない書式は null', () => {
    for (const s of ['不明', '完全予約制', '予約サイトで確認', 'チェックイン15:00 / チェックアウト10:00', '']) {
      expect(parseBusinessHours(s)).toBeNull();
    }
  });
});

describe('parseHolidays', () => {
  it('定休曜日を拾う', () => {
    expect([...parseHolidays('火・水・木曜日').closedDays]).toEqual([2, 3, 4]);
    expect([...parseHolidays('月〜金曜定休（土日のみ営業）').closedDays]).toEqual([1, 2, 3, 4, 5]);
    expect([...parseHolidays('日曜・月曜・祝日').closedDays]).toEqual([0, 1]);
    expect(parseHolidays('水曜定休').irregular).toBe(false);
  });

  it('無休は休みなし', () => {
    for (const s of ['なし', '年中無休', '基本無休', '無休（完全予約制）', '通年営業', '年末年始']) {
      const h = parseHolidays(s);
      expect(h.closedDays.size, s).toBe(0);
      expect(h.irregular, s).toBe(false);
    }
  });

  it('不定休・月単位の休み・時間帯つきは irregular', () => {
    expect(parseHolidays('不定休').irregular).toBe(true);
    expect(parseHolidays('null').irregular).toBe(true);
    const h = parseHolidays('第1・3・5日曜、他不定休');
    expect(h.irregular).toBe(true);
    expect(h.closedDays.size).toBe(0);
    expect(parseHolidays('毎月第4木曜日').closedDays.size).toBe(0);
    expect(parseHolidays('水曜9:00-12:00清掃').closedDays.size).toBe(0);
  });
});

describe('getOpenStatus', () => {
  it('営業中は閉店時刻を返す', () => {
    const s = getOpenStatus(facility({ businessHours: '10:00〜23:00' }), TUE_1800);
    expect(s).toEqual({ kind: 'open', until: '23:00', untilIsLastEntry: false, irregular: false });
    expect(describeOpenStatus(s)?.text).toBe('営業中・23:00まで');
  });

  it('不定休は「営業時間内」と表示する', () => {
    const s = getOpenStatus(facility({ businessHours: '10:00〜23:00', holidays: '不定休' }), TUE_1800);
    expect(describeOpenStatus(s)?.text).toBe('営業時間内・23:00まで');
  });

  it('定休日', () => {
    const s = getOpenStatus(facility({ businessHours: '10:00〜23:00', holidays: '火曜' }), TUE_1800);
    expect(s).toEqual({ kind: 'closed', reason: 'holiday' });
    expect(describeOpenStatus(s)?.text).toBe('本日は定休日');
  });

  it('開店前', () => {
    expect(getOpenStatus(facility({ businessHours: '15:20〜23:30' }), jst('2026-10-06T12:00:00'))).toEqual({ kind: 'opensLater', time: '15:20' });
  });

  it('閉店まで最短プランの時間が残っていなければ受付終了', () => {
    const f = facility({ businessHours: '10:00〜19:00', plans: [{ name: 'p', price: 1, duration: 90, capacity: 1 }] });
    expect(getOpenStatus(f, TUE_1800)).toEqual({ kind: 'closed', reason: 'ended' });
  });

  it('最終受付があればそれまで', () => {
    const f = facility({ businessHours: '10:00〜22:00（最終受付20:00）' });
    const s = getOpenStatus(f, TUE_1800);
    expect(describeOpenStatus(s)?.text).toBe('営業中・受付20:00まで');
    expect(getOpenStatus(f, jst('2026-10-06T20:30:00'))).toEqual({ kind: 'closed', reason: 'ended' });
  });

  it('前日からの深夜営業の続き', () => {
    const f = facility({ businessHours: '10:00〜翌3:00' });
    expect(getOpenStatus(f, jst('2026-10-07T01:00:00'))).toMatchObject({ kind: 'open', until: '3:00' });
    // 前日が定休日なら続きも無い
    const g = facility({ businessHours: '10:00〜翌3:00', holidays: '火曜' });
    expect(getOpenStatus(g, jst('2026-10-07T01:00:00')).kind).toBe('opensLater');
  });

  it('曜日で時間が変わる（土曜）', () => {
    const f = facility({ businessHours: '平日 13:30-23:30 / 土日祝 10:30-23:30' });
    expect(getOpenStatus(f, jst('2026-10-10T11:00:00')).kind).toBe('open');
    expect(getOpenStatus(f, jst('2026-10-06T11:00:00')).kind).toBe('opensLater');
  });

  it('時間枠のある施設は次の枠と待ち時間', () => {
    const f = facility({
      businessHours: '平日 13:30-23:30 / 土日祝 10:30-23:30',
      slotType: 'fixed',
      timeSlots: [{ label: '通常', startTimes: ['13:30', '14:30', '18:30', '19:30'] }],
    });
    const s = getOpenStatus(f, TUE_1800);
    expect(s).toEqual({ kind: 'nextSlot', time: '18:30', minutesUntil: 30 });
    expect(describeOpenStatus(s)?.text).toBe('次の枠 18:30〜（30分後）');
    expect(describeOpenStatus(getOpenStatus(f, jst('2026-10-06T17:10:00')))?.text).toBe('次の枠 18:30〜（1時間20分後）');
    expect(getOpenStatus(f, jst('2026-10-06T20:00:00'))).toEqual({ kind: 'closed', reason: 'ended' });
  });

  it('24時間営業', () => {
    const s = getOpenStatus(facility({ businessHours: '24時間' }), TUE_1800);
    expect(describeOpenStatus(s)?.text).toBe('営業中・24時間');
  });

  it('読み取れない施設は unknown で表示しない', () => {
    const s = getOpenStatus(facility({ businessHours: '完全予約制' }), TUE_1800);
    expect(s).toEqual({ kind: 'unknown' });
    expect(describeOpenStatus(s)).toBeNull();
  });

  it('サーバーがUTCでもJSTで判定する', () => {
    // 2026-10-06T09:00Z = JST 18:00
    const s = getOpenStatus(facility({ businessHours: '10:00〜19:30', plans: [] }), new Date('2026-10-06T09:00:00Z'));
    expect(s).toMatchObject({ kind: 'open', until: '19:30' });
  });
});

describe('isAvailableNow', () => {
  it('営業中と、2時間以内の次の枠だけ', () => {
    expect(isAvailableNow({ kind: 'open', until: '23:00', untilIsLastEntry: false, irregular: false })).toBe(true);
    expect(isAvailableNow({ kind: 'nextSlot', time: '19:00', minutesUntil: 120 })).toBe(true);
    expect(isAvailableNow({ kind: 'nextSlot', time: '21:00', minutesUntil: 180 })).toBe(false);
    expect(isAvailableNow({ kind: 'opensLater', time: '15:00' })).toBe(false);
    expect(isAvailableNow({ kind: 'unknown' })).toBe(false);
  });
});

describe('isOpenAtHour', () => {
  it('今日の指定時刻で判定し、判定できない施設は残す', () => {
    const f = facility({ businessHours: '10:00〜18:00' });
    expect(isOpenAtHour(f, 12, TUE_1800)).toBe(true);
    expect(isOpenAtHour(f, 20, TUE_1800)).toBe(false);
    expect(isOpenAtHour(facility({ businessHours: '不明' }), 20, TUE_1800)).toBe(true);
  });
});

describe('formatMinutes', () => {
  it('24:00 と翌日表記', () => {
    expect(formatMinutes(1440)).toBe('24:00');
    expect(formatMinutes(1500)).toBe('翌1:00');
    expect(formatMinutes(570)).toBe('9:30');
  });
});

describe('getSlotsByDay', () => {
  const f = facility({
    businessHours: '7:00〜24:00',
    holidays: '木曜',
    slotType: 'fixed',
    timeSlots: [
      { label: '朝ウナ 45分', startTimes: ['07:15', '08:15'], note: '午前中限定' },
      { label: '通常 85分', startTimes: ['17:20', '19:00', '20:40'] },
    ],
  });

  it('今日は過ぎた枠と次の枠に印をつける', () => {
    const [today] = getSlotsByDay(f, TUE_1800);
    expect(today.label).toBe('今日 10/6(火)');
    expect(today.groups[0].times.map((t) => t.state)).toEqual(['past', 'past']);
    expect(today.groups[1].times).toEqual([
      { time: '17:20', state: 'past' },
      { time: '19:00', state: 'next' },
      { time: '20:40', state: 'upcoming' },
    ]);
  });

  it('明日以降は全部これから・定休日に印', () => {
    const [, tomorrow, dayAfter] = getSlotsByDay(f, TUE_1800);
    expect(tomorrow.label).toBe('明日 10/7(水)');
    expect(tomorrow.groups.flatMap((g) => g.times).every((t) => t.state === 'upcoming')).toBe(true);
    expect(dayAfter.label).toBe('10/8(木)');
    expect(dayAfter.holiday).toBe(true);
  });

  it('日付はJSTで切り替わる（UTC 15:30 = JST 翌0:30）', () => {
    const [today] = getSlotsByDay(f, new Date('2026-10-06T15:30:00Z'));
    expect(today.label).toBe('今日 10/7(水)');
  });
});
