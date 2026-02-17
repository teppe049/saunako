'use client';

import { trackExternalLinkClick } from '@/lib/analytics';

interface TrackExternalLinkProps {
  facilityId: number;
  linkType: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}

export default function TrackExternalLink({
  facilityId,
  linkType,
  href,
  className,
  children,
}: TrackExternalLinkProps) {
  const handleClick = () => {
    trackExternalLinkClick(facilityId, linkType, href);
  };

  return (
    <a
      href={href}
      target={linkType === 'phone' ? undefined : '_blank'}
      rel={linkType === 'phone' ? undefined : 'noopener noreferrer'}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
