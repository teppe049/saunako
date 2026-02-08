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
      className="flex gap-3 md:gap-5 p-3 md:p-5 rounded-xl md:rounded-none border border-border md:border-0 md:border-b bg-surface md:bg-transparent hover:bg-gray-50 transition-colors"
    >
      {/* Image */}
      <div className="flex-shrink-0 w-[100px] h-[100px] md:w-[180px] md:h-[100px] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
        <span className="text-text-tertiary text-xs">No Image</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 md:gap-2">
        {/* Name */}
        <h3 className="font-semibold text-base md:text-lg text-text-primary truncate">{facility.name}</h3>

        {/* Price */}
        <span className="text-base md:text-lg font-bold text-primary">
          {facility.priceMin > 0 ? (
            <>¥{facility.priceMin.toLocaleString()}<span className="text-xs md:text-sm font-normal text-text-tertiary"> / 1時間</span></>
          ) : (
            <span className="text-xs md:text-sm font-normal text-text-tertiary">要問合せ</span>
          )}
        </span>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {facility.features.coupleOk && (
            <span className="px-2 py-0.5 md:py-1 text-xs font-medium bg-warning text-white rounded">男女OK</span>
          )}
          {facility.features.waterBath && (
            <span className="px-2 py-0.5 md:py-1 text-xs font-medium bg-primary text-white rounded">水風呂</span>
          )}
          {facility.features.selfLoyly && (
            <span className="px-2 py-0.5 md:py-1 text-xs font-medium bg-primary text-white rounded">ロウリュ可</span>
          )}
          {facility.features.outdoorAir && (
            <span className="px-2 py-0.5 md:py-1 text-xs font-medium bg-primary text-white rounded">外気浴</span>
          )}
        </div>

        {/* Location */}
        {facility.nearestStation && facility.walkMinutes > 0 && (
          <p className="text-xs md:text-sm text-text-tertiary">
            {facility.nearestStation}{facility.nearestStation.endsWith('駅') ? '' : '駅'}から徒歩{facility.walkMinutes}分
          </p>
        )}

        {/* Features - hidden on mobile for space */}
        <p className="hidden md:block text-sm text-text-secondary truncate">
          {facility.saunakoCommentShort || 'サウナ・水風呂完備'}
        </p>
      </div>
    </Link>
  );
}
