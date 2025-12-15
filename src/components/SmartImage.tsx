'use client';

import Image from 'next/image';
import { useState } from 'react';
import { DEFAULT_IMAGE, getImageUrl } from '@/utils/imageHelper';

type Props = {
  src?: string;
  alt?: string;
  className?: string;
  fill?: boolean;
};

export default function SmartImage({
  src,
  alt = '',
  className,
  fill = true,
}: Props) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(src));

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      className={className}
      onError={() => setImgSrc(DEFAULT_IMAGE)}
    />
  );
}
