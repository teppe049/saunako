'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { subscribe, getSnapshot, getServerSnapshot, toggleFavorite } from '@/lib/favoritesStore';

interface FavoriteButtonProps {
  facilityId: number;
  size?: 'sm' | 'md';
}

export default function FavoriteButton({ facilityId, size = 'sm' }: FavoriteButtonProps) {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isFav = favorites.includes(facilityId);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(facilityId);
  }, [facilityId]);

  const iconSize = size === 'sm' ? 18 : 22;

  const bgStyle = size === 'sm'
    ? { backgroundColor: isFav ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.3)' }
    : {};

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full transition-colors ${
        size === 'sm' ? 'w-9 h-9' : 'w-11 h-11 border border-border hover:bg-gray-100'
      } ${isFav ? 'text-saunako' : size === 'sm' ? 'text-white/80 hover:text-white' : 'text-text-tertiary hover:text-saunako'}`}
      style={bgStyle}
      aria-label={isFav ? 'お気に入りから削除' : 'お気に入りに追加'}
      data-track-click="favorite_toggle"
      data-track-facility={facilityId}
    >
      <Heart
        size={iconSize}
        fill={isFav ? 'currentColor' : 'none'}
        strokeWidth={isFav ? 0 : 2}
      />
    </button>
  );
}
