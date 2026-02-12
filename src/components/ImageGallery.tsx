'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  facilityName: string;
}

export default function ImageGallery({ images, facilityName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowLeft') setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    if (e.key === 'ArrowRight') setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [lightboxOpen, images.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Body scroll lock
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  return (
    <div>
      {/* メイン画像: モバイル全幅240px角丸なし、PC padding内rounded */}
      <div
        className="relative h-60 md:h-96 bg-gray-200 rounded-none md:rounded-xl md:mt-0 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => images.length > 0 && setLightboxOpen(true)}
      >
        <Image
          src={images.length > 0 ? images[selectedIndex] : '/placeholder-facility.svg'}
          alt={facilityName}
          fill
          sizes="(max-width: 768px) 100vw, 880px"
          className={images.length > 0 ? 'object-cover' : 'object-contain p-8'}
        />
      </div>
      {/* サムネイル: 画像が1枚以下の場合は非表示 */}
      {images.length > 1 && (
        <div className="flex gap-1 md:gap-2 overflow-x-auto py-1 px-0 md:pb-2 md:pt-2">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative flex-shrink-0 w-[60px] h-[60px] md:w-16 md:h-16 bg-gray-200 rounded-lg overflow-hidden cursor-pointer ${
                i === selectedIndex
                  ? 'ring-2 ring-primary'
                  : 'hover:ring-2 hover:ring-primary'
              }`}
            >
              <Image
                src={img}
                alt={`${facilityName} ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev - 1 + images.length) % images.length); }}
              className="absolute left-4 text-white/80 hover:text-white z-10"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="relative w-full h-full max-w-4xl max-h-[80vh] mx-16" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedIndex]}
              alt={`${facilityName} ${selectedIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedIndex((prev) => (prev + 1) % images.length); }}
              className="absolute right-4 text-white/80 hover:text-white z-10"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
