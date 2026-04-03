'use server';

import { getFacilityById } from '@/lib/facilities';
import { isFacilityClosed } from '@/lib/facility-utils';
import type { Facility } from '@/lib/types';

export async function getFavoriteFacilities(ids: number[]): Promise<Facility[]> {
  return ids
    .map((id) => getFacilityById(id))
    .filter((f): f is Facility => !!f && !isFacilityClosed(f));
}
