'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facility } from '@/lib/types';
import { trackFacilityCardClick, trackExternalLinkClick } from '@/lib/analytics';

interface FacilityCardProps {
  facility: Facility;
  index?: number;
  showComment?: boolean;
}

export default function FacilityCard({ facility, index = 0, showComment = true }: FacilityCardProps) {
  const handleClick = () => {
    trackFacilityCardClick(facility.id, facility.name, index);
  };

  return (
    <Link href={`/facilities/${facility.id}`} onClick={handleClick} className="card block hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative h-40 bg-gray-200 rounded-t-xl flex items-center justify-center overflow-hidden">
        <Image
          src={facility.images.length > 0 ? facility.images[0] : '/placeholder-facility.svg'}
          alt={facility.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={facility.images.length > 0 ? 'object-cover' : 'object-contain p-4'}
        />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-text-primary mb-1">{facility.name}</h3>

        {facility.nearestStation && facility.walkMinutes > 0 && (
          <p className="text-sm text-text-secondary mb-2">
            {facility.nearestStation}{facility.nearestStation.includes('駅') ? '' : '駅'} 徒歩{facility.walkMinutes}分
          </p>
        )}

        <p className="text-sm text-text-primary mb-2">
          {facility.priceMin > 0 ? (
            <>
              <span className="font-bold">{facility.priceMin.toLocaleString()}円</span>
              <span className="text-text-secondary">〜 / {facility.duration}分</span>
              {facility.plans && facility.plans.length > 1 && (
                <span className="text-text-tertiary text-xs ml-1.5">({facility.plans.length}プラン)</span>
              )}
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
            <span className="tag tag-available">男女OK</span>
          )}
        </div>

        {/* Saunako comment */}
        {showComment && facility.saunakoCommentShort && (
          <div className="saunako-comment text-sm">
            <span className="text-saunako font-bold">サウナ子</span>
            <span className="text-text-secondary ml-1">「{facility.saunakoCommentShort}」</span>
          </div>
        )}

        {/* Website link */}
        {facility.website && (
          <a
            href={facility.website}
            className="inline-flex items-center gap-1 text-xs border border-saunako text-saunako rounded-full px-3 py-1 hover:bg-saunako hover:text-white transition-colors mt-2"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              trackExternalLinkClick(facility.id, 'website', facility.website!);
              window.open(facility.website, '_blank', 'noopener,noreferrer');
            }}
          >
            公式サイトへ
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </Link>
  );
}
