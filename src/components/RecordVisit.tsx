'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'saunako_recent';
const MAX_ITEMS = 10;

export default function RecordVisit({ facilityId }: { facilityId: number }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const ids: number[] = stored ? JSON.parse(stored) : [];
      const filtered = ids.filter((id) => id !== facilityId);
      filtered.unshift(facilityId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
    } catch {
      // localStorage unavailable
    }
  }, [facilityId]);

  return null;
}
