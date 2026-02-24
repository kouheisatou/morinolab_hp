'use client';

import { useState, ReactNode } from 'react';
import Image from 'next/image';

interface ThumbnailIconProps {
  src: string;
  alt: string;
  fallbackIcon: ReactNode;
  className?: string;
}

export function ThumbnailIcon({
  src,
  alt,
  fallbackIcon,
  className = '',
}: ThumbnailIconProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return <div className={className}>{fallbackIcon}</div>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      onError={handleImageError}
    />
  );
}
