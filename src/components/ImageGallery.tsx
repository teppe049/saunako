'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  facilityName: string;
}

export default function ImageGallery({ images, facilityName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div>
      {/* メイン画像: モバイル全幅240px角丸なし、PC padding内rounded */}
      <div className="relative h-60 md:h-96 bg-gray-200 rounded-none md:rounded-xl md:mt-0 flex items-center justify-center overflow-hidden">
        {images.length > 0 ? (
          <Image
            src={images[selectedIndex]}
            alt={facilityName}
            fill
            sizes="(max-width: 768px) 100vw, 880px"
            className="object-cover"
          />
        ) : (
          <span className="text-text-tertiary">No Image</span>
        )}
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
    </div>
  );
}
