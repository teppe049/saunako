'use client';

import { forwardRef, useCallback, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Facility } from '@/lib/types';
import { getTimeSlotTags, getNextAvailableSlot, isFacilityClosed, getPerPersonPrice } from '@/lib/facility-utils';
import { trackFacilityCardClick, trackExternalLinkClick } from '@/lib/analytics';
import ImageCarousel from '@/components/ImageCarousel';
import FavoriteButton from '@/components/FavoriteButton';
import { subscribe, getSnapshot, getServerSnapshot, toggleCompare } from '@/lib/compareStore';

interface FacilityListCardProps {
  facility: Facility;
  index: number;
  isHovered?: boolean;
  isSelected?: boolean;
  onHover?: (id: number | null) => void;
  distanceLabel?: string;
}

// ハイドレーション完了判定用（SSR中はfalse、クライアントではtrue）
const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

const FacilityListCard = forwardRef<HTMLDivElement, FacilityListCardProps>(
  ({ facility, index, isHovered, isSelected, onHover, distanceLabel }, ref) => {
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

    // 時刻依存の表示はハイドレーション完了後にのみ計算する（サーバー(UTC)と
    // クライアント(JST)の時差でSSR出力が食い違い hydration error #418 になるため）
    const hydrated = useSyncExternalStore(subscribeNoop, getTrue, getFalse);
    const nextSlot = hydrated ? getNextAvailableSlot(facility, new Date().getHours()) : null;

    const perPerson = getPerPersonPrice(facility);
    const showPerPerson = perPerson != null && (facility.priceMin === 0 || perPerson < facility.priceMin);

    const compareItems = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const isCompared = compareItems.some((i) => i.id === facility.id);
    const handleToggleCompare = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleCompare({ id: facility.id, name: facility.name, image: facility.images[0] ?? null });
    }, [facility.id, facility.name, facility.images]);

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
              {showPerPerson && (
                <span className="block text-xs font-medium text-text-secondary mt-0.5">
                  1人あたり ¥{perPerson!.toLocaleString()}〜
                </span>
              )}
            </span>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {facility.bookingUrl && (
                <span className="px-2 py-0.5 md:py-1 text-xs font-medium bg-available text-white rounded">ネット予約可</span>
              )}
              {facility.features.coupleOk && (
                <span className="px-2 py-0.5 md:py-1 text-xs font-medium bg-warning text-white rounded">男女OK</span>
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

            {/* Next available slot */}
            {nextSlot && (
              <p className="flex items-center gap-1 text-xs text-text-secondary">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {nextSlot}
              </p>
            )}

            {/* Location + Distance badge */}
            <div className="flex items-center gap-2 flex-wrap">
              {facility.nearestStation && (facility.walkMinutes ?? 0) > 0 && (
                <p className="text-xs md:text-sm text-text-tertiary">
                  {facility.nearestStation}{facility.nearestStation.includes('駅') ? '' : '駅'}から徒歩{facility.walkMinutes}分
                </p>
              )}
              {distanceLabel && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] md:text-xs font-medium text-text-secondary bg-bg border border-border rounded">
                  {distanceLabel}
                </span>
              )}
            </div>

            {/* Website link + Compare toggle */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {facility.website && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] md:text-xs border border-saunako text-saunako rounded-full px-2.5 py-0.5 hover:bg-saunako hover:text-white transition-colors w-fit cursor-pointer"
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
                </button>
              )}
              <button
                type="button"
                aria-pressed={isCompared}
                className={`inline-flex items-center gap-1 text-[11px] md:text-xs border rounded-full px-2.5 py-0.5 transition-colors w-fit cursor-pointer ${
                  isCompared
                    ? 'bg-primary border-primary text-white'
                    : 'border-border text-text-secondary hover:border-primary hover:text-primary'
                }`}
                onClick={handleToggleCompare}
                data-track-click="compare_toggle"
              >
                {isCompared ? '✓ 比較中' : '＋ 比較'}
              </button>
            </div>

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
