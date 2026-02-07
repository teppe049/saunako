import Link from 'next/link';
import { Facility } from '@/lib/types';

interface FacilityListCardProps {
  facility: Facility;
  index: number;
}

export default function FacilityListCard({ facility, index }: FacilityListCardProps) {
  return (
    <Link
      href={`/facilities/${facility.slug}`}
      className="card flex gap-4 p-4 hover:shadow-md transition-shadow"
    >
      {/* Index badge */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
        {index + 1}
      </div>

      {/* Image */}
      <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-text-tertiary text-xs">No Image</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-text-primary mb-1 truncate">{facility.name}</h3>
        <p className="text-sm text-text-secondary mb-2">
          {facility.nearestStation} 徒歩{facility.walkMinutes}分
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {facility.features.waterBath && <span className="tag tag-primary text-xs">水風呂</span>}
          {facility.features.selfLoyly && <span className="tag tag-primary text-xs">ロウリュ可</span>}
          {facility.features.outdoorAir && <span className="tag tag-primary text-xs">外気浴</span>}
          {facility.features.coupleOk && <span className="tag tag-primary text-xs">カップルOK</span>}
        </div>

        {/* Saunako comment */}
        {facility.saunakoCommentShort && (
          <p className="text-xs text-text-secondary truncate">
            サウナ子「{facility.saunakoCommentShort}」
          </p>
        )}
      </div>

      {/* Price */}
      <div className="flex-shrink-0 text-right">
        <p className="text-lg font-bold text-primary">
          ¥{facility.priceMin.toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary">/{facility.duration}分</p>
      </div>
    </Link>
  );
}
