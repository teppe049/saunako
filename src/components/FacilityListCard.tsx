'use client';

import { forwardRef, useCallback } from 'react';
import Link from 'next/link';
import { Facility } from '@/lib/types';
import { getTimeSlotTags, isFacilityClosed } from '@/lib/facilities';
import { trackFacilityCardClick, trackExternalLinkClick } from '@/lib/analytics';
import ImageCarousel from '@/components/ImageCarousel';
import FavoriteButton from '@/components/FavoriteButton';

interface FacilityListCardProps {
  facility: Facility;
  index: number;
  isHovered?: boolean;
  isSelected?: boolean;
  onHover?: (id: number | null) => void;
}

const FacilityListCard = forwardRef<HTMLDivElement, FacilityListCardProps>(
  ({ facility, index, isHovered, isSelected, onHover }, ref) => {
    const handleMouseEnter = useCallback(() => {
      onHover?.(facility.id);
    }, [onHover, facility.id]);

    const handleMouseLeave = useCallback(() => {
      onHover?.(null);
    }, [onHover]);

    const handleClick = useCallback(() => {
      trackFacilityCardClick(facility.id, facility.name, index);
    }, [facility.id, facility.name, index]);

    const highlightClass = isSelected
      ? 'ring-2 ring-saunako'
      : isHovered
        ? 'bg-[#FFF5F4]'
        : '';

    const { hasMorningSlot, hasLateNightSlot } = getTimeSlotTags(facility);

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`rounded-xl md:rounded-none transition-all duration-150 ${highlightClass}`}
      >
        <Link
          href={`/facilities/${facility.id}`}
          onClick={handleClick}
          className="flex gap-3 md:gap-5 p-3 md:p-5 rounded-xl md:rounded-none border border-border md:border-0 md:border-b bg-surface md:bg-transparent hover:bg-gray-50 transition-colors"
        >
          {/* Image */}
          <div className="relative flex-shrink-0 w-[100px] h-[100px] md:w-[180px] md:h-[100px] bg-gray-200 rounded-lg overflow-hidden">
            <ImageCarousel
              images={facility.images.slice(0, 5)}
              alt={facility.name}
              sizes="(max-width: 768px) 100px, 180px"
            />
            <div className="absolute top-1.5 right-1.5 z-10">
              <FavoriteButton facilityId={facility.id} size="sm" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 md:gap-2">
            {/* Name */}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base md:text-lg text-text-primary truncate">{facility.name}</h3>
              {isFacilityClosed(facility) && (
                <span className="flex-shrink-0 bg-gray-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded">閉店</span>
              )}
            </div>

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
              {hasMorningSlot && (
                <span className="px-2 py-0.5 md:py-1 text-xs font-medium bg-[#E8F5E9] text-[#4CAF50] rounded">朝枠あり</span>
              )}
              {hasLateNightSlot && (
                <span className="px-2 py-0.5 md:py-1 text-xs font-medium bg-[#E8F5E9] text-[#4CAF50] rounded">深夜枠あり</span>
              )}
            </div>

            {/* Location */}
            {facility.nearestStation && facility.walkMinutes > 0 && (
              <p className="text-xs md:text-sm text-text-tertiary">
                {facility.nearestStation}{facility.nearestStation.includes('駅') ? '' : '駅'}から徒歩{facility.walkMinutes}分
              </p>
            )}

            {/* Website link */}
            {facility.website && (
              <a
                href={facility.website}
                className="inline-flex items-center gap-1 text-[11px] md:text-xs border border-saunako text-saunako rounded-full px-2.5 py-0.5 hover:bg-saunako hover:text-white transition-colors w-fit"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  trackExternalLinkClick(facility.id, 'website', facility.website!);
                  window.open(facility.website, '_blank', 'noopener,noreferrer');
                }}
              >
                公式サイトへ
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            {/* Saunako comment */}
            {facility.saunakoCommentShort && (
              <p className="text-xs md:text-sm text-text-secondary line-clamp-1 md:line-clamp-none md:truncate">
                {facility.saunakoCommentShort}
              </p>
            )}
          </div>
        </Link>
      </div>
    );
  }
);

FacilityListCard.displayName = 'FacilityListCard';

export default FacilityListCard;
