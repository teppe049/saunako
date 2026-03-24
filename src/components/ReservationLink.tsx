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
      href={`/go/${facilityId}?dest=booking`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="flex items-center justify-center gap-2 w-full text-white text-lg font-semibold rounded-[10px] h-14 bg-saunako hover:opacity-90 transition-opacity"
    >
      予約ページを見る →
    </a>
  );
}
