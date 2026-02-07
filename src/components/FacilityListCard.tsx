import Link from 'next/link';
import { Facility } from '@/lib/types';

interface FacilityListCardProps {
  facility: Facility;
  index: number;
}

export default function FacilityListCard({ facility }: FacilityListCardProps) {
  return (
    <Link
      href={`/facilities/${facility.slug}`}
      className="flex gap-5 p-5 border-b border-border hover:bg-gray-50 transition-colors"
    >
      {/* Image */}
      <div className="flex-shrink-0 w-[180px] h-[100px] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
        <span className="text-text-tertiary text-xs">No Image</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
        {/* Top Row: Name + Price */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-text-primary truncate">{facility.name}</h3>
          <span className="text-lg font-bold text-primary flex-shrink-0 ml-4">
            ¥{facility.priceMin.toLocaleString()}/{facility.duration}分
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {facility.features.coupleOk && (
            <span className="px-2 py-1 text-xs font-medium bg-warning text-white rounded">男女OK</span>
          )}
          {facility.features.waterBath && (
            <span className="px-2 py-1 text-xs font-medium bg-primary text-white rounded">水風呂</span>
          )}
          {facility.features.selfLoyly && (
            <span className="px-2 py-1 text-xs font-medium bg-primary text-white rounded">ロウリュ可</span>
          )}
          {facility.features.outdoorAir && (
            <span className="px-2 py-1 text-xs font-medium bg-primary text-white rounded">外気浴</span>
          )}
        </div>

        {/* Location */}
        <p className="text-sm text-text-tertiary">
          {facility.nearestStation}駅から徒歩{facility.walkMinutes}分
        </p>

        {/* Features */}
        <p className="text-sm text-text-secondary truncate">
          {facility.saunakoCommentShort || 'サウナ・水風呂完備'}
        </p>
      </div>
    </Link>
  );
}
