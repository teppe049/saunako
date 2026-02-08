'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  sizes: string;
}

export default function ImageCarousel({ images, alt, sizes }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    setCurrentIndex(index);
  }, []);

  if (images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-text-tertiary text-xs">No Image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <Image src={images[0]} alt={alt} fill sizes={sizes} className="object-cover" />
    );
  }

  return (
    <div className="relative w-full h-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {images.map((img, i) => (
          <div key={i} className="relative flex-shrink-0 w-full h-full snap-start">
            <Image src={img} alt={`${alt} ${i + 1}`} fill sizes={sizes} className="object-cover" />
          </div>
        ))}
      </div>
      {/* Dot indicators */}
      {images.length > 1 && images.length <= 5 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
      {images.length > 5 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-white/80 text-[10px] bg-black/40 px-1.5 py-0.5 rounded-full">
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  );
}
