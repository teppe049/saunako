'use client';

import dynamic from 'next/dynamic';

const FacilityDetailMap = dynamic(() => import('./FacilityDetailMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
      <p className="text-text-tertiary">地図を読み込み中...</p>
    </div>
  ),
});

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export default function FacilityDetailMapWrapper(props: Props) {
  return <FacilityDetailMap {...props} />;
}
