"use client";

import Image from "next/image";
import { useState } from "react";
import { DEFAULT_IMAGE, getImageUrl } from "@/utils/imageHelper";

type Props = {
  src?: string;
  alt?: string;
  className?: string;

  // layout
  fill?: boolean;
  width?: number;
  height?: number;
};

export default function SmartImage({
  src,
  alt = "",
  className,

  fill,
  width,
  height,
}: Props) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(src));

  const isFill = fill ?? (!width || !height);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      fill={isFill}
      width={!isFill ? width : undefined}
      height={!isFill ? height : undefined}
      onError={() => {
        if (imgSrc !== DEFAULT_IMAGE) {
          setImgSrc(DEFAULT_IMAGE);
        }
      }}
    />
  );
}
