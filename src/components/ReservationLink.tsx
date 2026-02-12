'use client';

import { trackReservationClick } from '@/lib/analytics';

interface ReservationLinkProps {
  facilityId: number;
  facilityName: string;
  website: string;
}

export default function ReservationLink({
  facilityId,
  facilityName,
  website,
}: ReservationLinkProps) {
  const handleClick = () => {
    trackReservationClick(facilityId, facilityName, website);
  };

  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex items-center justify-center gap-2 w-full text-white font-semibold rounded-[10px] h-12 md:h-[52px] bg-saunako hover:opacity-90 transition-opacity"
    >
      公式サイトで予約する
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
