'use server';

import { getFacilityById } from '@/lib/facilities';
import { isFacilityClosed } from '@/lib/facility-utils';
import type { Facility } from '@/lib/types';

const MAX_FAVORITES = 100;

export async function getFavoriteFacilities(ids: number[]): Promise<Facility[]> {
  if (!Array.isArray(ids) || ids.length > MAX_FAVORITES) return [];
  const safeIds = ids.filter((id) => Number.isInteger(id) && id > 0);
  return safeIds
    .map((id) => getFacilityById(id))
    .filter((f): f is Facility => !!f && !isFacilityClosed(f));
}
