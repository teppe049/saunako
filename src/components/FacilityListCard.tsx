'use client';

import { forwardRef, useCallback } from 'react';
import Link from 'next/link';
import { Facility } from '@/lib/types';
import ImageCarousel from '@/components/ImageCarousel';

interface FacilityListCardProps {
  facility: Facility;
  index: number;
  isHovered?: boolean;
  isSelected?: boolean;
  onHover?: (id: number | null) => void;
}

const FacilityListCard = forwardRef<HTMLDivElement, FacilityListCardProps>(
  ({ facility, isHovered, isSelected, onHover }, ref) => {
    const handleMouseEnter = useCallback(() => {
      onHover?.(facility.id);
    }, [onHover, facility.id]);

    const handleMouseLeave = useCallback(() => {
      onHover?.(null);
    }, [onHover]);

    const highlightClass = isSelected
      ? 'ring-2 ring-saunako'
      : isHovered
        ? 'bg-[#FFF5F4]'
        : '';

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`rounded-xl md:rounded-none transition-all duration-150 ${highlightClass}`}
      >
        <Link
          href={`/facilities/${facility.id}`}
          className="flex gap-3 md:gap-5 p-3 md:p-5 rounded-xl md:rounded-none border border-border md:border-0 md:border-b bg-surface md:bg-transparent hover:bg-gray-50 transition-colors"
        >
          {/* Image */}
          <div className="relative flex-shrink-0 w-[100px] h-[100px] md:w-[180px] md:h-[100px] bg-gray-200 rounded-lg overflow-hidden">
            <ImageCarousel
              images={facility.images.slice(0, 5)}
              alt={facility.name}
              sizes="(max-width: 768px) 100px, 180px"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 md:gap-2">
            {/* Name */}
            <h3 className="font-semibold text-base md:text-lg text-text-primary truncate">{facility.name}</h3>

            {/* Price */}
            <span className="text-base md:text-lg font-bold text-primary">
              {facility.priceMin > 0 ? (
                <>
                  ¥{facility.priceMin.toLocaleString()}
                  <span className="text-xs md:text-sm font-normal text-text-tertiary"> / 1時間</span>
                  {facility.plans && facility.plans.length > 1 && (
                    <span className="text-xs font-normal text-text-tertiary ml-1.5">({facility.plans.length}プラン)</span>
                  )}
                </>
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
                {facility.nearestStation}{facility.nearestStation.includes('駅') ? '' : '駅'}から徒歩{facility.walkMinutes}分
              </p>
            )}

            {/* Saunako comment */}
            <p className="text-xs md:text-sm text-text-secondary line-clamp-1 md:line-clamp-none md:truncate">
              {facility.saunakoCommentShort || 'サウナ・水風呂完備'}
            </p>
          </div>
        </Link>
      </div>
    );
  }
);

FacilityListCard.displayName = 'FacilityListCard';

export default FacilityListCard;
