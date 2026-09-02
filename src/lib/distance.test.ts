import { describe, expect, it } from 'vitest';
import { formatDistance, getDistanceKm } from './distance';

describe('getDistanceKm', () => {
  it('同一地点は 0km', () => {
    expect(getDistanceKm(35.6812, 139.7671, 35.6812, 139.7671)).toBe(0);
  });

  it('東京駅〜新宿駅はおよそ 6km', () => {
    const km = getDistanceKm(35.6812, 139.7671, 35.6896, 139.7006);
    expect(km).toBeGreaterThan(5.5);
    expect(km).toBeLessThan(6.5);
  });
});

describe('formatDistance', () => {
  it('1km未満は小数2桁', () => {
    expect(formatDistance(0.845)).toBe('0.85km');
  });
  it('10km未満は小数1桁', () => {
    expect(formatDistance(6.04)).toBe('6km');
    expect(formatDistance(6.26)).toBe('6.3km');
  });
  it('10km以上は整数', () => {
    expect(formatDistance(12.7)).toBe('13km');
  });
});
