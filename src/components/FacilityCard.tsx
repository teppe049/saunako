import Link from 'next/link';
import { Facility } from '@/lib/types';

interface FacilityCardProps {
  facility: Facility;
  showComment?: boolean;
}

export default function FacilityCard({ facility, showComment = true }: FacilityCardProps) {
  return (
    <Link href={`/facilities/${facility.slug}`} className="card block hover:shadow-md transition-shadow">
      {/* Image placeholder */}
      <div className="h-40 bg-gray-200 rounded-t-xl flex items-center justify-center">
        <span className="text-text-tertiary">No Image</span>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-text-primary mb-1">{facility.name}</h3>

        {facility.nearestStation && facility.walkMinutes > 0 && (
          <p className="text-sm text-text-secondary mb-2">
            {facility.nearestStation}{facility.nearestStation.endsWith('駅') ? '' : '駅'} 徒歩{facility.walkMinutes}分
          </p>
        )}

        <p className="text-sm text-text-primary mb-2">
          {facility.priceMin > 0 ? (
            <>
              <span className="font-bold">{facility.priceMin.toLocaleString()}円</span>
              <span className="text-text-secondary">〜 / {facility.duration}分</span>
            </>
          ) : (
            <span className="text-text-secondary">要問合せ</span>
          )}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {facility.features.waterBath && (
            <span className="tag tag-primary">水風呂</span>
          )}
          {facility.features.selfLoyly && (
            <span className="tag tag-primary">ロウリュ可</span>
          )}
          {facility.features.outdoorAir && (
            <span className="tag tag-primary">外気浴</span>
          )}
          {facility.features.coupleOk && (
            <span className="tag tag-primary">カップルOK</span>
          )}
        </div>

        {/* Saunako comment */}
        {showComment && facility.saunakoCommentShort && (
          <div className="saunako-comment text-sm">
            <span className="text-saunako font-bold">サウナ子</span>
            <span className="text-text-secondary ml-1">「{facility.saunakoCommentShort}」</span>
          </div>
        )}
      </div>
    </Link>
  );
}
