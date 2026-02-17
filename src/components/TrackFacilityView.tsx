'use client';

import { useEffect } from 'react';
import { trackFacilityView } from '@/lib/analytics';

interface TrackFacilityViewProps {
  facilityId: number;
  facilityName: string;
  area: string;
}

export default function TrackFacilityView({
  facilityId,
  facilityName,
  area,
}: TrackFacilityViewProps) {
  useEffect(() => {
    trackFacilityView(facilityId, facilityName, area);
  }, [facilityId, facilityName, area]);

  return null;
}
