'use client';

import dynamic from 'next/dynamic';
import { Facility } from '@/lib/types';
import type { MapBounds } from './FacilityMap';

const FacilityMap = dynamic(() => import('./FacilityMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-text-tertiary">地図を読み込み中...</p>
    </div>
  ),
});

interface Props {
  facilities: Facility[];
  hoveredId?: number | null;
  selectedId?: number;
  onSelect?: (facility: Facility) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
}

export default function FacilityMapWrapper(props: Props) {
  return <FacilityMap {...props} />;
}
